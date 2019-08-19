import urljoin from "url-join";
import {joinFullname} from "./common";
import Cube from "./cube";
import Dimension from "./dimension";
import {ClientError} from "./errors";
import Hierarchy from "./hierarchy";
import {Annotated, Annotations, Drillable, Property, Serializable} from "./interfaces";

const INTRINSIC_PROPERTIES = ["Caption", "Key", "Name", "UniqueName"];

class Level implements Annotated, Drillable, Serializable {
  public annotations: Annotations = {};
  public caption?: string;
  public depth: number;
  public hierarchy: Hierarchy;
  public name: string;
  public properties: Property[] = [];

  public readonly isDrillable: boolean = true;
  private readonly isLevel: boolean = true;

  constructor(
    name: string,
    annotations: Annotations,
    properties: Property[],
    depth: number,
    caption: string
  ) {
    this.annotations = annotations;
    this.caption = caption || name;
    this.depth = depth;
    this.name = name;
    this.properties = properties;
  }

  static fromJSON(json: any): Level {
    return new Level(
      json["name"],
      json["annotations"],
      json["properties"],
      json["depth"],
      json["caption"]
    );
  }

  static isLevel(obj: any): obj is Level {
    return Boolean(obj && obj.isLevel);
  }

  get cube(): Cube {
    return this.hierarchy.dimension.cube;
  }

  get dimension(): Dimension {
    return this.hierarchy.dimension;
  }

  get fullname(): string {
    return joinFullname(this.fullnameParts);
  }

  get fullnameParts(): string[] {
    const nameParts = [this.dimension.name];
    if (this.dimension.name !== this.hierarchy.name) {
      nameParts.push(this.hierarchy.name);
    }
    nameParts.push(this.name);
    return nameParts;
  }

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new ClientError(`Annotation ${key} does not exist in level ${this.fullname}.`);
    }
    return defaultValue;
  }

  hasProperty(propertyName: string): boolean {
    return (
      INTRINSIC_PROPERTIES.indexOf(propertyName) > -1 ||
      this.properties.some(prop => prop.name === propertyName)
    );
  }

  toJSON(): any {
    return {
      annotations: this.annotations,
      caption: this.caption,
      depth: this.depth,
      fullname: this.fullname,
      name: this.name,
      properties: this.properties,
      uri: this.toString()
    };
  }

  toString(): string {
    return urljoin(this.hierarchy.toString(), "levels", encodeURIComponent(this.name));
  }
}

export default Level;

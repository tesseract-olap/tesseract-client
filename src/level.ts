import urljoin from "url-join";

import {Annotations, Drillable, JSONObject, Property} from "./common";
import Cube from "./cube";
import Dimension from "./dimension";
import {AnnotationMissingError} from "./errors";
import Hierarchy from "./hierarchy";

const LEVEL_INTRINSIC_PROPERTIES = ["Caption", "Key", "Name", "UniqueName"];

export default class Level implements Drillable {
  public annotations: Annotations = {};
  public hierarchy: Hierarchy;
  public isDrillable: boolean = true;
  public name: string;
  public properties: Property[] = [];

  constructor(name: string, annotations: Annotations, properties: Property[]) {
    this.annotations = annotations;
    this.name = name;
    this.properties = properties;
  }

  static fromJSON(root: JSONObject): Level {
    return new Level(root["name"], root["annotations"], root["properties"]);
  }

  get cube(): Cube {
    return this.hierarchy.dimension.cube;
  }

  get dimension(): Dimension {
    return this.hierarchy.dimension;
  }

  get fullName(): string {
    const nameParts = [this.dimension.name];
    if (this.dimension.name !== this.hierarchy.name) {
      nameParts.push(this.hierarchy.name);
    }
    nameParts.push(this.name);
    return nameParts.join(".");
  }

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new AnnotationMissingError(this.fullName, "level", key);
    }
    return defaultValue;
  }

  hasProperty(propertyName: string): boolean {
    return (
      this.properties.some(prop => prop.name === propertyName) ||
      LEVEL_INTRINSIC_PROPERTIES.indexOf(propertyName) > -1
    );
  }

  toJSON(): JSONObject {
    return {
      annotations: this.annotations,
      name: this.name,
      properties: this.properties
    };
  }

  toString() {
    return urljoin(this.hierarchy.toString(), "levels", this.name);
  }
}

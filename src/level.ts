import urljoin from "url-join";

import {Annotations, JSONObject} from "./common";
import Dimension from "./dimension";
import {AnnotationMissingError} from "./errors";
import Hierarchy from "./hierarchy";

const LEVEL_INTRINSIC_PROPERTIES = ["Caption", "Key", "Name", "UniqueName"];

export default class Level {
  public caption?: string;
  public depth: number;
  public fullName: string;
  public hierarchy: Hierarchy;
  public name: string;

  public annotations: Annotations = {};
  public properties: string[] = [];

  constructor(name: string, annotations: Annotations) {
    this.annotations = annotations;
    this.name = name;
  }

  static fromJSON(root: JSONObject): Level {
    return new Level(root["name"], root["annotations"]);
  }

  get dimension(): Dimension {
    return this.hierarchy.dimension;
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
      this.properties.indexOf(propertyName) > -1 ||
      LEVEL_INTRINSIC_PROPERTIES.indexOf(propertyName) > -1
    );
  }

  membersPath(key?: string): string {
    return urljoin(this.hierarchy.toString(), "levels", this.name, "members", key);
  }

  toJSON(): string {
    return JSON.stringify({
      name: this.name
    });
  }

  toString() {
    return urljoin(this.hierarchy.toString(), "levels", this.name);
  }
}

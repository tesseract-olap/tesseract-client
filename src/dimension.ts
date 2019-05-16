import urljoin from "url-join";

import {
  Annotations,
  DimensionType,
  dimensionTypeFromString,
  dimensionTypeToString,
  JSONObject
} from "./common";
import Cube from "./cube";
import {AnnotationMissingError} from "./errors";
import Hierarchy from "./hierarchy";
import Level from "./level";

export default class Dimension {
  public annotations: Annotations;
  public caption: string;
  public cube: Cube;
  public dimensionType: DimensionType;
  public hierarchies: Hierarchy[];
  public name: string;

  constructor(
    name: string,
    caption: string | null,
    dimensionType: DimensionType,
    hierarchies: Hierarchy[],
    annotations: Annotations
  ) {
    this.annotations = annotations;
    this.caption = caption;
    this.dimensionType = dimensionType;
    this.hierarchies = hierarchies;
    this.name = name;

    hierarchies.forEach(hie => {
      hie.dimension = this;
    });
  }

  static fromJSON(root: JSONObject): Dimension {
    return new Dimension(
      root["name"],
      root["caption"],
      dimensionTypeFromString(root["type"]),
      root["hierarchies"].map(Hierarchy.fromJSON),
      root["annotations"]
    );
  }

  get fullName(): string {
    return `[${this.name}]`;
  }

  findHierarchy(hierarchyName: string, elseFirst?: boolean): Hierarchy {
    const hierarchies = this.hierarchies;
    const count = hierarchies.length;
    for (let i = 0; i < count; i++) {
      if (hierarchies[i].name === hierarchyName) {
        return hierarchies[i];
      }
    }
    return elseFirst ? hierarchies[0] : null;
  }

  findLevel(levelName: string, elseFirst?: boolean): Level {
    const hierarchies = this.hierarchies;
    const count = hierarchies.length;
    for (let i = 0; i < count; i++) {
      const level = hierarchies[i].findLevel(levelName);
      if (level) {
        return level;
      }
    }
    return elseFirst ? hierarchies[0].levels[1] : null;
  }

  findLevels(levelName: string): Level[] {
    const foundLevels = [];
    const hierarchies = this.hierarchies;
    const count = hierarchies.length;
    for (let i = 0; i < count; i++) {
      const level = hierarchies[i].findLevel(levelName);
      if (level) {
        foundLevels.push(level);
      }
    }
    return foundLevels;
  }

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new AnnotationMissingError(this.fullName, "dimension", key);
    }
    return defaultValue;
  }

  toJSON(): string {
    return JSON.stringify({
      annotations: this.annotations,
      caption: this.caption,
      type: dimensionTypeToString(this.dimensionType),
      hierarchies: this.hierarchies,
      name: this.name
    });
  }

  toString(): string {
    return urljoin(this.cube.toString(), this.name);
  }
}

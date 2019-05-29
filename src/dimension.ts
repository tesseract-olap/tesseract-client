import urljoin from "url-join";

import {Annotations, DimensionType, JSONObject} from "./common";
import Cube from "./cube";
import {AnnotationMissingError} from "./errors";
import Hierarchy from "./hierarchy";
import Level from "./level";

export default class Dimension {
  public annotations: Annotations;
  public cube: Cube;
  public defaultHierarchy: string;
  public dimensionType: DimensionType;
  public hierarchies: Hierarchy[];
  public name: string;

  constructor(
    name: string,
    dimensionType: DimensionType,
    hierarchies: Hierarchy[],
    defaultHierarchy: string,
    annotations: Annotations
  ) {
    this.annotations = annotations;
    this.dimensionType = dimensionType;
    this.hierarchies = hierarchies;
    this.defaultHierarchy = defaultHierarchy;
    this.name = name;

    hierarchies.forEach(hie => {
      hie.dimension = this;
    });
  }

  static fromJSON(root: JSONObject): Dimension {
    return new Dimension(
      root["name"],
      Dimension.typeFromString(root["type"]),
      root["hierarchies"].map(Hierarchy.fromJSON),
      root["default_hierarchy"],
      root["annotations"]
    );
  }

  static types = DimensionType;

  static typeFromString(value: string): DimensionType {
    switch (value) {
      case "time":
        return DimensionType.Time;

      case "standard":
      default:
        return DimensionType.Standard;

      // throw new TypeError(`${value} is not a valid DimensionType`);
    }
  }

  static typeToString(dimensionType: DimensionType): string {
    switch (dimensionType) {
      case DimensionType.Time:
        return "time";

      case DimensionType.Standard:
        return "standard";

      default:
        throw new TypeError(`${dimensionType} is not a valid DimensionType`);
    }
  }

  get fullName(): string {
    return this.name;
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
    return elseFirst ? hierarchies[0].levels[0] : null;
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
      type: Dimension.typeToString(this.dimensionType),
      hierarchies: this.hierarchies,
      name: this.name
    });
  }

  toString(): string {
    return urljoin(this.cube.toString(), "dimensions", this.name);
  }
}

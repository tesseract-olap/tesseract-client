import urljoin from "url-join";

import {
  Annotations,
  DimensionType,
  dimensionTypeFromString,
  dimensionTypeToString,
  JSONObject
} from "./common";
import Cube from "./cube";
import { AnnotationMissingError } from "./errors";

const LEVEL_INTRINSIC_PROPERTIES = new Set(["Caption", "Key", "Name", "UniqueName"]);

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

export class Hierarchy {
  public allMemberName: string;
  public dimension: Dimension;
  public levels: Level[];
  public name: string;

  constructor(name: string, allMemberName: string, levels: Level[]) {
    this.allMemberName = allMemberName;
    this.levels = levels;
    this.name = name;

    levels.forEach(lvl => {
      lvl.hierarchy = this;
    });
  }

  static fromJSON(root: JSONObject): Hierarchy {
    return new Hierarchy(
      root["name"],
      root["levels"].map(Level.fromJSON),
      root["all_member_name"]
    );
  }

  get fullName(): string {
    return `${this.dimension.fullName}.[${this.name}]`;
  }

  findLevel(levelName: string, elseFirst?: boolean) {
    const levels = this.levels;
    const count = levels.length;
    for (let i = 1; i < count; i++) {
      if (levels[i].name === levelName) {
        return levels[i];
      }
    }
    return elseFirst ? levels[1] : null;
  }

  toJSON(): string {
    return JSON.stringify({
      // TODO: clarify keys between underscore case and camelCase
      all_member_name: this.allMemberName,
      levels: this.levels,
      name: this.name
    });
  }

  toString() {
    return urljoin(this.dimension.toString(), "hierarchies", this.name);
  }
}

export class Level {
  public hierarchy: Hierarchy;
  public name: string;
  public caption?: string;
  public fullName: string;
  public depth: number;

  public annotations: Annotations = {};
  public properties: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  static fromJSON(root: JSONObject): Level {
    return new Level(root["name"]);
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
      LEVEL_INTRINSIC_PROPERTIES.has(propertyName)
    );
  }

  membersPath(key?: string | number): string {
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

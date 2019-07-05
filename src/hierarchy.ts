import urljoin from "url-join";

import Cube from "./cube";
import Dimension from "./dimension";
import {AnnotationMissingError} from "./errors";
import {Annotated, Annotations, CubeChild, JSONObject, Named} from "./interfaces";
import Level from "./level";

class Hierarchy implements Annotated, CubeChild, Named {
  public annotations: Annotations;
  public dimension: Dimension;
  public levels: Level[];
  public name: string;

  constructor(name: string, annotations: Annotations, levels: Level[]) {
    this.annotations = annotations;
    this.levels = levels;
    this.name = name;

    levels.forEach(lvl => {
      lvl.hierarchy = this;
    });
  }

  static fromJSON(root: JSONObject): Hierarchy {
    return new Hierarchy(
      root["name"],
      root["annotations"],
      root["levels"].map(Level.fromJSON)
    );
  }

  get cube(): Cube {
    return this.dimension.cube;
  }

  get fullName(): string {
    return `${this.dimension.fullName}.${this.name}`;
  }

  findLevel(levelName: string, elseFirst?: boolean): Level {
    const levels = this.levels;
    const count = levels.length;
    for (let i = 0; i < count; i++) {
      if (levels[i].name === levelName) {
        return levels[i];
      }
    }
    return elseFirst ? levels[0] : null;
  }

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new AnnotationMissingError(this.name, "cube", key);
    }
    return defaultValue;
  }

  toJSON(): JSONObject {
    return {
      annotations: this.annotations,
      fullName: this.fullName,
      levels: this.levels,
      name: this.name
    };
  }

  toString(): string {
    return urljoin(this.dimension.toString(), "hierarchies", this.name);
  }
}

export default Hierarchy;

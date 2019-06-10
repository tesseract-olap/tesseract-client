import urljoin from "url-join";

import Cube from "./cube";
import Dimension from "./dimension";
import {CubeChild, JSONObject, Named} from "./interfaces";
import Level from "./level";

class Hierarchy implements CubeChild, Named {
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
      root["all_member_name"],
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

  toJSON(): JSONObject {
    return {
      // TODO: clarify keys between underscore case and camelCase
      all_member_name: this.allMemberName,
      levels: this.levels,
      name: this.name
    };
  }

  toString(): string {
    return urljoin(this.dimension.toString(), "hierarchies", this.name);
  }
}

export default Hierarchy

import urljoin from "url-join";

import {JSONObject} from "./common";
import Dimension from "./dimension";
import Level from "./level";
import Cube from "./cube";

export default class Hierarchy {
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

  findLevel(levelName: string, elseFirst?: boolean) {
    const levels = this.levels;
    const count = levels.length;
    for (let i = 0; i < count; i++) {
      if (levels[i].name === levelName) {
        return levels[i];
      }
    }
    return elseFirst ? levels[0] : null;
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

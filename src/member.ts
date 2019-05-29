import urljoin from "url-join";

import {JSONObject} from "./common";
import Level from "./level";

class Member {
  public key: string;
  public label: string;
  public level: Level;

  constructor(key: string, label: string) {
    this.key = key;
    this.label = label;
  }

  static fromJSON(root: JSONObject) {
    return new Member(root["ID"], root["Label"]);
  }

  toJSON(): string {
    return JSON.stringify({
      ID: this.key,
      Label: this.label
    });
  }

  toString(): string {
    return urljoin(this.level.cube.toString(), `members?level=${this.key}`);
  }
}

export default Member;

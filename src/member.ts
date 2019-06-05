import urljoin from "url-join";

import {JSONObject} from "./common";
import Level from "./level";

class Member {
  public key: string;
  public name: string;
  public level: Level;

  constructor(key: string, name: string) {
    this.key = key;
    this.name = name;
  }

  static fromJSON(root: JSONObject) {
    return new Member(root["ID"], root["Label"] || root["ID"]);
  }

  get fullName() {
    return `${this.level.fullName}.${this.key}`;
  }

  toJSON(): string {
    return JSON.stringify({
      ID: this.key,
      Label: this.name
    });
  }

  toString(): string {
    return urljoin(
      this.level.cube.toString(),
      `members?level=${this.level.fullName}&key=${this.key}`
    );
  }
}

export default Member;

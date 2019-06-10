import urljoin from "url-join";

import {JSONObject, Named} from "./interfaces";
import Level from "./level";

class Member implements Named {
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

  get fullName(): string {
    return `${this.level.fullName}.${this.key}`;
  }

  toJSON(): JSONObject {
    return {
      ID: this.key,
      Label: this.name
    };
  }

  toString(): string {
    return urljoin(
      this.level.cube.toString(),
      `members?level=${this.level.fullName}&key=${this.key}`
    );
  }
}

export default Member;

import {JSONObject} from "./common";

class Member {
  public key: string | number;

  constructor(key: string | number) {
    this.key = key;
  }

  static fromJSON(root: JSONObject) {
    return new Member(root.key);
  }
}

export default Member;

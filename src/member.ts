import urljoin from "url-join";
import {joinFullname, splitFullname} from "./common";
import {Named, Serializable} from "./interfaces";
import Level from "./level";

class Member implements Named, Serializable {
  public key: string;
  public level: Level;
  public name: string;

  private readonly isMember: boolean = true;

  constructor(key: string, name: string) {
    this.key = key;
    this.name = name;
  }

  static fromJSON(json: any): Member {
    return new Member(json["ID"], json["Label"] || json["ID"]);
  }

  static isMember(obj: any): obj is Member {
    return Boolean(obj && obj.isMember);
  }

  get caption(): string {
    return this.name;
  }

  get fullname(): string {
    const nameParts = splitFullname(this.level.fullname);
    nameParts.push(this.key);
    return joinFullname(nameParts);
  }

  toJSON(): any {
    return {
      caption: this.caption,
      fullname: this.fullname,
      key: this.key,
      name: this.name,
      uri: this.toString()
    };
  }

  toString(): string {
    return urljoin(
      this.level.cube.toString(),
      `members?level=${encodeURIComponent(this.level.fullname)}&key=${this.key}`
    );
  }
}

export default Member;

import {Annotations, JSONObject} from "./common";
import Cube from "./cube";
import Dimension from "./dimension";
import Level from "./level";

class NamedSet {
  public annotations: Annotations;
  public cube: Cube;
  public level: Level;
  public name: string;

  constructor(name: string, level: Level, annotations: Annotations) {
    this.annotations = annotations;
    this.level = level;
    this.name = name;
  }

  static fromJSON(dimensions: Dimension[], root: JSONObject): NamedSet {
    const dim = dimensions.find(d => d.name == root["dimension"]);
    const hie = dim.findHierarchy(root["hierarchy"]);
    const level = hie.findLevel(root["level"]);
    return new NamedSet(root["name"], level, root["annotations"]);
  }

  get fullName(): string {
    return this.name;
  }
}

export default NamedSet;

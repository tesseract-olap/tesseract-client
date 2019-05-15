import {Annotations, JSONObject} from "./common";
import Cube from "./cube";
import Dimension, {Level} from "./dimension";

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

  static fromJSON(root: JSONObject, dimensions: Dimension[]): NamedSet {
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

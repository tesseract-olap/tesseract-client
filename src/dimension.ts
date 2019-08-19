import urljoin from "url-join";
import {DimensionType} from "./common";
import Cube from "./cube";
import Hierarchy from "./hierarchy";
import {Annotations, CubeChild, Named, Serializable} from "./interfaces";
import Level from "./level";
import {Annotated, applyMixins} from "./mixins";

class Dimension implements CubeChild, Named, Serializable {
  readonly annotations: Annotations = {};
  cube: Cube;
  readonly defaultHierarchy: string;
  readonly dimensionType: DimensionType;
  readonly hierarchies: Hierarchy[];
  readonly isDimension: boolean = true;
  readonly name: string;

  constructor(
    name: string,
    annotations: Annotations,
    dimensionType: DimensionType,
    hierarchies: Hierarchy[],
    defaultHierarchy: string
  ) {
    this.annotations = annotations || {};
    this.defaultHierarchy = defaultHierarchy;
    this.dimensionType = dimensionType;
    this.hierarchies = hierarchies;
    this.name = name;

    hierarchies.forEach(hie => {
      hie.dimension = this;
    });
  }

  static fromJSON(json: any): Dimension {
    return new Dimension(
      json["name"],
      json["annotations"],
      Dimension.typeFromString(json["type"]),
      json["hierarchies"].map(Hierarchy.fromJSON),
      json["default_hierarchy"]
    );
  }

  static isDimension(obj: any): obj is Dimension {
    return Boolean(obj && obj.isDimension);
  }

  static timeType = DimensionType.Time;
  static standardType = DimensionType.Standard;
  static geographicType = DimensionType.Geographic;

  static typeFromString(value: string): DimensionType {
    switch (value) {
      case "geo":
      case "geographic":
        return DimensionType.Geographic;

      case "date":
      case "time":
      case "year":
        return DimensionType.Time;

      default:
        return DimensionType.Standard;
    }
  }

  static typeToString(dimensionType: DimensionType): string {
    switch (dimensionType) {
      case DimensionType.Geographic:
        return "geographic";

      case DimensionType.Standard:
        return "standard";

      case DimensionType.Time:
        return "time";

      default:
        throw new TypeError(`${dimensionType} is not a valid DimensionType`);
    }
  }

  get caption(): string {
    return this.annotations["caption"] || this.name;
  }

  get fullname(): string {
    return this.name;
  }

  get fullnameParts(): string[] {
    return [this.name];
  }

  findHierarchy(hierarchyName: string, elseFirst?: boolean): Hierarchy {
    const hierarchies = this.hierarchies;
    const count = hierarchies.length;
    for (let i = 0; i < count; i++) {
      if (hierarchies[i].name === hierarchyName) {
        return hierarchies[i];
      }
    }
    return elseFirst === true ? hierarchies[0] : null;
  }

  findLevel(levelName: string, elseFirst?: boolean): Level {
    const hierarchies = this.hierarchies;
    const count = hierarchies.length;
    for (let i = 0; i < count; i++) {
      const level = hierarchies[i].findLevel(levelName);
      if (level) {
        return level;
      }
    }
    return elseFirst === true ? hierarchies[0].levels[0] : null;
  }

  toJSON(): any {
    const serialize = (obj: Serializable) => obj.toJSON();
    return {
      annotations: this.annotations,
      caption: this.caption,
      fullname: this.fullname,
      hierarchies: this.hierarchies.map(serialize),
      name: this.name,
      type: Dimension.typeToString(this.dimensionType),
      uri: this.toString()
    };
  }

  toString(): string {
    return urljoin(this.cube.toString(), "dimensions", encodeURIComponent(this.name));
  }
}

interface Dimension extends Annotated {}

applyMixins(Dimension, [Annotated]);

export default Dimension;

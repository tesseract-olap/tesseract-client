import urljoin from "url-join";

import {Annotations, DimensionType, JSONObject, splitFullNameParts} from "./common";
import Dimension, {Level} from "./dimension";
import Measure from "./measure";
import NamedSet from "./namedset";
import Query from "./query";
import {
  AnnotationMissingError,
  PropertyMissingError,
  DimensionMissingError,
  MeasureMissingError
} from "./errors";

class Cube {
  public annotations: Annotations;
  public name: string;
  public caption: string;
  public dimensions: Dimension[];
  public measures: Measure[];
  public namedSets: NamedSet[];

  public dimensionsByName: {[key: string]: Dimension} = {};
  public measuresByName: {[key: string]: Measure} = {};
  public server: string = "/";

  constructor(
    name: string,
    annotations: Annotations,
    dimensions: Dimension[],
    measures: Measure[],
    namedSets: NamedSet[]
  ) {
    this.annotations = annotations;
    this.dimensions = dimensions;
    this.measures = measures;
    this.name = name;
    this.namedSets = namedSets;

    this.caption = annotations["caption"] || name;

    dimensions.forEach(dim => {
      dim.cube = this;
      this.dimensionsByName[dim.name] = dim;
    });
    measures.forEach(msr => {
      msr.cube = this;
      this.measuresByName[msr.name] = msr;
    });
    namedSets.forEach(nst => {
      nst.cube = this;
    });
  }

  static fromJSON(root: JSONObject): Cube {
    const dimensions = root["dimensions"].map(Dimension.fromJSON);
    return new Cube(
      root["name"],
      root["annotations"],
      dimensions,
      root["measures"].map(Measure.fromJSON),
      root["named_sets"].map(ns => NamedSet.fromJSON(ns, dimensions))
    );
  }

  get defaultMeasure(): Measure {
    const measureName = this.annotations["default"];
    return this.measuresByName[measureName] || this.measures[0];
  }

  get fullName(): string {
    return `Cube.[${this.name}]`;
  }

  get query(): Query {
    return new Query(this);
  }

  get standardDimensions(): Dimension[] {
    return this.dimensions.filter(d => d.dimensionType === DimensionType.Standard);
  }

  get timeDimension(): Dimension {
    const dimensions = this.dimensions;
    const count = dimensions.length;
    for (let i = 0; i < count; i++) {
      if (dimensions[i].dimensionType === DimensionType.Time) {
        return dimensions[i];
      }
    }
    return null;
  }

  findLevel(levelName: string, elseFirst?: boolean): Level {
    const dimensions = this.dimensions;
    const count = dimensions.length;
    for (let i = 0; i < count; i++) {
      const level = dimensions[i].findLevel(levelName);
      if (level) {
        return level;
      }
    }
    return elseFirst ? dimensions[0].hierarchies[0].levels[1] : null;
  }

  findLevels(levelName: string): Level[] {
    const foundLevels: Level[] = [];
    const dimensions = this.dimensions;
    const count = dimensions.length;
    for (let i = 0; i < count; i++) {
      const levels = dimensions[i].findLevels(levelName);
      foundLevels.push(...levels);
    }
    return foundLevels;
  }

  findNamedSet(namedSetName: string, elseFirst?: boolean): NamedSet {
    const namedSets = this.namedSets;
    const count = namedSets.length;
    for (let i = 0; i < count; i++) {
      if (namedSets[i].name === namedSetName) {
        return namedSets[i];
      }
    }
    return elseFirst ? namedSets[0] : null;
  }

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new AnnotationMissingError(this.name, "cube", key);
    }
    return defaultValue;
  }

  getDimension(dimensionName: string) {
    if (dimensionName in this.measuresByName) {
      return this.measuresByName[dimensionName];
    }
    throw new DimensionMissingError(this.name, dimensionName);
  }

  getMeasure(measureName: string): Measure {
    if (measureName in this.measuresByName) {
      return this.measuresByName[measureName];
    }
    throw new MeasureMissingError(this.name, measureName);
  }

  queryFullName(fullname: string | string[]): Measure | Dimension | Level {
    const nameParts =
      typeof fullname === "string" ? splitFullNameParts(fullname) : fullname;

    if (nameParts[0] === "Measure") {
      return this.measuresByName[nameParts[1]];
    }

    const partCount = nameParts.length;
    const dimName = nameParts[0];
    const hieName = nameParts[1];
    const lvlName = partCount === 2 ? nameParts[1] : nameParts[2];

    const dimension = this.dimensionsByName[dimName];
    if (dimension) {
      if (partCount === 1) {
        return dimension;
      }
      const hierarchy = dimension.findHierarchy(hieName);
      if (hierarchy) {
        return hierarchy.findLevel(lvlName);
      }
    }

    return null;
  }

  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      annotations: this.annotations,
      dimensions: this.dimensions,
      measures: this.measures,
      namedSets: this.namedSets
    });
  }

  toString(): string {
    return urljoin(this.server, "cubes", this.name);
  }
}

export default Cube;

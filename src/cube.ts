import urljoin from "url-join";

import {Annotations, DimensionType, JSONObject, splitFullNameParts} from "./common";
import Dimension from "./dimension";
import {
  AnnotationMissingError,
  DimensionMissingError,
  MeasureMissingError
} from "./errors";
import Level from "./level";
import Measure from "./measure";
import Query from "./query";

class Cube {
  public annotations: Annotations;
  public dimensions: Dimension[];
  public dimensionsByName: {[key: string]: Dimension} = {};
  public measures: Measure[];
  public measuresByName: {[key: string]: Measure} = {};
  public name: string;
  public server: string = "/";

  constructor(
    name: string,
    annotations: Annotations,
    dimensions: Dimension[],
    measures: Measure[]
  ) {
    this.annotations = annotations;
    this.dimensions = dimensions;
    this.measures = measures;
    this.name = name;

    dimensions.forEach(dim => {
      dim.cube = this;
      this.dimensionsByName[dim.name] = dim;
    });
    measures.forEach(msr => {
      msr.cube = this;
      this.measuresByName[msr.name] = msr;
    });
  }

  static fromJSON(root: JSONObject): Cube {
    return new Cube(
      root["name"],
      root["annotations"],
      root["dimensions"].map(Dimension.fromJSON),
      root["measures"].map(Measure.fromJSON)
    );
  }

  get caption(): string {
    return this.annotations.caption || this.name;
  }

  get defaultMeasure(): Measure {
    const measureName = this.annotations["default"];
    return this.measuresByName[measureName] || this.measures[0];
  }

  get fullName(): string {
    return `Cube.${this.name}`;
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
    return elseFirst ? dimensions[0].hierarchies[0].levels[0] : null;
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

  queryFullName(fullName: string | string[]): Measure | Dimension | Level {
    const nameParts =
      typeof fullName === "string" ? splitFullNameParts(fullName) : fullName;

    if (nameParts[0] === "Measure") {
      return this.measuresByName[nameParts[1]];
    }

    // https://github.com/hwchen/tesseract/tree/master/tesseract-server#naming
    const partCount = nameParts.length;
    const dimName = nameParts[0];

    const dimension = this.dimensionsByName[dimName];
    if (dimension) {
      if (partCount === 1) {
        return dimension;
      }
      const hieName = partCount === 2 ? nameParts[0] : nameParts[1];
      const hierarchy = dimension.findHierarchy(hieName);
      if (hierarchy) {
        const lvlName = partCount === 2 ? nameParts[1] : nameParts[2];
        return hierarchy.findLevel(lvlName);
      }
    }

    return null;
  }

  toJSON(): JSONObject {
    return {
      name: this.name,
      annotations: this.annotations,
      dimensions: this.dimensions,
      measures: this.measures
    };
  }

  toString(): string {
    return urljoin(this.server, "cubes", this.name);
  }
}

export default Cube;

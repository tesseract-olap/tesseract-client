import formurlencoded from "form-urlencoded";
import urljoin from "url-join";

import {AllowedComparison, AllowedFormat, Drillable, QueryOptions} from "./common";
import Cube from "./cube";
import {
  LevelMissingError,
  MeasureMissingError,
  NotImplementedError,
  PropertyMissingError
} from "./errors";
import Level from "./level";
import Measure from "./measure";

class Query {
  public cube: Cube;

  // private limit: number;
  // private offset: number;
  // private orderDescendent: boolean;
  // private orderProperty: string;
  private captions: string[] = [];
  private cuts: string[] = [];
  private drilldowns: Drillable[] = [];
  // private filters: string[] = [];
  private measures: Measure[] = [];
  private properties: string[] = [];
  private options: QueryOptions = {
    // nonempty: true,
    // distinct: false,
    parents: false
    // debug: false,
    // sparse: true
  };

  constructor(cube: Cube) {
    this.cube = cube;
  }

  get searchObject() {
    return {
      ...this.options,
      captions: this.captions.length ? this.captions : undefined,
      cut: this.cuts.length ? this.cuts : undefined,
      drilldowns: this.drilldowns.length
        ? this.drilldowns.map(d => d.fullName)
        : undefined,
      // filter: this.filters.length ? this.filters : undefined,
      measures: this.measures.length ? this.measures.map(m => m.name) : undefined,
      // limit: this.limit,
      // offset: this.offset,
      // order_desc: this.orderDescendent,
      // order: this.orderProperty,
      properties: this.properties.length ? this.properties : undefined
    };
  }

  get searchString() {
    return formurlencoded(this.searchObject);
  }

  addCut(cut: string | Level, members: string[] = []): Query {
    if (typeof cut !== "string") {
      if (members.length === 0) {
        throw new Error(`The cut for the ${cut} object has no members.`);
      }
      cut = `${cut.fullName}.${members.join(",")}`;
    }

    this.cuts.push(cut);
    return this;
  }

  addDrilldown(drillable: string | Level): Query {
    if (typeof drillable === "string") {
      drillable = this.cube.queryFullName(drillable) as Level;
    }

    if (!drillable.isDrillable) {
      throw new TypeError(
        `Object ${drillable} is not a valid Drillable, or a string that identifies it.`
      );
    }
    if (drillable.cube !== this.cube) {
      throw new LevelMissingError(this.cube.name, drillable.fullName);
    }

    this.drilldowns.push(drillable);
    return this;
  }

  addFilter(
    measure: string | Measure,
    comparison: AllowedComparison,
    value: number
  ): Query {
    // if (typeof measure === "string") {
    //   measure = this.cube.getMeasure(measure);
    // }

    // if (measure.cube !== this.cube) {
    //   throw new MeasureMissingError(this.cube.name, measure.name);
    // }

    // this.filters.push(`${measure.name} ${comparison} ${value}`);
    // return this;
    throw new NotImplementedError();
  }

  addMeasure(measure: string | Measure): Query {
    if (typeof measure === "string") {
      measure = this.cube.getMeasure(measure);
    }

    if (measure.cube !== this.cube) {
      throw new MeasureMissingError(this.cube.name, measure.name);
    }

    this.measures.push(measure);
    return this;
  }

  addProperty(property: string): Query {
    throw new NotImplementedError();
  }

  assignQuery(query: {[key: string]: any}) {
    let i, list, count;

    // Measures
    list = query.measures || [];
    count = list.length;
    for (i = 0; i < count; i++) {
      this.addMeasure(list[i]);
    }

    // Drilldowns
    list = query.drilldowns || [];
    count = list.length;
    for (i = 0; i < count; i++) {
      this.addDrilldown(list[i]);
    }

    // Cuts
    list = query.cuts || [];
    count = list.length;
    for (i = 0; i < count; i++) {
      this.addCut(list[i]);
    }

    // Filters
    // list = query.filters || [];
    // count = list.length;
    // for (i = 0; i < count; i++) {
    //   const [measure, comparison, value] = list[i];
    //   this.addFilter(measure, comparison, value);
    // }

    // if (query.limit !== undefined) {
    //   query.setPagination(query.limit, query.offset);
    // }

    // if (query.order !== undefined) {
    //   query.setSorting(query.order, query.orderDesc);
    // }

    list = Object.keys(query.options || {});
    count = list.length;
    for (i = 0; i < count; i++) {
      const key = list[i] as keyof QueryOptions;
      this.setOption(key, query.options[key]);
    }

    return this;
  }

  getOptions(): QueryOptions {
    return {...this.options};
  }

  getPath(format: AllowedFormat = AllowedFormat.jsonrecords): string {
    return urljoin(this.cube.toString(), `aggregate.${format}`, `?${this.searchString}`);
  }

  private getProperty(...parts: string[]): string {
    if (parts.length < 3) {
      throw new Error(
        "Property specification must be Dimension.(Hierarchy).Level.Property"
      );
    }

    const pname = parts[parts.length - 1];
    const level = this.cube.queryFullName(parts) as Level;

    if (level.hasProperty(pname)) {
      return `${level.fullName}.${pname}`;
    }

    throw new PropertyMissingError(level.fullName, "level", pname);
  }

  setOption(key: keyof QueryOptions, value: boolean): Query {
    this.options[key] = value;
    return this;
  }

  setPagination(limit: number, offset: number = 0): Query {
    // if (limit > 0) {
    //   this.limit = limit;
    //   this.offset = offset;
    // }
    // else {
    //   this.limit = undefined;
    //   this.offset = undefined;
    // }
    // return this;
    throw new NotImplementedError();
  }

  setSorting(props: string | string[], descendent?: boolean): Query {
    // if (typeof props === "string") {
    //   const measure: Measure = this.cube.getMeasure(props);
    //   this.orderProperty = measure.fullName;
    // }
    // else {
    //   const property: string = this.getProperty(...props);
    //   this.orderProperty = property;
    // }
    // this.orderDescendent = descendent;
    // return this;
    throw new NotImplementedError();
  }
}

export default Query;

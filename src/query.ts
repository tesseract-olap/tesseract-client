import formurlencoded from "form-urlencoded";
import urljoin from "url-join";

import {AllowedComparison, AllowedFormat, AllowedOrder} from "./common";
import Cube from "./cube";
import {
  InvalidDrillable,
  InvalidDrillableIdentifier,
  LevelMissingError,
  MeasureMissingError,
  NotImplementedError,
  PropertyMissingError
} from "./errors";
import {Drillable, JSONObject, QueryOptions} from "./interfaces";
import Level from "./level";
import Measure from "./measure";
import Member from "./member";

class Query {
  public cube: Cube;

  // private limit: number;
  // private offset: number;
  // private orderDescendent: boolean;
  // private orderProperty: string;
  private calculatedGrowth: string;
  private calculatedRca: string;
  private calculatedTop: string;
  private captions: string[] = [];
  private cuts: string[] = [];
  private drilldowns: Drillable[] = [];
  // private filters: string[] = [];
  private measures: Measure[] = [];
  private options: QueryOptions = {
    // nonempty: true,
    // distinct: false,
    parents: false
    // debug: false,
    // sparse: true
  };
  private properties: string[] = [];

  constructor(cube: Cube) {
    this.cube = cube;
  }

  get searchString() {
    return formurlencoded(this.toJSON());
  }

  addCut(cut: string | Level, members: string[] | Member[] = []): Query {
    if (typeof cut !== "string") {
      if (members.length === 0) {
        throw new Error(`The cut for the ${cut} object has no members.`);
      }
      const memberToString = (member: string | Member): string =>
        typeof member !== "string" ? member.key : member;
      members = Array.from(members, memberToString);
      cut = `${cut.fullName}.${members.join(",")}`;
    }

    this.cuts.push(cut);
    return this;
  }

  addDrilldown(identifier: string | Level): Query {
    const cube = this.cube;

    const drillable =
      typeof identifier === "string"
        ? cube.queryFullName(identifier) as Level
        : identifier;

    if (!drillable) {
      throw new InvalidDrillableIdentifier(identifier);
    }
    if (!drillable.isDrillable) {
      throw new InvalidDrillable(drillable);
    }
    if (drillable.cube !== cube) {
      throw new LevelMissingError(cube.name, drillable.fullName);
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

  addMeasure(measureIdentifier: string | Measure): Query {
    const cube = this.cube;

    const measure =
      typeof measureIdentifier === "string"
        ? cube.getMeasure(measureIdentifier)
        : measureIdentifier;

    if (measure.cube !== cube) {
      throw new MeasureMissingError(cube.name, measure.name);
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

  setGrowth(lvlRef: string | Level, msrRef: string | Measure): Query {
    const cube = this.cube;

    const level = typeof lvlRef === "string" ? cube.queryFullName(lvlRef) : lvlRef;
    if (!level || level.cube !== cube) {
      throw new LevelMissingError(cube.name, level.name);
    }

    const measure = typeof msrRef === "string" ? cube.getMeasure(msrRef) : msrRef;
    if (measure.cube !== cube) {
      throw new MeasureMissingError(cube.name, measure.name);
    }

    this.calculatedGrowth = `${level.fullName},${measure.name}`;
    return this;
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

  setRCA(
    lvlRef1: string | Level,
    lvlRef2: string | Level,
    msrRef: string | Measure
  ): Query {
    const cube = this.cube;

    const level1 = typeof lvlRef1 === "string" ? cube.queryFullName(lvlRef1) : lvlRef1;
    if (!level1 || level1.cube !== cube) {
      throw new LevelMissingError(cube.name, level1.name);
    }

    const level2 = typeof lvlRef2 === "string" ? cube.queryFullName(lvlRef2) : lvlRef2;
    if (!level2 || level2.cube !== cube) {
      throw new LevelMissingError(cube.name, level2.name);
    }

    const measure = typeof msrRef === "string" ? cube.getMeasure(msrRef) : msrRef;
    if (measure.cube !== cube) {
      throw new MeasureMissingError(cube.name, measure.name);
    }

    this.calculatedRca = `${level1.name},${level2.name},${measure.name}`;
    return this;
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

  setTop(
    amount: number,
    lvlRef: string | Level,
    msrRef: string | Measure,
    order: AllowedOrder = AllowedOrder.desc
  ): Query {
    const cube = this.cube;

    if (!isFinite(amount) || isNaN(amount)) {
      throw new TypeError(`Argument "amount" is not a number, value "${amount}"`);
    }

    const level = typeof lvlRef === "string" ? cube.queryFullName(lvlRef) : lvlRef;
    if (!level || level.cube !== cube) {
      throw new LevelMissingError(cube.name, level.name);
    }

    const measure = typeof msrRef === "string" ? cube.getMeasure(msrRef) : msrRef;
    if (measure.cube !== cube) {
      throw new MeasureMissingError(cube.name, measure.name);
    }

    this.calculatedTop = `${amount},${level.name},${measure.name},${order}`;
    return this;
  }

  toJSON(): JSONObject {
    return {
      ...this.options,
      captions: this.captions.length ? this.captions : undefined,
      cuts: this.cuts.length ? this.cuts : undefined,
      drilldowns: this.drilldowns.length
        ? this.drilldowns.map(d => d.fullName)
        : undefined,
      // filter: this.filters.length ? this.filters : undefined,
      growth: this.calculatedGrowth,
      measures: this.measures.length ? this.measures.map(m => m.name) : undefined,
      // limit: this.limit,
      // offset: this.offset,
      // order_desc: this.orderDescendent,
      // order: this.orderProperty,
      properties: this.properties.length ? this.properties : undefined,
      rca: this.calculatedRca,
      top: this.calculatedTop
    };
  }
}

export default Query;

import formurlencoded from "form-urlencoded";

import Cube from "./cube";
import Measure from "./measure";
import {PropertyMissingError, DimensionMissingError} from "./errors";
import {Level} from "./index";
import NamedSet from "./namedset";
import {splitFullNameParts} from "./common";

export type Drillable = Level | NamedSet;

class Query {
  private limit: number;
  private offset: number;
  private orderDescendent: boolean;
  private orderProperty: string;
  private captions: string[] = [];
  private cuts: string[] = [];
  private drilldowns: Drillable[] = [];
  private filters: string[] = [];
  private measures: Measure[] = [];
  private properties: string[] = [];
  private options: {[key: string]: boolean} = {
    nonempty: true,
    distinct: false,
    parents: false,
    debug: false,
    sparse: true
  };

  public cube: Cube;

  constructor(cube: Cube) {
    this.cube = cube;
  }

  get searchObject() {
    return {
      ...this.options,
      caption: this.captions.length ? this.captions : undefined,
      cut: this.cuts.length ? this.cuts : undefined,
      drilldown: this.drilldowns.length
        ? this.drilldowns.map(d => d.fullName)
        : undefined,
      filter: this.filters.length ? this.filters : undefined,
      measures: this.measures.length ? this.measures.map(m => m.name) : undefined,
      limit: this.limit,
      offset: this.offset,
      order_desc: this.orderDescendent,
      order: this.orderProperty,
      properties: this.properties.length ? this.properties : undefined
    };
  }

  get searchString() {
    return formurlencoded(this.searchObject);
  }

  addCut(cut) {}

  addDrilldown(fullName: string | string[]) {
    const nameParts =
      typeof fullName === "string" ? splitFullNameParts(fullName) : fullName;

    let drillable: Drillable;
    if (nameParts.length === 1) {
      drillable = this.cube.findNamedSet(nameParts[0]);
    }
    else {
      drillable = this.cube.queryFullName(nameParts) as Level;
    }
    this.drilldowns.push(drillable);

    return this;
  }

  addFilter(measureName: string, comparison: string, value: number): Query {
    const measure: Measure = this.cube.getMeasure(measureName);
    const filter = `${measure.name} ${comparison} ${value}`;
    this.filters.push(filter);

    return this;
  }

  addMeasure(measure) {}

  addProperty(property) {}

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
      let item = list[i];
      if (typeof item !== "string") {
        const {level, members} = item;
        item = members.map(key => `${level}.&[${key}]`).join(",");
        if (members.length > 1) {
          item = `{${item}}`;
        }
      }
      this.addCut(item);
    }

    // Filters
    list = query.filters || [];
    count = list.length;
    for (i = 0; i < count; i++) {
      const [measure, comparison, value] = list[i];
      this.addFilter(measure, comparison, value);
    }

    if (query.limit) {
      query.setPagination(query.limit, query.offset);
    }

    if (query.order) {
      query.setSorting(query.order, query.orderDesc);
    }

    list = Object.keys(query.options || {});
    count = list.length;
    for (i = 0; i < count; i++) {
      const item = list[i];
      this.setOption(item, query.options[item]);
    }

    return this;
  }

  getOptions() {
    return this.options;
  }

  setPagination(limit: number, offset: number = 0) {
    if (limit > 0) {
      this.limit = limit;
      this.offset = offset;
    }
    else {
      this.limit = undefined;
      this.offset = undefined;
    }
    return this;
  }

  setSorting(props: string | string[], descendent?: boolean) {
    if (typeof props === "string") {
      const measure: Measure = this.cube.getMeasure(props);
      this.orderProperty = measure.fullName;
    }
    else {
      const property: string = this.getProperty(...props);
      this.orderProperty = property;
    }
    this.orderDescendent = descendent;
    return this;
  }

  setOption(key: string, value: boolean) {
    this.options[key] = value;
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
}

export default Query;

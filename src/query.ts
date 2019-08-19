import formurlencoded from "form-urlencoded";
import urljoin from "url-join";
import {
  AllowedComparison,
  AllowedFormat,
  AllowedOrder,
  parseCut,
  pushUnique,
  splitFullname,
  stringifyCut
} from "./common";
import Cube from "./cube";
import {ClientError} from "./errors";
import {CubeChild, Drillable, QueryOptions, Serializable} from "./interfaces";
import Level from "./level";
import Measure from "./measure";
import Member from "./member";

class Query implements CubeChild, Serializable {
  readonly cube: Cube;
  calculatedGrowth: string;
  calculatedRCA: string;
  calculatedTop: string;
  readonly captions: string[] = [];
  readonly cuts: {[drillable: string]: string[]} = {};
  readonly drilldowns: string[] = [];
  readonly filters: string[] = [];
  limit: number;
  readonly measures: string[] = [];
  offset: number;
  orderDescendent: boolean;
  orderProperty: string;
  readonly properties: string[] = [];

  private options: QueryOptions = {
    // nonempty: true,
    // distinct: false,
    parents: false,
    // debug: false,
    sparse: true
  };

  constructor(cube: Cube) {
    this.cube = cube;
  }

  get aggregateObject(): any {
    const cuts = Object.keys(this.cuts)
      .map(drillable => stringifyCut(drillable, this.cuts[drillable]))
      .filter(Boolean);
    return {
      ...this.options,
      captions: this.captions.length ? this.captions : undefined,
      cuts: cuts.length ? cuts : undefined,
      drilldowns: this.drilldowns.length ? this.drilldowns : undefined,
      filter: this.filters.length ? this.filters : undefined,
      growth: this.calculatedGrowth,
      limit: this.limit,
      measures: this.measures.length ? this.measures : undefined,
      offset: this.offset,
      order_desc: this.orderDescendent,
      order: this.orderProperty,
      properties: this.properties.length ? this.properties : undefined,
      rca: this.calculatedRCA,
      top: this.calculatedTop
    };
  }

  get logicLayerObject(): any {
    const cube = this.cube;
    // TODO: implement uniqueName when available
    const escapeCommas = (dd: string) => (dd.includes(",") ? `[${dd}]` : dd);
    const onlyLevelName = (dd: string) => dd.split(".").pop();
    const output: any = {
      ...this.options,
      cube: cube.name,
      drilldowns: this.drilldowns.map(onlyLevelName).join(",") || undefined,
      measures: this.measures.join(",") || undefined
    };

    Object.keys(this.cuts).forEach(drillableFullname => {
      const members = this.cuts[drillableFullname];
      if (members.length > 0) {
        const level = cube.getLevel(drillableFullname);
        // TODO: use level.uniqueName when implemented
        output[level.name] = members;
      }
    });

    if (this.calculatedGrowth) {
      const growth = this.calculatedGrowth.split(",");
      growth[0] = onlyLevelName(growth[0]);
      output.growth = growth.join(",");
    }

    if (this.calculatedRCA) {
      const rca = this.calculatedRCA.split(",");
      rca[0] = onlyLevelName(rca[0]);
      rca[1] = onlyLevelName(rca[1]);
      output.rca = rca.join(",");
    }

    if (this.calculatedTop) {
      const top = this.calculatedTop.split(",");
      top[1] = onlyLevelName(top[1]);
      output.top = top.join(",");
    }

    return output;
  }

  addCaption(level: string | Level, property: string): Query {
    const propertyFullname = this.getProperty(level, property);
    this.captions.push(propertyFullname);
    return this;
  }

  addCut(cut: string | Level, memberList: string[] | Member[] = []): Query {
    let drillable: Drillable, members: string[];
    const memberToString = (member: string | Member): string =>
      Member.isMember(member) ? member.key : member;

    if (Level.isLevel(cut) || memberList.length > 0) {
      drillable = this.cube.getLevel(cut);
    }
    else {
      const [parsedDrillable, parsedMembers] = parseCut(cut);
      drillable = this.cube.getLevel(parsedDrillable);
      const normalizedMembers = Array.from(memberList, memberToString);
      parsedMembers.forEach(member => pushUnique(normalizedMembers, member));
      memberList = normalizedMembers;
    }

    members = this.cuts[drillable.fullname] || [];
    memberList.forEach((member: string | Member) =>
      pushUnique(members, memberToString(member))
    );
    this.cuts[drillable.fullname] = members;

    return this;
  }

  addDrilldown(lvlIdentifier: string | Level): Query {
    const level = this.cube.getLevel(lvlIdentifier);
    pushUnique(this.drilldowns, level.fullname);
    return this;
  }

  addFilter(
    msrIdentifier: string | Measure,
    comparison: AllowedComparison,
    value: number
  ): Query {
    const measure = this.cube.getMeasure(msrIdentifier);
    const filter = `${measure.name} ${comparison} ${value}`;
    pushUnique(this.filters, filter);
    return this;
  }

  addMeasure(msrIdentifier: string | Measure): Query {
    const measure = this.cube.getMeasure(msrIdentifier);
    pushUnique(this.measures, measure.name);
    return this;
  }

  addProperty(lvlIdentifier: string | Level, propertyName: string): Query {
    const property = this.getProperty(lvlIdentifier, propertyName);
    if (property) {
      pushUnique(this.properties, property);
    }
    return this;
  }

  getOptions(): QueryOptions {
    return {...this.options};
  }

  getAggregateUrl(format?: AllowedFormat): string {
    const dotFormat = format ? `.${format}` : "";
    const parameters = formurlencoded(this.aggregateObject, {
      ignorenull: true,
      skipIndex: true,
      sorted: true
    });
    return urljoin(this.cube.toString(), `aggregate${dotFormat}?${parameters}`);
  }

  getLogicLayerUrl(format?: AllowedFormat): string {
    const dotFormat = format ? `.${format}` : "";
    const parameters = formurlencoded(this.logicLayerObject, {
      ignorenull: true,
      skipIndex: true,
      sorted: true
    });
    return urljoin(this.cube.server, `data${dotFormat}?${parameters}`);
  }

  private getProperty(lvlIdentifier: string | Level, propertyName?: string): string {
    let level: Level;

    if (typeof lvlIdentifier === "string") {
      const nameParts = splitFullname(lvlIdentifier);
      if (!propertyName) {
        propertyName = nameParts.pop();
      }
      level = this.cube.getLevel(nameParts);
    }
    else {
      level = this.cube.getLevel(lvlIdentifier);
    }

    if (!level.hasProperty(propertyName)) {
      throw new ClientError(`Property ${propertyName} does not exist in level ${level.fullname}`);
    }

    return `${level.fullname}.${propertyName}`;
  }

  setGrowth(lvlIdentifier: string | Level, msrIdentifier: string | Measure): Query {
    const level = this.cube.getLevel(lvlIdentifier);
    const measure = this.cube.getMeasure(msrIdentifier);
    this.calculatedGrowth = `${level.fullname},${measure.name}`;
    return this;
  }

  setOption(option: keyof QueryOptions, value: boolean): Query {
    if (!this.options.hasOwnProperty(option)) {
      throw new ClientError(`Option ${option} is not a valid option.`);
    }
    this.options[option] = value;
    return this;
  }

  setPagination(limit: number, offset: number): Query {
    if (limit > 0) {
      this.limit = limit;
      this.offset = offset || 0;
    }
    else {
      this.limit = undefined;
      this.offset = undefined;
    }
    return this;
  }

  setRCA(
    lvlIdentifier1: string | Level,
    lvlIdentifier2: string | Level,
    msrIdentifier: string | Measure
  ): Query {
    const cube = this.cube;
    const level1 = cube.getLevel(lvlIdentifier1);
    const level2 = cube.getLevel(lvlIdentifier2);
    const measure = cube.getMeasure(msrIdentifier);
    this.calculatedRCA = `${level1.fullname},${level2.fullname},${measure.name}`;
    return this;
  }

  setSorting(msrIdentifier: string | Measure, direction: boolean) {
    if (Measure.isMeasure(msrIdentifier)) {
      this.orderProperty = msrIdentifier.name;
      this.orderDescendent = direction;
    }
    else {
      const measure = this.cube.measuresByName[msrIdentifier];
      this.orderProperty = measure ? measure.name : this.getProperty(msrIdentifier);
      this.orderDescendent = direction;
    }
    return this;
  }

  setTop(
    amount: number,
    lvlIdentifier: string | Level,
    msrIdentifier: string | Measure,
    order: AllowedOrder = AllowedOrder.desc
  ): Query {
    const cube = this.cube;

    if (!isFinite(amount) || isNaN(amount)) {
      throw new TypeError(`Invalid number in argument "amount": ${amount}`);
    }
    const level = cube.getLevel(lvlIdentifier);
    const measure = cube.getMeasure(msrIdentifier);

    this.calculatedTop = `${amount},${level.fullname},${measure.name},${order}`;
    return this;
  }

  toJSON(): any {
    const serverUrl = this.cube.server;
    return {
      serverUrl,
      aggregatePath: this.getAggregateUrl().replace(serverUrl, ""),
      logicLayerPath: this.getLogicLayerUrl().replace(serverUrl, ""),
      cube: this.cube.name,
      ...this.aggregateObject
    };
  }

  toString(): string {
    return this.getAggregateUrl();
  }
}

interface Query {}

export default Query;

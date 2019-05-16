export class Aggregation {
  data: any;
  url: string;
  options: {[option: string]: boolean};

  constructor(data: any, url: string, options: {[option: string]: boolean}) {
    this.data = data;
    this.url = url;
    this.options = options;
  }
}

export enum AggregatorType {
  AVG = "AVG",
  COUNT = "COUNT",
  MAX = "MAX",
  MIN = "MIN",
  SUM = "SUM",
  UNKNOWN = "UNKNOWN"
}

export enum AllowedFormat {
  json = "json",
  csv = "csv",
  xls = "xls",
  jsonrecords = "jsonrecords"
}

export enum DimensionType {
  Standard,
  Time
}

export interface Annotations {
  [key: string]: string;
}

export interface JSONObject {
  [key: string]: any;
}

export function dimensionTypeFromString(value: string): DimensionType {
  switch (value) {
    case "time":
      return DimensionType.Time;

    case "standard":
      return DimensionType.Standard;

    default:
      throw new TypeError(`${value} is not a valid DimensionType`);
  }
}

export function dimensionTypeToString(dimensionType: DimensionType): string {
  switch (dimensionType) {
    case DimensionType.Time:
      return "time";

    case DimensionType.Standard:
      return "standard";

    default:
      throw new TypeError(`${dimensionType} is not a valid DimensionType`);
  }
}

export function splitFullNameParts(fullName: string) {
  return fullName.replace(/^\[?(.+)\]?$/, "$1").split(/\]\.\[?|\]?\.\[/);
}

export const FORMATS: {[key: string]: string} = {
  json: "application/json",
  csv: "text/csv",
  xls: "application/vnd.ms-excel",
  jsonrecords: "application/x-jsonrecords"
};

export const MAX_GET_URI_LENGTH = 2000;

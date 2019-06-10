export enum AggregatorType {
  AVG = "AVG",
  COUNT = "COUNT",
  MAX = "MAX",
  MIN = "MIN",
  SUM = "SUM",
  UNKNOWN = "UNKNOWN"
}

export enum AllowedComparison {
  eq = "=",
  gt = ">",
  gte = ">=",
  lt = "<",
  lte = "<="
}

export enum AllowedFormat {
  csv = "csv",
  jsonrecords = "jsonrecords"
}

export enum AllowedOrder {
  asc = "asc",
  desc = "desc"
}

export enum DimensionType {
  Geographic = "geo",
  Standard = "std",
  Time = "time"
}

export interface Aggregation {
  data: any[];
  url: string;
  options: QueryOptions;
}

export interface Annotations {
  [key: string]: string;
}

export interface Drillable extends NamedObject {
  isDrillable: boolean;
}

export interface NamedObject {
  name: string;
  fullName: string;
}

export interface JSONObject {
  [key: string]: any;
}

export interface Property {
  name: string;
  annotations: Annotations;
}

export interface QueryOptions {
  debug?: boolean;
  distinct?: boolean;
  nonempty?: boolean;
  parents?: boolean;
  sparse?: boolean;
}

export interface ServerStatus {
  status: string;
  url: string;
  version: string;
}

export function splitFullNameParts(fullName: string) {
  // this is safe because tesseract splits on dots first
  // https://github.com/hwchen/tesseract/blob/master/tesseract-server/README.md#naming
  return fullName.split(".");
}

export type Arrayify<T> = {[P in keyof T]: Array<T[P]>};

export const FORMATS: {readonly [K in AllowedFormat]: string} = {
  [AllowedFormat.csv]: "text/csv",
  [AllowedFormat.jsonrecords]: "application/x-jsonrecords"
};

export const MAX_GET_URI_LENGTH = 2000;

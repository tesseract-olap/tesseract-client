export enum AggregatorType {
  AVG = "AVG",
  COUNT = "COUNT",
  MAX = "MAX",
  MIN = "MIN",
  SUM = "SUM",
  UNKNOWN = "UNKNOWN"
}

export enum AllowedComparisons {
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

export enum DimensionType {
  Standard,
  Time
}

export interface Aggregation {
  data: any[];
  url: string;
  options: QueryOptions;
}

export interface Annotations {
  [key: string]: string;
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

export function splitFullNameParts(fullName: string) {
  // this is safe because tesseract splits on dots first
  // https://github.com/hwchen/tesseract/blob/master/tesseract-server/README.md#naming
  return fullName.split(".");
}

export const FORMATS: {readonly [K in AllowedFormat]: string} = {
  [AllowedFormat.csv]: "text/csv",
  [AllowedFormat.jsonrecords]: "application/x-jsonrecords"
};

export const MAX_GET_URI_LENGTH = 2000;

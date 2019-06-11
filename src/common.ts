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

export function pushUnique<T>(target: T[], item: T) {
  return target.indexOf(item) === -1 ? target.push(item) : target.length;
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

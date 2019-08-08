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

export function joinFullname(nameParts: string[]): string {
  return nameParts.some((token: string) => token.indexOf(".") > -1)
    ? nameParts.map((token: string) => `[${token}]`).join(".")
    : nameParts.join(".");
}

export function parseCut(cut: string): [string, string[]] {
  const nameParts = splitFullname(cut);
  const members = nameParts.pop().split(",");
  const drillable = joinFullname(nameParts);
  return [drillable, members];
}

export function pushUnique<T>(target: T[], item: T) {
  return target.indexOf(item) === -1 ? target.push(item) : target.length;
}

export function splitFullname(fullname: string): string[] {
  if (!fullname) return undefined;
  fullname = `${fullname}`.replace(/^\[|\]$/g, "");
  return fullname.indexOf("].[") > -1 ? fullname.split(/\]\.\[?/) : fullname.split(".");
}

export function stringifyCut(drillable: string, members: string[] = []) {
  return members.length > 0 ? joinFullname([drillable, members.join(",")]) : undefined;
}

export const FORMATS: {readonly [K in AllowedFormat]: string} = {
  [AllowedFormat.csv]: "text/csv",
  [AllowedFormat.jsonrecords]: "application/x-jsonrecords"
};

export const MAX_GET_URI_LENGTH = 2000;

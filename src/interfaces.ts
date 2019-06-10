import {Cube} from ".";

export interface Aggregation {
  data: any[];
  url: string;
  options: QueryOptions;
}

export interface Annotated {
  annotations: Annotations;
  getAnnotation(key: string, defaultValue?: string): string;
  name: string;
}

export interface Annotations {
  [key: string]: string;
}

export interface CubeChild {
  cube: Cube;
}

export interface Drillable extends CubeChild, Named {
  isDrillable: boolean;
}

export interface Named {
  name: string;
  fullName: string;
}

export interface JSONObject {
  [key: string]: any;
}

export interface Property {
  annotations: Annotations;
  name: string;
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

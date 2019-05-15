import {AxiosResponse} from "axios";

export class InvalidServerError extends Error {
  constructor(url) {
    super(`The URL "${url}" is not a valid Tesseract OLAP server.`);
  }
}

export class QueryServerError extends Error {
  status: number;
  body: string;

  constructor(response: AxiosResponse<any>) {
    super();

    try {
      if (typeof response.data === "string") {
        this.message = JSON.parse(response.data).error;
      }
      else {
        this.message = response.data.error;
      }
    } catch (e) {
      this.message = response.statusText;
    }

    this.status = response.status;
    this.body = response.data;
  }
}

export class PropertyMissingError extends ReferenceError {
  constructor(ownerName, ownerType, propName, propType = "property") {
    super(`The "${propName}" ${propType} doesn't exist in ${ownerType} "${ownerName}".`);
  }
}

export class AnnotationMissingError extends PropertyMissingError {
  constructor(ownerName, ownerType, annKey) {
    super(ownerName, ownerType, annKey, "annotation");
  }
}

export class DimensionMissingError extends PropertyMissingError {
  constructor(cubeName, dimName) {
    super(cubeName, "cube", dimName, "dimension");
  }
}

export class MeasureMissingError extends PropertyMissingError {
  constructor(cubeName, msrName) {
    super(cubeName, "cube", msrName, "measure");
  }
}

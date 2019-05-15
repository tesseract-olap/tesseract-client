import urljoin from "url-join";

import {AggregatorType, Annotations, JSONObject} from "./common";
import Cube from "./cube";
import { AnnotationMissingError } from "./errors";

class Measure {
  public aggregatorType: AggregatorType;
  public annotations: Annotations;
  public caption: string;
  public cube: Cube;
  public fullName: string;
  public name: string;

  constructor(
    name: string,
    fullName: string,
    caption: string,
    annotations: Annotations,
    aggregatorType: AggregatorType
  ) {
    this.aggregatorType = aggregatorType;
    this.annotations = annotations;
    this.caption = caption;
    this.fullName = fullName;
    this.name = name;
  }

  static fromJSON(root: JSONObject) {
    return new Measure(
      root["name"],
      root["full_name"] || `Measures.[${root["name"]}]`,
      root["caption"] || root["name"],
      root["annotations"],
      root["aggregator"] || AggregatorType.UNKNOWN
    );
  }

  getAnnotation(key: string, defaultValue?: string): string {
    if (key in this.annotations) {
      return this.annotations[key];
    }
    if (defaultValue === undefined) {
      throw new AnnotationMissingError(this.name, "measure", key);
    }
    return defaultValue;
  }

  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      full_name: this.fullName,
      caption: this.caption,
      annotations: this.annotations,
      aggregator: this.aggregatorType
    });
  }

  toString() {
    return urljoin(this.cube.toString(), `#/measures/${this.name}`);
  }
}

export default Measure;

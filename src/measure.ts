import urljoin from "url-join";

import {AggregatorType, Annotations, JSONObject} from "./common";
import Cube from "./cube";
import {AnnotationMissingError} from "./errors";

class Measure {
  public aggregatorType: AggregatorType;
  public annotations: Annotations;
  public cube: Cube;
  public name: string;

  constructor(name: string, annotations: Annotations, aggregatorType: AggregatorType) {
    this.aggregatorType = aggregatorType;
    this.annotations = annotations;
    this.name = name;
  }

  static fromJSON(root: JSONObject) {
    return new Measure(
      root["name"],
      root["annotations"],
      root["aggregator"] || AggregatorType.UNKNOWN
    );
  }

  get fullName(): string {
    return `Measures.${this.name}`;
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
      aggregator: this.aggregatorType,
      annotations: this.annotations,
      name: this.name
    });
  }

  toString() {
    return urljoin(this.cube.toString(), `#/measures/${this.name}`);
  }
}

export default Measure;

import urljoin from "url-join";

import {AggregatorType} from "./common";
import Cube from "./cube";
import {AnnotationMissingError} from "./errors";
import {Annotated, Annotations, CubeChild, JSONObject, Named} from "./interfaces";

class Measure implements Annotated, CubeChild, Named {
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

  toJSON(): JSONObject {
    return {
      aggregator: this.aggregatorType,
      annotations: this.annotations,
      name: this.name,
      uri: this.toString()
    };
  }

  toString(): string {
    return urljoin(this.cube.toString(), `#/measures/${encodeURIComponent(this.name)}`);
  }
}

export default Measure;

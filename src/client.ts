import axios, {AxiosResponse} from "axios";
import urljoin from "url-join";

import {
  Aggregation,
  AllowedFormat,
  Annotations,
  FORMATS,
  JSONObject,
  MAX_GET_URI_LENGTH
} from "./common";
import Cube from "./cube";
import {InvalidServerError, PropertyMissingError, QueryServerError} from "./errors";
import Level from "./level";
import Member from "./member";
import Query from "./query";

class Client {
  public annotations: Annotations = {};
  public baseUrl: string;
  public serverOnline: string;
  public serverVersion: string;

  private cache: {[key: string]: Cube} = {};
  private cacheFilled: boolean = false;

  constructor(url: string) {
    if (!url) {
      throw new InvalidServerError(url);
    }

    this.baseUrl = url;
  }

  checkStatus(): Promise<any> {
    return axios(this.baseUrl).then(
      (response: AxiosResponse<JSONObject>) => {
        this.serverVersion = response.data.tesseract_version;
        this.serverOnline = response.data.status;
        return {
          status: this.serverOnline,
          url: this.baseUrl,
          version: this.serverVersion
        };
      },
      () => {
        this.serverOnline = "unavailable";
      }
    );
  }

  cube(cubeName: string): Promise<Cube> {
    if (cubeName in this.cache) {
      const cube = this.cache[cubeName];
      return Promise.resolve(cube);
    }

    const url = urljoin(this.baseUrl, "cubes", cubeName);
    return axios.get(url).then((response: AxiosResponse<JSONObject>) => {
      const cube = Cube.fromJSON(response.data);
      cube.server = this.baseUrl;
      this.cache[cube.name] = cube;
      return cube;
    });
  }

  cubes(): Promise<Cube[]> {
    if (this.cacheFilled) {
      const cubes = Object.keys(this.cache).map(cubeName => this.cache[cubeName]);
      return Promise.resolve(cubes);
    }

    const url = urljoin(this.baseUrl, "cubes");
    return axios.get(url).then((response: AxiosResponse<JSONObject>) => {
      const data = response.data;
      if (Array.isArray(data.cubes)) {
        this.cacheFilled = true;
        return data.cubes.map((protoCube: JSONObject) => {
          if (protoCube.name in this.cache) {
            return this.cache[protoCube.name];
          }
          else {
            const cube = Cube.fromJSON(protoCube);
            cube.server = this.baseUrl;
            this.cache[cube.name] = cube;
            return cube;
          }
        });
      }

      throw new InvalidServerError(this.baseUrl);
    });
  }

  execQuery(
    query: Query,
    format: AllowedFormat = AllowedFormat.csv,
    method: string = "AUTO"
  ): Promise<Aggregation> {
    const urlroot = urljoin(query.cube.toString(), `aggregate.${format}`);
    const search = query.searchString;
    const url = urlroot + `?${search}`;

    if (method == "AUTO") {
      method = url.length > MAX_GET_URI_LENGTH ? "POST" : "GET";
    }

    const headers: any = {Accept: FORMATS[format]};
    const request: any = {url, method, headers};
    if (method == "POST") {
      request.url = urlroot;
      request.method = "POST";
      request.headers["Content-Type"] =
        "application/x-www-form-urlencoded; charset=utf-8";
      request["data"] = search;
    }

    return axios(request).then((response: AxiosResponse<JSONObject>) => {
      if (response.status > 199 && response.status < 300) {
        return {
          data: response.data.data,
          url,
          options: query.getOptions()
        };
      }
      throw new QueryServerError(response);
    });
  }

  members(level: Level, caption?: string): Promise<Member[]> {
    const format: AllowedFormat = AllowedFormat.jsonrecords;
    const url = urljoin(level.cube.toString(), `members.${format}`);
    const params: any = {level: level.fullName};

    if (caption) {
      if (!level.hasProperty(caption)) {
        throw new PropertyMissingError(level.fullName, "level", caption);
      }
      params["caption"] = caption;
    }

    return axios({url, params}).then((response: AxiosResponse<JSONObject>) =>
      response.data["members"].map((protoMember: JSONObject) => {
        const member = Member.fromJSON(protoMember);
        member.level = level;
        return member;
      })
    );
  }

  toString(): string {
    return this.baseUrl;
  }
}

export default Client;

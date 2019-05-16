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

class Server {
  public baseUrl: string;
  public serverOnline: boolean;
  public serverVersion: string;
  public annotations: Annotations = {};

  private cache: {[key: string]: Cube} = {};
  private cacheFilled: boolean = false;

  constructor(url: string) {
    if (!url) {
      throw new InvalidServerError(url);
    }

    this.baseUrl = url;
  }

  checkStatus(): Promise<void> {
    return axios(this.baseUrl).then(
      (response: AxiosResponse<JSONObject>) => {
        this.serverVersion = response.data.version;
        this.serverOnline = true;
      },
      () => {
        this.serverOnline = false;
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

  members(
    level: Level,
    includeChildren: boolean = false,
    caption?: string
  ): Promise<Member[]> {
    const url = level.membersPath();
    const params: any = {};

    if (includeChildren) {
      params["children"] = true;
    }

    if (caption) {
      if (!level.hasProperty(caption)) {
        throw new PropertyMissingError(level.fullName, "level", caption);
      }
      params["caption"] = caption;
    }

    return axios({url, params}).then((response: AxiosResponse<JSONObject>) =>
      response.data["members"].map(Member.fromJSON)
    );
  }

  member(
    level: Level,
    key: string,
    includeChildren: boolean = false,
    caption?: string
  ): Promise<Member> {
    const url = level.membersPath(key);
    const params: any = {};

    if (includeChildren) {
      params["children"] = true;
    }

    if (caption) {
      if (!level.hasProperty(caption)) {
        throw new PropertyMissingError(level.fullName, "level", caption);
      }
      params["caption"] = caption;
    }

    return axios({url, params}).then((response: AxiosResponse<JSONObject>) =>
      Member.fromJSON(response.data)
    );
  }

  execQuery(
    query: Query,
    format: AllowedFormat = AllowedFormat.json,
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
        return new Aggregation(response.data, url, query.getOptions());
      }
      throw new QueryServerError(response);
    });
  }
}

export default Server;

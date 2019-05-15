import axios from "axios";
import urljoin from "url-join";

import {Aggregation, Annotations, FORMATS, MAX_GET_URI_LENGTH} from "./common";
import Cube from "./cube";
import {Level} from "./dimension";
import {InvalidServerError, PropertyMissingError, QueryServerError} from "./errors";
import Member from "./member";
import Query from "./query";

class Server {
  public baseUrl: string;
  public annotations: Annotations = {};

  private cache: {[key: string]: Cube} = {};
  private cacheFilled: boolean = false;

  constructor(url: string) {
    if (!url) {
      throw new InvalidServerError(url);
    }

    this.baseUrl = url;
  }

  cubes(): Promise<Cube[]> {
    if (this.cacheFilled) {
      const cubes = Object.keys(this.cache).map(cubeName => this.cache[cubeName]);
      return Promise.resolve(cubes);
    }

    const url = urljoin(this.baseUrl, "cubes");
    return axios.get(url).then(response => {
      const data = response.data;
      if (Array.isArray(data.cubes)) {
        this.cacheFilled = true;
        return data.cubes.map(protoCube => {
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

  cube(cubeName): Promise<Cube> {
    if (cubeName in this.cache) {
      const cube = this.cache[cubeName];
      return Promise.resolve(cube);
    }

    const url = urljoin(this.baseUrl, "cubes", cubeName);
    return axios.get(url).then(response => {
      const cube = Cube.fromJSON(response.data);
      cube.server = this.baseUrl;
      this.cache[cube.name] = cube;
      return cube;
    });
  }

  members(
    level: Level,
    includeChildren: boolean = false,
    caption?: string
  ): Promise<Member[]> {
    const url = level.membersPath();
    const params = {};

    if (includeChildren) {
      params["children"] = true;
    }

    if (caption) {
      if (!level.hasProperty(caption)) {
        throw new PropertyMissingError(level.fullName, "level", caption);
      }
      params["caption"] = caption;
    }

    return axios({url, params}).then(rsp => rsp.data["members"].map(Member.fromJSON));
  }

  member(
    level: Level,
    key: string,
    includeChildren: boolean = false,
    caption?: string
  ): Promise<Member> {
    const url = level.membersPath(key);
    const params = {};

    if (includeChildren) {
      params["children"] = true;
    }

    if (caption) {
      if (!level.hasProperty(caption)) {
        throw new PropertyMissingError(level.fullName, "level", caption);
      }
      params["caption"] = caption;
    }

    return axios({url, params}).then(rsp => Member.fromJSON(rsp.data));
  }

  execQuery(
    query: Query,
    format: string = "json",
    method: string = "AUTO"
  ): Promise<Aggregation> {
    const search = query.searchString;
    const urlroot = urljoin(query.cube.toString(), `aggregate.${format}`);
    const url = urlroot + `?${search}`;
    const request = {url, method, headers: {Accept: FORMATS[format]}};

    if (method == "AUTO") {
      method = url.length > MAX_GET_URI_LENGTH ? "POST" : "GET";
    }

    if (method == "POST") {
      request.url = urlroot;
      request.method = "POST";
      request.headers["Content-Type"] =
        "application/x-www-form-urlencoded; charset=utf-8";
      request["data"] = search;
    }

    return axios(request).then(rsp => {
      if (rsp.status > 199 && rsp.status < 300) {
        return new Aggregation(rsp.data, url, query.getOptions());
      }
      throw new QueryServerError(rsp);
    });
  }
}

export default Server;

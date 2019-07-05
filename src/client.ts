import axios, {AxiosError, AxiosResponse} from "axios";
import urljoin from "url-join";

import {AllowedFormat, FORMATS, MAX_GET_URI_LENGTH} from "./common";
import Cube from "./cube";
import {InvalidServerError, PropertyMissingError, QueryServerError} from "./errors";
import {Aggregation, Annotations, JSONObject, ServerStatus} from "./interfaces";
import Level from "./level";
import Member from "./member";
import Query from "./query";

class Client {
  public annotations: Annotations = {};
  public baseUrl: string;
  public serverOnline: string;
  public serverVersion: string;

  private cache: {[key: string]: Promise<Cube>} = {};
  private cacheAll: Promise<Cube[]>;

  constructor(url: string) {
    if (!url) {
      throw new InvalidServerError(url);
    }

    this.baseUrl = url;
  }

  checkStatus(): Promise<ServerStatus> {
    return axios.get(this.baseUrl).then(
      (response: AxiosResponse<JSONObject>) => {
        this.serverVersion = response.data.tesseract_version;
        this.serverOnline = response.data.status;
        return {
          status: this.serverOnline,
          url: this.baseUrl,
          version: this.serverVersion
        };
      },
      (err: AxiosError) => {
        this.serverOnline = "unavailable";
        throw err;
      }
    );
  }

  cube(cubeName: string): Promise<Cube> {
    const url = urljoin(this.baseUrl, "cubes", cubeName);
    const cubePromise =
      this.cache[cubeName] ||
      axios.get(url).then((response: AxiosResponse<JSONObject>) => {
        const cube = Cube.fromJSON(response.data);
        cube.server = this.baseUrl;
        this.cache[cube.name] = Promise.resolve(cube);
        return cube;
      });
    this.cache[cubeName] = cubePromise;
    return cubePromise;
  }

  cubes(): Promise<Cube[]> {
    const url = urljoin(this.baseUrl, "cubes");
    const cubePromises =
      this.cacheAll ||
      axios.get(url).then((response: AxiosResponse<JSONObject>) => {
        const data = response.data;
        if (Array.isArray(data.cubes)) {
          const cubePromises = data.cubes.map((protoCube: JSONObject) => {
            if (protoCube.name in this.cache) {
              return this.cache[protoCube.name];
            }
            else {
              const cube = Cube.fromJSON(protoCube);
              cube.server = this.baseUrl;
              const cubePromise = Promise.resolve(cube);
              this.cache[cube.name] = cubePromise;
              return cubePromise;
            }
          });
          return Promise.all(cubePromises);
        }

        throw new InvalidServerError(this.baseUrl);
      });
    this.cacheAll = cubePromises;
    return cubePromises;
  }

  execQuery(
    query: Query,
    format: AllowedFormat = AllowedFormat.jsonrecords,
    method: string = "AUTO"
  ): Promise<Aggregation> {
    const url = query.getAggregateUrl(format);

    if (method == "AUTO") {
      method = url.length > MAX_GET_URI_LENGTH ? "POST" : "GET";
    }

    const headers: any = {Accept: FORMATS[format]};
    const request: any = {url, method, headers};
    if (method == "POST") {
      const searchParams = url.split("?");
      request.url = searchParams.shift();
      request.method = "POST";
      request.headers["Content-Type"] =
        "application/x-www-form-urlencoded; charset=utf-8";
      request.data = searchParams.join("?");
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
      response.data["data"].map((protoMember: JSONObject) => {
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

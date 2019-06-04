import {Aggregation, AllowedFormat} from "./common";
import Client from "./client";
import Cube from "./cube";
import Level from "./level";
import {NotOnlyCubeError} from "./errors";
import Member from "./member";
import Query from "./query";

export default class MultiClient {
  private clientList: Client[];
  private clientMap: WeakMap<Cube, Client> = new WeakMap();

  constructor(urls: string | string[]) {
    const apiList = [].concat(urls);
    this.clientList = apiList.map(apiUrl => new Client(apiUrl));
  }

  cube(
    cubeName: string,
    sorterFn: (matches: Cube[], clients: Client[]) => Cube
  ): Promise<Cube> {
    const clients = this.clientList.slice();
    return this.cubes().then(cubes => {
      const matches = cubes.filter(cube => cube.name === cubeName);
      if (!sorterFn && matches.length > 1) {
        throw new NotOnlyCubeError(cubeName);
      }
      return matches.length === 1 ? matches[0] : sorterFn(matches, clients);
    });
  }

  cubes(): Promise<Cube[]> {
    const promiseCubeList = this.clientList.map(client => client.cubes());
    return Promise.all(promiseCubeList).then(cubeList => [].concat.apply([], cubeList));
  }

  execQuery(
    query: Query,
    format?: AllowedFormat.jsonrecords,
    method?: string
  ): Promise<Aggregation> {
    const cube: Cube = query.cube;
    const client = this.getClientByCube(cube);
    return client.execQuery(query, format, method);
  }

  private findClientByCube(cube: Cube): Client {
    const client = this.clientList.find(client => client.baseUrl === cube.server);
    this.clientMap.set(cube, client);
    return client;
  }

  private getClientByCube(cube: Cube): Client {
    return this.clientMap.get(cube) || this.findClientByCube(cube);
  }

  members(
    level: Level,
    caption?: string
  ): Promise<Member[]> {
    const client = this.getClientByCube(level.cube);
    return client.members(level, caption);
  }
}

# tesseract-client ![Status DEPRECATED](https://img.shields.io/badge/status-DEPRECATED-red)

A javascript client to fetch and work with entities from a [tesseract-olap](https://www.tesseract-olap.io/) server.  
Heavily inspired by the [`mondrian-rest-client`](https://github.com/Datawheel/mondrian-rest-client) project, but with some added functionality.

> This project has been deprecated in favor of the [`@datawheel/olap-client`](https://github.com/Datawheel/olap-client) package.  
> There are some similarities in the API methods, but please check the whole documentation before migrating.

<details>
<summary>See the documentation for this package anyway</summary>

## Installation

```bash
npm install @datawheel/tesseract-client
```

## Usage

The main classes you will want to use are `Client` and `MultiClient`.

```js
import {Client as TesseractClient} from "@datawheel/tesseract-client";

const client = new TesseractClient(SERVER_URL);
```

`MultiClient` is a wrapper around the `Client` class, which allows you to use the same public methods as `Client` but with multiple remote servers at once.

```js
import {MultiClient} from "@datawheel/tesseract-client";

const client = new MultiClient([SERVER1_URL, SERVER2_URL]);
```

Notice that `MultiClient` can accept a string or an array, while `Client` just accepts a string. If you intend to work with only one `tesseract-olap` server, you can use both classes, but `Client` will perform better.

All methods in the Client classes return a Promise for the item you are requesting. You can use `.then()` chaining or the `async/await` combo to work with the returned objects:

```js
function getAllCubeNames(client) {
  return client.cubes().then(cubes => cubes.map(cube => cube.name));
}

async function getAllCubeNames(client) {
  const cubes = await client.cubes();
  return cubes.map(cube => cube.name);
}
```

We have a [migration guide](./Migration.md) for users of `mondrian-rest-client`.
The package also exports TypeScript definitions for most of the classes used.

</details>

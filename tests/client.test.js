import {Client} from "@datawheel/tesseract-client";

const client = new Client(SERVER_URL);

test("can create a basic client instance", () => {
  expect(client.baseUrl).toBe(SERVER_URL);
});

test("can ask the server about its version", async () => {
  expect.assertions(2);
  const _ = await client.checkStatus();
  expect(client.serverOnline).toBeDefined();
  expect(client.serverVersion).toBeDefined();
});

test("can fetch a single cube", async () => {
  expect.assertions(2);

  const cube = await client.cube(CUBE_NAME);
  expect(cube.name).toBe(CUBE_NAME);
  expect(client.cacheCube[CUBE_NAME]).toBeDefined();
});

test("can fetch all the cubes", async () => {
  expect.assertions(4);

  const cubes = await client.cubes();
  expect(cubes.length).toBeGreaterThanOrEqual(0);
  expect(client.cacheCubes).toBeDefined();

  const firstCube = cubes[0];
  expect(client.cacheCube[firstCube.name]).toBeDefined();

  const expectedCube = await client.cacheCube[firstCube.name];
  expect(expectedCube).toBe(firstCube);
});

test("can fetch a query", async () => {
  expect.assertions(5);

  const cube = await client.cube(CUBE_NAME);
  const query = cube.query;

  const level = cube.findLevel("Date", true);
  query.addDrilldown(level);

  const measure = cube.measures[0];
  query.addMeasure(measure);

  query.setOption("parents", false);

  const agg = await client.execQuery(query);
  expect(agg.data).toBeDefined();
  expect(agg.data.length).toBeGreaterThanOrEqual(0);
  expect(agg.options).toBeDefined();
  expect(agg.options.parents).toBe(false);
  expect(agg.url).toBeTruthy();
});

test("can fetch the members of a Level", async () => {
  expect.assertions(2);

  const cube = await client.cube(CUBE_NAME);
  const level = cube.findLevel(null, true);
  const members = await client.members(level);
  expect(members.length).toBeGreaterThanOrEqual(0);
  expect(members[0].level).toBe(level);
});

test("can get the server URL when converting to string", () => {
  const clientAsString = client.toString();
  expect(clientAsString).toBe(SERVER_URL);
});

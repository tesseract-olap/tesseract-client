import {Client} from "..";

const client = new Client(SERVER_URL);

test("can create a basic client instance", () => {
  expect(client.baseUrl).toBe(SERVER_URL);
});

test("can ask the server about its version", () => {
  client.checkStatus().then(() => {
    expect(client.serverOnline).toBeDefined();
    expect(client.serverVersion).toBeDefined();
  });
});

test("can fetch a single cube", () => {
  client.cube(CUBE_NAME).then(cube => {
    expect(cube.name).toBe(CUBE_NAME);
    expect(cube.fullName).toBe(`Cube.[${CUBE_NAME}]`);
    expect(client.cache[CUBE_NAME]).toBeDefined();
  });
});

test("can fetch all the cubes", () => {
  client.cubes().then(cubes => {
    expect(cubes.length).toBeGreaterThanOrEqual(0);
    expect(client.cacheFilled).toBe(true);
    expect(cubes[0]).toBe(client.cache[CUBE_NAME]);
  });
});

test("can fetch a query", () => {
  client.cube(CUBE_NAME).then(cube => {
    const query = cube.query;

    const level = cube.findLevel(null, true);
    query.addDrilldown(level.name);
    
    const measure = cube.measures[0];
    query.addMeasure(measure.name);
    
    const cut = ''
    query.addCut()
  }).then(query => {
    client.execQuery(query).then(agg => {
      expect(agg.url).toBeTruthy();
      expect(agg.data).toBeDefined();
      expect(agg.data.length).toBeGreaterThanOrEqual(0);
    });
  });
});

// TODO: test .members()
// TODO: test .member("")

test("can get the server URL when converting to string", () => {
  const clientAsString = client.toString();
  expect(clientAsString).toBe(SERVER_URL);
});

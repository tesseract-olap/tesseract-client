import {Client} from "@datawheel/tesseract-client";

const client = new Client(SERVER_URL);

test("can create a basic client instance", () => {
  expect(client.baseUrl).toBe(SERVER_URL);
});

test("can ask the server about its version", () => {
  return client.checkStatus().then(() => {
    expect(client.serverOnline).toBeDefined();
    expect(client.serverVersion).toBeDefined();
  });
});

test("can fetch a single cube", () => {
  return client.cube(CUBE_NAME).then(cube => {
    expect(cube.name).toBe(CUBE_NAME);
    expect(cube.fullName).toBe(`Cube.${CUBE_NAME}`);
    expect(client.cache[CUBE_NAME]).toBeDefined();
  });
});

test("can fetch all the cubes", () => {
  return client.cubes().then(cubes => {
    expect(cubes.length).toBeGreaterThanOrEqual(0);
    expect(client.cacheAll).toBeDefined();
    expect(client.cache[CUBE_NAME]).toBeDefined();
    return client.cache[CUBE_NAME].then(cube => {
      expect(cube).toBe(cubes[0]);
    });
  });
});

test("can fetch a query", () => {
  return client.cube(CUBE_NAME).then(cube => {
    const query = cube.query;

    const level = cube.findLevel("Date", true);
    query.addDrilldown(level);

    const measure = cube.measures[0];
    query.addMeasure(measure);

    query.setOption("parents", false);

    return client.execQuery(query).then(agg => {
      expect(agg.data).toBeDefined();
      expect(agg.data.length).toBeGreaterThanOrEqual(0);
      expect(agg.options).toBeDefined();
      expect(agg.options.parents).toBe(false);
      expect(agg.url).toBeTruthy();
    });
  });
});

test("can fetch the members of a Level", () => {
  return client.cube(CUBE_NAME).then(cube => {
    const level = cube.findLevel(null, true);
    return client.members(level).then(members => {
      expect(members.length).toBeGreaterThanOrEqual(0);
      expect(members[0].level).toBe(level);
    });
  });
});

test("can get the server URL when converting to string", () => {
  const clientAsString = client.toString();
  expect(clientAsString).toBe(SERVER_URL);
});

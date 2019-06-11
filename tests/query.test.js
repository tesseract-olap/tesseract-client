import {Client} from "@datawheel/tesseract-client";

let globalClient, globalCube;

beforeAll(() => {
  globalClient = new Client(SERVER_URL);
  return globalClient.cube(CUBE_NAME).then(cube => {
    globalCube = cube;
  });
});

test("can generate a valid query object", () => {
  const query = globalCube.query;
  expect(query).toBeDefined();
  expect(query.cube).toBe(globalCube);
});

describe("can handle drilldowns", () => {
  let query, level;

  beforeEach(() => {
    query = globalCube.query;
    level = globalCube.findLevel(null, true);
  });

  test("can add a drilldown from a Level object", () => {
    query.addDrilldown(level);
    expect(query.drilldowns.length).toBe(1);
  });

  test("can add a drilldown from a fullName string", () => {
    query.addDrilldown(level.fullName);
    expect(query.drilldowns.length).toBe(1);
  });

  test("can prevent adding a drilldown twice", () => {
    query.addDrilldown(level);
    query.addDrilldown(level.fullName);
    expect(query.drilldowns.length).toBe(1);
  });
});

describe("can handle measures", () => {
  let query, measure;

  beforeAll(() => {
    measure = globalCube.measures[0];
  });

  beforeEach(() => {
    query = globalCube.query;
  });

  test("can add a measure from a Measure object", () => {
    query.addMeasure(measure);
    expect(query.measures.length).toBe(1);
  });

  test("can add a measure from a name string", () => {
    query.addMeasure(measure.name);
    expect(query.measures.length).toBe(1);
  });
});

describe("can handle cuts", () => {
  let query, level, members;

  beforeAll(() => {
    level = globalCube.findLevel(null, true);
    return globalClient.members(level).then(mem => {
      members = mem;
    });
  });

  beforeEach(() => {
    query = globalCube.query;
  });

  test("can add a cut from a Level + Member[] combo", () => {
    expect(level).toBeTruthy();

    const memberList = members.slice(0, 2);
    expect(memberList.length).toBeGreaterThanOrEqual(1);

    query.addCut(level, memberList);
    expect(query.cuts.length).toBe(1);
  });

  test("can add a cut from a Level.fullName + Member.key[] combo", () => {
    const levelFullName = level.fullName;
    expect(levelFullName).toBeTruthy();

    const memberList = members.slice(0, 2).map(m => m.key);
    expect(memberList.length).toBeGreaterThanOrEqual(1);

    query.addCut(levelFullName, memberList);
    expect(query.cuts.length).toBe(1);
  });

  test("can add a cut from a formed cut string", () => {
    const levelFullName = level.fullName;
    expect(levelFullName).toBeTruthy();

    const memberList = members.slice(0, 2).map(m => m.key);
    expect(memberList.length).toBeGreaterThanOrEqual(1);

    const cut = `${levelFullName}.${memberList.join(",")}`;
    query.addCut(cut);
    expect(query.cuts.length).toBe(1);
  });

  test("can recognize an invalid cut string", () => {
    // invalid cut structure, can't get a drillable
    expect(query.addCut.bind(query, "Completely invalid")).toThrow("is not a valid identifier for a Drillable");
    // invalid drillable fullName
    expect(query.addCut.bind(query, "FakeDimension.1,2")).toThrow("is not a valid identifier for a Drillable");
    // non-existent drillable
    expect(query.addCut.bind(query, "Valid.Fullname.1,2")).toThrow("is not a valid identifier for a Drillable");
    // non-existent drillable, members through second parameter
    expect(query.addCut.bind(query, "Valid.Fullname.Structure", [1, 2])).toThrow("is not a valid identifier for a Drillable");
    // valid dimension fullName, but is not a drillable
    expect(query.addCut.bind(query, level.dimension.fullName, [1, 2])).toThrow("is not a valid Drillable");
    // members parameter must be an array
    expect(query.addCut.bind(query, level.fullName, "1,2")).toThrow(TypeError);
    // members parameter must not be empty
    expect(query.addCut.bind(query, level, [])).toThrow("object has no members");
    // nothing should have passed
    expect(query.cuts.length).toBe(0);
  })
});

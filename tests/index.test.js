import {
  Cube,
  Dimension,
  Hierarchy,
  Level,
  Measure,
  Member,
  Query,
  TesseractServer
} from "..";

test("can import class Cube", () => {
  expect(typeof Cube.fromJSON).toBe("function");
});

test("can import class Dimension", () => {
  expect(typeof Dimension.fromJSON).toBe("function");
});

test("can import class Hierarchy", () => {
  expect(typeof Hierarchy.fromJSON).toBe("function");
});

test("can import class Level", () => {
  expect(typeof Level.fromJSON).toBe("function");
});

test("can import class Measure", () => {
  expect(typeof Measure.fromJSON).toBe("function");
});

test("can import class Member", () => {
  expect(typeof Member.fromJSON).toBe("function");
});

test("can import class Query", () => {
  expect(typeof Query.prototype.getProperty).toBe("function");
});

test("can import class TesseractServer", () => {
  expect(typeof TesseractServer.prototype.execQuery).toBe("function");
});

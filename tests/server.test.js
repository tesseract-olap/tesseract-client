import {TesseractServer} from "..";

const SERVER_URL = process.env.SERVER_URL;
const server = new TesseractServer(SERVER_URL);

test("can create a basic client instance", () => {
  expect(server.baseUrl).toBe(SERVER_URL);
});

test("can ask the server about its version", () => {
  server.checkStatus().then(() => {
    expect(server.serverOnline).toBe(/* NOT UNDEFINED */);
    expect(server.serverVersion).toBe(/* NOT UNDEFINED */);
  });
});

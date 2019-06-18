import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

import {module as esModulePath, main as cjsModulePath} from "./package.json";

const environment = process.env.NODE_ENV;
const inProduction = environment === "production";
const inDevelopment = environment === "development";
const inTesting = environment === "test";
const sourcemap = inDevelopment ? "inline" : false;

const globals = {
  "axios": "axios",
  "url-join": "urljoin",
  "form-urlencoded": "formurlencoded"
};
const external = Object.keys(globals);
const reserved = external.map(key => globals[key]);

export default commandLineArgs => {
  return {
    input: "src/index.ts",
    output: [
      {
        file: cjsModulePath,
        format: "umd",
        name: "TesseractOlap",
        globals,
        external: ["axios"],
        esModule: false
      },
      {
        file: esModulePath,
        format: "esm",
        external,
        sourcemap
      }
    ],
    plugins: [
      replace({
        ENVIRONMENT: JSON.stringify(environment)
      }),
      resolve(),
      json(),
      typescript({
        useTsconfigDeclarationDir: true
      }),
      commonjs({
        include: ["node_modules/**"],
        namedExports: {}
      }),
      babel({
        exclude: "node_modules/**"
      })
    ],
    external,
    watch: {
      include: ["src/**"],
      exclude: "node_modules/**",
      clearScreen: !inProduction
    }
  };
};

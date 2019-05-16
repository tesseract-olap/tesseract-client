import {terser} from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

import {
  // browser as browserModulePath,
  module as esModulePath,
  main as cjsModulePath
} from "./package.json";

const environment = process.env.NODE_ENV;
const showSourceMaps = environment === "development";
const sourcemap = showSourceMaps ? "inline" : false;

export default commandLineArgs => {
  return {
    input: "src/index.ts",
    output: [
      {
        file: cjsModulePath,
        format: "umd",
        name: "TesseractOlap",
        globals: ["axios"],
        esModule: false
      },
      {
        file: esModulePath,
        format: "esm",
        sourcemap
      }
      // {
      //   file: esModulePath,
      //   format: "esm",
      //   sourcemap
      // },
      // {
      //   file: cjsModulePath,
      //   format: "cjs",
      //   sourcemap
      // },
      // {
      //   file: browserModulePath,
      //   format: "iife",
      //   globals: ["axios"],
      //   name: "TesseractClient",
      //   sourcemap
      // }
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
      }),
      terser({keep_classnames: true})
    ],
    external: ["axios"],
    watch: {
      include: ["src/**"],
      exclude: "node_modules/**",
      clearScreen: true
    }
  };
};

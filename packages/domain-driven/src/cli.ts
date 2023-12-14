#!/usr/bin/env node

import yargs from "yargs";
import { Freezer } from "./serialization";

yargs
  .command(
    "freeze",
    "Navigate through the current typescript project to fix serialized types over domain types",
    (builder) =>
      builder
        .option("only", {
          alias: "o",
          description: "Only run on matching pattern",
          default: undefined,
        })
        .option("erase", {
          alias: "e",
          description: "Replace the last freeze with the actual one",
          default: false,
          boolean: true,
        })
        .option("relative", {
          alias: "r",
          description:
            "Relative path from the frozen class to create serializers",
          default: ".",
        }),
    ({ erase, only, relative }) => new Freezer(relative, erase, only).freeze()
  )
  .parseSync();

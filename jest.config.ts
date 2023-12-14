import type { Config } from "jest";

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  projects: [
    {
      displayName: "server",
      roots: ["packages/server/src"],
      testEnvironment: "node",
      transform: {
        "^.+\\.ts?$": [
          "ts-jest",
          {
            isolatedModules: true,
            tsconfig: "packages/server/tsconfig.json",
          },
        ],
      },
    },
    {
      displayName: "server",
      roots: ["packages/domain-driven/src"],
      testEnvironment: "node",
      transform: {
        "^.+\\.ts?$": [
          "ts-jest",
          {
            isolatedModules: true,
            tsconfig: "packages/server/tsconfig.json",
          },
        ],
      },
    },
  ],
} satisfies Config;

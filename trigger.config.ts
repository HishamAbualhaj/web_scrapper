import { defineConfig } from "@trigger.dev/sdk";
import { syncVercelEnvVars } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_kbujzrubxqxpbyivecmb",
  dirs: ["./src/trigger"],
  build: {
    extensions: [syncVercelEnvVars()],
  },
  maxDuration: 600,
});

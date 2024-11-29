import { createRollupConfig } from "../../rollup.config.base.js";

import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

export default createRollupConfig({
    pkg,
    external: ["@repo/common"],
});

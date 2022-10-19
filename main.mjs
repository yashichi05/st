import { execSync } from "node:child_process";
import fs from "fs";
import _ from "lodash";

try {
  fs.unlinkSync("result.json");
} catch (error) {}

function loadDate() {
  return _.chain(fs.readdirSync("./csv/"))
    .map((i) => i.replace(".csv", ""))
    .sortBy()
    .value();
}

_.each(loadDate(), (i) => {
  execSync(`pnpm run test -- --date=${i}`);
  console.log(i);
});
// execSync(`pnpm run test -- --date=${20220927}`, (error, stdout, stderr) => {
//   console.log(i);
// });

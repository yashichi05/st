import csv from "csvtojson";
import fs from "fs";
import { TextDecoder } from "text-decoding";
import _ from "lodash";
import { argv } from "node:process";
import minimist from "minimist";

const jsonName = "result.json";
const args = minimist(argv.slice(2));
let result = [];
try {
  result = JSON.parse(fs.readFileSync(jsonName));
} catch (error) {}

function loadFile(date) {
  return new Promise((rs) => {
    const decoded = new TextDecoder("big5").decode(
      fs.readFileSync(`./csv/${date}.csv`, null)
    );
    csv({ noheader: true })
      .fromString(decoded)
      .then((data) => {
        rs({ date, data });
      });
  });
}


function sortData() {
  _.chain(loadDate())
    .sortBy()
    .chunk(100)
    .take(5)
    .each((item, index) => {
      const pending = _.map(item, (i) => loadFile(i));
      Promise.all(pending).then((res) => {
        const s = _.chain(res)
          .map(({ date, data }) => {
            return _.chain(data)
              .find((i) => i.field1.includes("加權股價指數"))
              .set("date", date)
              .value();
          })
          .compact()
          .value();
        fs.writeFileSync(`result${index}.json`, JSON.stringify(s));
      });
    })
    .value();
}

function saveData() {
  loadFile(args.date)
    .then(({ data, date }) => {
      return _.chain(data)
        .find((i) => i.field1.includes("加權股價指數"))
        .set("date", date)
        .value();
    })
    .then((s) => {
      if(!s) return
      fs.writeFileSync(jsonName, JSON.stringify(result.concat(s)));
    });
}

saveData();

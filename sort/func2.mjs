import loadFile from "../test/load.mjs";
import fs from "fs";
import moment from "moment";
import _ from "lodash";
import { TextDecoder } from "text-decoding";
import csv from "csvtojson";
const name = "加權股價指數";
const indexList = [];
function getDateList() {
  return _.chain(fs.readdirSync("./csv"))
    .map((i) => i.replace(".csv", ""))
    .sortBy((i) => {
      return moment(i).format("x");
    })
    .value();
}

function getIndex(date) {
  return loadFile(date).then(({ data }) => {
    const found = _.find(data, (ii) => ii.field1.includes(name));
    if (!found) return;
    indexList.push(Number(found.field2.replace(",", "")));
  });
}

const ary = getDateList();
let index = 0;
let p = Promise.resolve();
function collectIndex() {
  if (index === ary.length - 1) {
    fs.writeFileSync(`indexList.json`, JSON.stringify(indexList));
    getbooList()
    return;
  }
  p.then(() => {
    p = getIndex(ary[index]).then(() => {
      index += 1;
      collectIndex();
    });
    return p;
  });
}

// collectIndex()
function getbooList() {
  const avgDay = 20;
  const ary = JSON.parse(fs.readFileSync("./indexList.json").toString());
  const res = _.chain(ary)
    .drop(avgDay - 1)
    .map((i, ii) => {
      const originIndex = ii + avgDay - 1;
      const list = _.slice(ary, ii, originIndex + 1);
      const avg = _.sum(list) / avgDay;
      const sd = Math.sqrt(
        _.chain(list)
          .map((item) => {
            const val = item - avg;
            return val * val;
          })
          .sum()
          .value() / avgDay
      );
      
      const booTop =  avg + 2 * sd
      const booBot =  avg - 2 * sd
      return {
        now: i,
        avg,
        booTop,
        booBot,
        type: i >= booTop ? 1 : i <= booBot ? -1 : 0,
      };
    })
    .value();
  fs.writeFileSync(`booList.json`, JSON.stringify(res));
}
getbooList();

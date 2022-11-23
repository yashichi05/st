import { TextDecoder } from "text-decoding";
import csv from "csvtojson";
import fs from "fs";
export default function loadFile(date) {
  return new Promise((rs,rj) => {
    const decoded = new TextDecoder("big5").decode(
      fs.readFileSync(`./csv/${date}.csv`, null)
    );
    csv({ noheader: true })
      .fromString(decoded)
      .then((data) => {
        rs({ date, data });
      }).catch(rj);
  });
}
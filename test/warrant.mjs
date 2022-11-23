import moment from "moment";
import fs from "fs";
import _ from "lodash";
import loadFile from "./load.mjs";

const lever = 10;
const name = "加權股價指數";
const initCallPrice = 3;
const initPutPrice = 3;

function getDateList() {
  return _.chain(fs.readdirSync("./csv"))
    .map((i) => i.replace(".csv", ""))
    .sortBy((i) => {
      return moment(i).format("x");
    })
    .value();
}
export default class Market {
  list = getDateList();
  dayIndex = 0;
  currentCallPrice = initCallPrice;
  currentPutPrice = initPutPrice;
  initPriceIndex = 0;
  nextDay() {
    this.dayIndex += 1;
    if (this.dayIndex + 1 >= this.list.length) {
      return Promise.resolve("done");
    }
    return loadFile(this.list[this.dayIndex]).then(({ data }) => {
      const found = _.find(data, (i) => i.field1.includes(name));
      if (found) {
        const priceIndex = Number(found.field2.replace(",", ""));
        if (!this.initPriceIndex) {
          this.initPriceIndex = priceIndex;
        }
        const todayRate = Number(found.field5) || 0; // 當日比例
        //   this.currentCallPrice =
        //   this.currentCallPrice * (1 + (rate * lever) / 100);
        // this.currentPutPrice =
        //   this.currentPutPrice * (1 + (rate * lever * -1) / 100);
        const rate =
          ((priceIndex - this.initPriceIndex) / this.initPriceIndex) * 100; //初始日比例

        this.currentCallPrice = initCallPrice * (1 + (rate * lever) / 100);
        this.currentPutPrice = initPutPrice * (1 + (rate * lever * -1) / 100);
        return {
          call: this.currentCallPrice,
          put: this.currentPutPrice,
          rate: todayRate,
        };
      } else {
        return this.nextDay();
      }
    });
  }
  get current() {
    return { call: this.currentCallPrice, put: this.currentPutPrice };
  }
}

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
  dateList = getDateList();
  dayIndex = 0;
  callPublicList = [{ day: this.day, price: initCallPrice }];
  putPublicList = [{ day: this.day, price: initPutPrice }];
  get currentDay() {
    return this.dateList[this.dayIndex];
  }
  get currentCall() {
    return _.last(this.callPublicList);
  }
  get currentPut() {
    return _.last(this.putPublicList);
  }
  rePublic({ callFix, putFix }) {
    _.chain(this.callPublicList)
      .each((i) => {
        i.price *= callFix;
      })
      .remove((i) => i.price <= 0.1)
      .value();
    _.chain(this.putPublicList)
      .each((i) => {
        i.price *= putFix;
      })
      .remove((i) => i.price <= 0.1)
      .value();
    let callItem = _.last(this.callPublicList);
    let putItem = _.last(this.putPublicList);
    if (callItem.price < 2) {
      callItem = { day: this.day, price: initCallPrice };
      this.callPublicList.push(callItem);
    }
    if (putItem.price < 2) {
      putItem = { day: this.day, price: initPutPrice };
      this.putPublicList.push(putItem);
    }
  }
  nextDay() {
    this.dayIndex += 1;
    if (this.dayIndex + 1 >= this.dateList.length) {
      return Promise.resolve("done");
    }
    return loadFile(this.currentDay).then(({ data }) => {
      const found = _.find(data, (i) => i.field1.includes(name));
      if (found) {
        const todayRate = Number(found.field5) || 0; // 當日比例
        const callFix = 1 + (todayRate * lever) / 100;
        const putFix = 1 + (todayRate * lever * -1) / 100;
        this.rePublic({ callFix, putFix });
        return {
          call: this.currentCall.price,
          put: this.currentPut.price,
          rate: todayRate,
        };
      } else {
        return this.nextDay();
      }
    });
  }
  get day() {
    return this.dateList[this.dayIndex];
  }
}

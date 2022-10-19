import fs from "fs";
import _ from "lodash";
import moment from "moment";

const r = fs.readFileSync("./result_bak.json");
const data = JSON.parse(r);

_.each(data, (i) => {
  _.assign(
    i,
    _.mapValues(i, (v) => (_.isString(v) ? v.replace(",", "") : v))
  );
  i.field2 = Number(i.field2);
  i.field3 += 1;
  i.field4 *= i.field3;
  i.field5 = Number(i.field5);

  delete i.field1;
  delete i.field3;
  delete i.field6;
  delete i.field7;
});

function buy(order) {
  const calcAmount = amount - order.price * order.count;
  if (calcAmount <= 0) return;
  amount = calcAmount;
  hold.push(order);
}

function sell({ order, price }) {
  _.remove(hold, (i) => i === order);
  amount += order.count * price;
}

let amount = 300000;
const hold = [];
const years = _.chain(data)
  .map((i) => i.date.toString().substring(0, 4))
  .uniq()
  .value();

_.each(data, (i) => {
  _.each(hold, (order) => {
    if(!order) return
    const isDeadline = moment(i.date).diff(order.date, "d") >= 60
    const isEnough = i.field2  / order.price - 1 > 0.05
    if (isDeadline || isEnough) {
      sell({ order, price: i.field2 });
    }
  });

  let count = 1;
  if (i.field5 <= -1) {
    const bought = _.findLast(hold, (item) => item.type === "call");
    if (bought) {
      count = bought.count * 2;
    }
    buy({ price: i.field2, type: "call", count, date: i.date });
  }
});
console.log(amount, hold);

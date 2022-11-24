import _ from "lodash";
const initBalance = 3000000;
const dayCost = 0.01;
export default class Holder {
  balance = initBalance;
  callHoldList = [];
  putHoldList = [];
  market = null;
  constructor(market) {
    this.market = market;
    market.onNext = ()=>{
      this.nextDay()
    }
  }
  get callHold() {
    return _.sumBy(this.callHoldList, (i) => i.qty);
  }
  get putHold() {
    return _.sumBy(this.putHoldList, (i) => i.qty);
  }
  buy({ qty, type }) {
    const typeKey = type ? "call" : "put";
    const warrant = this.market[`current${_.upperFirst(typeKey)}`];
    const price = warrant.price;
    while (this.balance - price * 1000 * qty < 0 && qty >= 1) {
      qty -= 1;
    }
    if (!qty) return;
    this[`${typeKey}HoldList`].push({ ...warrant, qty });
    this.balance -= price * qty * 1000;
  }
  sell({ qty, type }) {
    const typeKey = type ? "call" : "put";
    const holdKey = `${typeKey}HoldList`;
    _.remove(this[holdKey], (i) => {
      const price = _.chain(this.market[`${typeKey}PublicList`])
        .find((ii) => i.day === ii.day)
        .get("price")
        .value();
      if (qty >= i.qty) {
        qty -= i.qty;

        this.balance += price * i.qty * 1000;
        return true;
      } else {
        i.qty -= qty;
        this.balance += price * qty * 1000;
        qty = 0;
        return false;
      }
    });
    // if (this[holdKey] < 0) throw new Error(`hold < 0,${qty},${typeKey}`);
  }
  nextDay() {
    this.balance -= (this.callHold + this.putHold) * 1000 * dayCost;
    _.remove(this.callHoldList, (i) => {
      return !_.find(this.market.callPublicList, (ii) => i.day === ii.day);
    });
    _.remove(this.putHoldList, (i) => {
      return !_.find(this.market.putPublicList, (ii) => i.day === ii.day);
    });
  }
}

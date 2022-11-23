import _ from "lodash";
const initBalance = 300000;
const dayCost = 0.01;
export default class Holder {
  balance = initBalance;
  callHold = 0;
  putHold = 0;
  market = null;
  constructor(market) {
    this.market = market;
  }
  buy({ qty, type }) {
    const price = this.market.current[type ? "call" : "put"];
    while (this.balance - price * 1000*qty < 0 && qty >= 1) {
      qty -= 1;
    }
    if (!qty) return;
    this[type ? "callHold" : "putHold"] += qty;
    this.balance -= price * qty * 1000;
  }
  sell({ qty, type }) {
    const price = this.market.current[type ? "call" : "put"];
    const holdKey = type ? "callHold" : "putHold"
    this[holdKey] -= qty;
    if(this[holdKey] < 0) throw new Error(`qty < 0,${qty},${type}`)
    this.balance += price * qty * 1000;
  }
  nextDay() {
    this.balance -= this.callHold + this.putHold * 1000 * dayCost;
  }
}

import Market from "./market.mjs";
import Holder from "./holder.mjs";
import func1 from "./func1.mjs";
import _ from "lodash";

const market = new Market();
const holder = new Holder(market);

async function start() {
  while (true) {
    const m = await market.nextDay();
    if (!holder.callHold && !holder.putHold) {
      console.log(`balance:${parseInt(holder.balance)},day:${market.day}`);
    }
    if (m === "done") {
      break;
    }
    func1({ rate: m.rate, market, holder });
  }
}

start();

import Market from "./market.mjs";
import Holder from "./holder.mjs";
import func1 from "./func1.mjs";
import _ from "lodash";

const market = new Market();
const holder = new Holder(market);

async function start() {
  while (true) {
    const m = await market.nextDay();
    console.log(
      `balance:${holder.balance},day:${market.day},call:${holder.callHold},put:${holder.putHold}`
    );
    if (m === "done") {
      break;
    }
    // 累加rate
    func1({ rate: m.rate, market, holder });
  }
}

start();

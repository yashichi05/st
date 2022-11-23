import Market from "./warrant.mjs";
import Holder from "./holder.mjs";
import _ from "lodash";

const market = new Market();
const holder = new Holder(market);

function todayMarket() {
  return market.nextDay();
}
async function start() {
  let longRate = 0;
  while (true) {
    const m = await todayMarket();
    console.log(holder.balance)
    if (m === "done") {
      break;
    }
    const { rate } = m;
    // 累加rate
    longRate += rate;
    if (Math.abs(longRate) >= 1) {
      const isGrow = longRate > 0;
      if (isGrow) {
        if (holder.callHold > 0) {
          holder.sell({
            qty: Math.ceil(holder.callHold / 2),
            type: 1,
          });
        } else {
          holder.buy({
            qty: Math.ceil(holder.putHold * 2 || 2),
            type: 0,
          });
        }
      } else {
        if (holder.putHold > 0) {
          holder.sell({
            qty: Math.ceil(holder.putHold / 2),
            type: 0,
          });
        } else {
          holder.buy({
            qty: Math.ceil(holder.callHold * 2 || 2),
            type: 1,
          });
        }
      }
      longRate = 0;
    }
  }
}
start();

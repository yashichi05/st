import _ from "lodash";

let longRate = 0;
const rateList = [];
let mode = 0;
let noActionCount = 0
export default function func1({ rate, holder }) {
  let action = 0;
  longRate += rate;
  // rateList.push(rate);
  // if (rateList.length > 40) {
  //   _.remove(rateList, (i, index) => !index);
  // }
  // if (rateList.length === 40) {
  //   const s = _.sum(rateList);
  //   if (Math.abs(s) >= 5) {
  //     if (s > 0) {
  //       mode = 1;
  //     } else {
  //       mode = -1;
  //     }
  //   } else {
  //     mode = 0;
  //   }
  // }
  if (Math.abs(longRate) >= 1) {
    if (longRate > 0) {
      if (holder.callHold > 0) {
        holder.sell({
          qty: Math.ceil(holder.callHold / 2),
          type: 1,
        });
        action = 1;
      } else {
        if (mode === 1) return;
        action = holder.buy({
          qty: holder.putHold * 2 || 2,
          type: 0,
        });
      }
    } else {
      if (holder.putHold > 0) {
        holder.sell({
          qty: Math.ceil(holder.putHold / 2),
          type: 0,
        });
        action = 1;
      } else {
        if (mode === -1) return;
        action = holder.buy({
          qty: holder.callHold * 2 || 2,
          type: 1,
        });
      }
    }
    longRate = 0;
  }
  if(action){
    noActionCount = 0
  } else{
    noActionCount += 1
  }
  if(noActionCount >= 3){
    holder.sell({
      qty: holder.callHold,
      type: 1,
    });
    holder.sell({
      qty: holder.putHold,
      type: 0,
    });
    noActionCount = 0
  }
}

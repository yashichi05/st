let longRate = 0;
let noActionCount = 0;
export default function func1({ rate, holder }) {
  longRate += rate;
  let action;
  if (Math.abs(longRate) >= 1) {
    if (longRate > 0) {
      if (holder.callHold > 0) {
        holder.sell({
          qty: Math.ceil(holder.callHold / 2),
          type: 1,
        });

        action = 1;
      } else {
        const qty = holder.buy({
          qty: holder.putHold * 2 || 2,
          type: 0,
        });
        action = qty;
      }
    } else {
      if (holder.putHold > 0) {
        holder.sell({
          qty: Math.ceil(holder.putHold / 2),
          type: 0,
        });

        action = 1;
      } else {
        const qty = holder.buy({
          qty: holder.callHold * 2 || 2,
          type: 1,
        });

        action = qty;
      }
    }
    longRate = 0;
  }
  if (!action) {
    noActionCount += 1;
  } else {
    noActionCount = 0;
  }

  if (noActionCount === 5) {
    holder.sell({
      qty: Math.ceil(holder.callHold / 2),
      type: 1,
    });
    holder.sell({
      qty: Math.ceil(holder.putHold / 2),
      type: 0,
    });
  } else if (noActionCount === 10) {
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
  console.log(noActionCount);
}

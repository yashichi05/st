let longRate = 0;
export default function func1({ rate, holder }) {
  longRate += rate;
  if (Math.abs(longRate) >= 1) {
    if (longRate > 0) {
      if (holder.callHold > 0) {
        holder.sell({
          qty: Math.ceil(holder.callHold / 2),
          type: 1,
        });
      } else {
        holder.buy({
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
      } else {
        holder.buy({
          qty: holder.callHold * 2 || 2,
          type: 1,
        });
      }
    }
    longRate = 0;
  }
}

import Market from "./market.mjs";
const market = new Market()

async function ss(){
  const a = await market.nextDay()
  const b = await market.nextDay()
  const c = await market.nextDay()
}
ss()
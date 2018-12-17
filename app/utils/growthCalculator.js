export default function(curr, prev, currMoe = 0, prevMoe = 0) {
  let value;
  if (currMoe || prevMoe) {
    const f1 = Math.pow(-prev / Math.pow(curr, 2), 2) * Math.pow(currMoe, 2);
    const f2 = Math.pow(1 / curr, 2) * Math.pow(prevMoe, 2);
    value = Math.sqrt(f1 + f2);
  }
  else value = (curr - prev) / prev;
  return value * 100;
}

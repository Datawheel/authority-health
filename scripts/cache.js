#! /usr/bin/env node

const PromiseThrottle = require("promise-throttle"),
      axios = require("axios"),
      d3Array = require("d3-array"),
      d3Format = require("d3-format"),
      fs = require("fs"),
      path = require("path"),
      readline = require("readline"),
      shell = require("shelljs");

// const domain = "https://data.authorityhealth.org";
const domain = "https://ah-cedar.datawheel.us";
const levels = ["county", "place", "zip", "tract"];

const throttle = new PromiseThrottle({
  requestsPerSecond: 1,
  promiseImplementation: Promise
});

/** */
function readFiles(folder, fileType = "jsx") {
  return d3Array.merge(fs.readdirSync(folder)
    .filter(file => file && file.indexOf(".") !== 0)
    .map(file => {
      const fullPath = path.join(folder, file);
      if (shell.test("-d", fullPath)) return readFiles(fullPath, fileType);
      else if (file.indexOf(`.${fileType}`) === file.length - 1 - fileType.length) return [fullPath];
      else return [];
    }));
}

const commas = d3Format.format(",");

let retries = [];
let counter = 0;
let round = 1;
let total;

/** */
function writeProgress() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`${typeof round === "number" ? `round ${commas(round)}` : round}: ${commas(counter)} of ${commas(total)} queries complete`);
}

/** */
async function createRequest(url) {
  return throttle.add(() => axios({url, method: "GET", timeout: 1000 * 30}) // 30 second timeout
    .then(resp => resp.data)
    .then(() => {
      counter++;
      writeProgress();
    })
    .catch(() => {
      counter++;
      writeProgress();
      retries.push(url);
    }));
}

/** */
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/** */
async function run() {

  const folder = path.join(process.cwd(), "app/pages/Profile/");
  let urls = [];
  const files = readFiles(folder);

  files
    .forEach(file => {
      const contents = shell.cat(file);
      const regex = new RegExp(/fetchData\([\s]*\"[A-z]+\"\,[\s]*\"([^\"]+)\"/gm);
      let match;
      while ((match = regex.exec(contents)) !== null) {
        let url = match[1];
        if (url.indexOf("/") === 0) url = `${domain}${url}`;
        urls.push(url);
      }
      // const matches = contents.matchAll(/fetchData\([\s]*\"[A-z]+\"\,[\s]*\"([^\"]+)\"/gm);
      // for (const match of matches) {
      //   let url = match[1];
      //   if (url.indexOf("/") === 0) url = `${domain}${url}`;
      //   urls.push(url);
      // }
    });

  console.log(`${files.length} files analyzed`);
  urls = Array.from(new Set(urls));
  console.log(`${urls.length} unique URLs detected`);

  const dataURLs = urls.filter(url => url.includes("<id>"));
  const generalURLs = urls.filter(url => !url.includes("<id>"));
  console.log(`${dataURLs.length} URLs are profile specific`);
  console.log(`${generalURLs.length} URLs are profile agnostic`);

  let attrs = await axios.get(`${domain}/api/search/?limit=1000`)
    .then(resp => resp.data);

  attrs = attrs
    .sort((a, b) => {
      const levelDiff = levels.indexOf(a.level) - levels.indexOf(b.level);
      if (levelDiff !== 0) return levelDiff;
      else return b.zvalue - a.zvalue;
    });
  // .sort((a, b) => {
  //   const levelDiff = levels.indexOf(b.level) - levels.indexOf(a.level);
  //   if (levelDiff !== 0) return levelDiff;
  //   else return a.zvalue - b.zvalue;
  // })
  // .slice(8, 10);

  const fullURLs = generalURLs.concat(d3Array.merge(attrs
    .map(attr => dataURLs.map(url => url.replace(/\<id\>/g, attr.id)))));

  console.log("");
  total = fullURLs.length;
  await Promise.all(fullURLs.map(createRequest));
  console.log("");

  const retryMax = 5;
  while (retries.length && round < retryMax) {
    console.log("waiting 30 seconds before retrying timeouts...");
    await sleep(1000 * 30); // 30 seconds
    counter = 0;
    round++;
    total = retries.length;
    const requests = retries.map(createRequest);
    retries = [];
    await Promise.all(requests);
    console.log("");
  }
  if (retries.length) {
    console.log("unable to cache the following data calls:");
    console.log(retries);
    console.log("");
    retries = [];
  }

  const profiles = attrs.map(attr => `https://data.authorityhealth.org/profile/${attr.id}`);
  counter = 0;
  total = profiles.length;
  round = "profile cache";
  writeProgress();
  await Promise.all(profiles.map(createRequest));
  console.log("");

  if (retries.length) {
    console.log("unable to cache the following profiles:");
    console.log(retries);
  }

}

run();

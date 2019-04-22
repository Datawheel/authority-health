#! /usr/bin/env node

const axios = require("axios");

const domain = "https://data.authorityhealth.org/";
const levels = ["county", "place", "zip", "tract"];

/** */
async function run() {

  let attrs = await axios.get(`${domain}api/search/?limit=1000`)
    .then(resp => resp.data);

  attrs = attrs.sort((a, b) => {
    const levelDiff = levels.indexOf(a.level) - levels.indexOf(b.level);
    if (levelDiff !== 0) return levelDiff;
    else return b.zvalue - a.zvalue;
  });

  for (let i = 0; i < attrs.length; i++) {
    const {id, name} = attrs[i];
    console.log("");
    console.log(name);
    const url = `${domain}profile/${id}`;
    console.log(url);
    const resp = await axios.get(url);
    console.log(resp.status);
  }

}

run();

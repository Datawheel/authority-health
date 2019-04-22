#! /usr/bin/env node

const axios = require("axios");

const domain = "https://data.authorityhealth.org/";
const levels = ["County", "Place", "Zip", "Tract"];

/** */
async function run() {

  let attrs = await axios.get(`${domain}api/search/?limit=1000`)
    .then(resp => resp.data);

  attrs = attrs.sort((a, b) => levels.indexOf(a.hierarchy) - levels.indexOf(b.hierarchy));

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

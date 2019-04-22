#! /usr/bin/env node

const axios = require("axios");

const domain = "https://data.authorityhealth.org/";

/** */
async function run() {

  const attrs = await axios.get(`${domain}api/search/?limit=1000`)
    .then(resp => resp.data);

  for (let i = 0; i < attrs.length; i++) {
    const {id} = attrs[i];
    const url = `${domain}profile/${id}`;
    console.log(url);
    const resp = await axios.get(url);
    console.log(resp.status);
  }

}

run();

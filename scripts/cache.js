#! /usr/bin/env node

const axios = require("axios");

const domain = "https://data.authorityhealth.org/";
const levels = ["county", "place", "zip", "tract"];

const message = {
  200: "success!",
  502: "timeout, will try again later"
};

/** */
async function run() {

  let attrs = await axios.get(`${domain}api/search/?limit=1000`)
    .then(resp => resp.data);

  attrs = attrs.sort((a, b) => {
    const levelDiff = levels.indexOf(a.level) - levels.indexOf(b.level);
    if (levelDiff !== 0) return levelDiff;
    else return b.zvalue - a.zvalue;
  });

  /** */
  async function hitServer(attr) {
    const {id, name} = attr;
    console.log("");
    console.log(name);
    const url = `${domain}profile/${id}`;
    console.log(url);
    const resp = await axios({url, method: "GET", timeout: 1000 * 60 * 5}) // 5 minute timeout
      .catch(() => ({status: 502}));
    console.log(`${resp.status} - ${message[resp.status]}`);
    return resp;
  }

  let secondPass = attrs;
  while (secondPass.length) {
    const list = secondPass.slice();
    secondPass = [];
    for (let i = 0; i < list.length; i++) {
      const resp = await hitServer(list[i]);
      if (resp.status === 502) secondPass.push(list[i]);
    }
  }


}

run();

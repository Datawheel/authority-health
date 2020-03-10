#! /usr/bin/env node

const {Client} = require("mondrian-rest-client"),
      axios = require("axios"),
      d3Array = require("d3-array"),
      fs = require("fs"),
      path = require("path"),
      shell = require("shelljs");

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


const {CANON_LOGICLAYER_CUBE} = process.env;

const client = new Client(CANON_LOGICLAYER_CUBE);

let cubeList = [];

/** */
async function run() {

  const folder = path.join(process.cwd(), "app/pages/Profile/");
  const files = readFiles(folder);

  let queries = [];

  files
    .forEach(file => {
      const contents = shell.cat(file);
      const regex = new RegExp(/fetchData\([\s]*\"[A-z]+\"\,[\s]*\"([^\"]+)\"/gm);
      let match;
      while ((match = regex.exec(contents)) !== null) {
        const url = match[1];
        if (url.includes("acs.datausa.io")) queries.push(url.replace("<id>", "01000US"));
      }
    });

  queries = Array.from(new Set(queries));

  await Promise.all(queries.map(url => axios.get(url)
    .then(resp => {
      cubeList = cubeList.concat(resp.data.source);
      return true;
    })));

  await client.cubes()
    .then(cubes => {

      const matches = cubes.filter(cube => cube.name.startsWith("acs_") && !cube.name.match(/_5$/));
      cubeList = cubeList.concat(matches);

    });

  cubeList = cubeList.filter((c, i) => cubeList.indexOf(cubeList.find(cc => cc.annotations.table_id === c.annotations.table_id)) === i);

  let csv = "\"Topic\",\"Subtopic\",\"Table\"";

  cubeList.forEach(cube => {

    const {subtopic, table_id: tableID, topic} = cube.annotations;

    let row = "";
    row += `\"${topic}\"`;
    row += `,\"${subtopic}\"`;
    row += `,\"${tableID}\"`;
    csv += `\n${row}`;

  });

  fs.writeFile("./scripts/acs.csv", csv, "utf8", err => {
    if (err) console.log(err);
    else console.log("created scripts/measures.csv");
  });

}

run();

#! /usr/bin/env node

const {Client} = require("mondrian-rest-client"),
      Sequelize = require("sequelize"),
      d3Array = require("d3-array"),
      shell = require("shelljs");

const zipCodes = require("../app/utils/zipcodes");
const places = require("../app/utils/places");

console.log("Places:", places.length);
console.log("Zip Codes:", zipCodes.length);

const geoFilter = {
  Place: id => places.includes(id),
  Tract: id => id.startsWith("14000US26163"),
  Zip: id => zipCodes.includes(id.slice(7))
};

const CUBE_URL = "https://acs-api.datausa.io";
const client = new Client(CUBE_URL);

const dbName = process.env.CANON_DB_NAME;
const dbUser = process.env.CANON_DB_USER;
const dbHost = process.env.CANON_DB_HOST || "127.0.0.1";
const dbPw = process.env.CANON_DB_PW || null;

const db = new Sequelize(dbName, dbUser, dbPw,
  {
    host: dbHost,
    dialect: "postgres",
    define: {timestamps: true},
    logging: () => { }
  }
);

const model = db.import("../db/search.js");
db[model.name] = model;

/** */
function formatter(members, data, dimension, level) {

  const newData = members
    .filter(d => geoFilter[level](d.key))
    .reduce((arr, d) => {
      const obj = {};
      obj.id = `${d.key}`;
      obj.name = d.name;
      obj.display = d.caption;
      obj.zvalue = data[obj.id] || 0;
      obj.dimension = dimension;
      obj.hierarchy = level;
      obj.stem = -1;
      arr.push(obj);
      return arr;
    }, []);
  const st = d3Array.deviation(newData, d => d.zvalue);
  const average = d3Array.median(newData, d => d.zvalue);
  newData.forEach(d => d.zvalue = (d.zvalue - average) / st);
  return newData;
}

/** */
async function start() {

  const cubeName = "acs_yg_total_population_5";
  const measure = "Population";
  const dimension = "Geography";

  const cube = await client.cube(cubeName);

  const rawLevels = cube.dimensionsByName[dimension].hierarchies;

  let fullList = [];
  const levels = ["Place", "Zip", "Tract"];
  // const levels = ["Tract"];
  for (let i = 0; i < levels.length; i++) {

    const level = levels[i];
    const rawLevel = rawLevels.find(d => d.name === level).levels.find(d => d.name === level);
    console.log(`Loading ${level} Members...`);
    const members = await client.members(rawLevel);

    const query = cube.query
      .drilldown(dimension, level, level)
      .cut("[Year].[Year].[Year].&[2016]")
      .measure(measure);

    if (level === "Place") query.cut(`[${dimension}].[${level}].[State].&[04000US26]`);
    if (level === "Tract") query.cut(`[${dimension}].[${level}].[County].&[05000US26163]`);

    const data = await client.query(query, "jsonrecords")
      .then(resp => resp.data.data)
      .then(data => data.reduce((obj, d) => {
        obj[d[`ID ${level}`]] = d[measure];
        return obj;
      }, {}));

    fullList = fullList.concat(formatter(members, data, dimension, level));

  }

  for (let i = 0; i < fullList.length; i++) {
    const obj = fullList[i];
    const {id, dimension, hierarchy} = obj;
    // console.log(dimension, hierarchy, id);
    const [row, created] = await db.search.findOrCreate({
      where: {id, dimension, hierarchy},
      defaults: obj
    });
    if (created) console.log(`Created: ${row.id} ${row.display}`);
    else {
      await row.updateAttributes(obj);
      console.log(`Updated: ${row.id} ${row.display}`);
    }
  }

  shell.exit(0);

}

start();

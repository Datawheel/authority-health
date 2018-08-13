const {Client} = require("mondrian-rest-client");
const axios = require("axios");

module.exports = async function() {

  const client = new Client("https://canon-api.datausa.io/");

  // get geoid:total population
  const levels = ["Zip", "Place", "Tract"];
  const popQueries = levels
    .map(level => client.cube("acs_yg_total_population_5")
      .then(c => {
        const query = c.query
          .drilldown("Geography", level, level)
          .measure("Total Population")
          .cut("[Year].[Year].[Year].&[2016]");
        return client.query(query, "jsonrecords");
      })
      .then(resp => 
        resp.data.data.reduce((acc, d) => {
          acc[d[`ID ${level}`]] = d["Total Population"];  
          return acc;
        }, {}))
      .catch(err => {
        console.error(` 🌎 ${level} Pop Cache Error: ${err.message}`);
        if (err.config) console.error(err.config.url);
      }));

  const rawPops = await Promise.all(popQueries);
  const pops = rawPops.reduce((obj, d) => (obj = Object.assign(obj, d), obj), {});

  // get geoid:place
  const geoserviceData = await axios.get("http://ah-aspen.datawheel.us/geoservice-api/relations/intersects/05000US26163?targetLevels=zip,place,tract")
    .then(d => d.data);

  geoserviceData.map(obj => obj.population = pops[obj.geoid]);
  
  const comparePopulation  = (a, b) => {
    if (a.population === undefined) a.population = 0;
    if (b.population === undefined) b.population = 0;
    return b.population - a.population;
  };
  geoserviceData.sort(comparePopulation);

  return geoserviceData;

};

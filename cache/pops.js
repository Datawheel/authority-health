const {Client} = require("mondrian-rest-client");

module.exports = async function() {

  const client = new Client("https://acs-api.datausa.io");

  const levels = ["County", "Place", "Zip", "Tract"];
  const popQueries = levels
    .map(level => client.cube("acs_yg_total_population_5")
      .then(c => {
        const query = c.query
          .drilldown("Geography", level, level)
          .measure("Population")
          .cut("[Year].[Year].[Year].&[2017]");
        return client.query(query, "jsonrecords");
      })
      .then(resp => resp.data.data.reduce((acc, d) => {
        acc[d[`ID ${level}`]] = d.Population;
        return acc;
      }, {}))
      .catch(err => {
        console.error(` 🌎  ${level} Pop Cache Error: ${err.message}`);
        if (err.config) console.error(err.config.url);
      }));

  const rawPops = await Promise.all(popQueries);
  const pops = rawPops.reduce((obj, d) => (obj = Object.assign(obj, d), obj), {});
  return pops;

};

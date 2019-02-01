const {Client} = require("mondrian-rest-client");
const {CANON_LOGICLAYER_CUBE} = process.env;

const metaData = require("../app/utils/stats");
const statTopics = [metaData.healthTopics, metaData.socialDeterminants];
  
module.exports = async function() {
  statTopics.forEach(statTopic => {
    const client = new Client(CANON_LOGICLAYER_CUBE);
    const levels = ["County", "Place", "Zip", "Tract"];
    statTopic.forEach(async dataObj => {
      const popQueries = levels
        .map(level => client.cube(dataObj.cube)
          .then(c => {
            const query = c.query
              .drilldown("Geography", level, level)
              .measure(dataObj.measure)
              .cut(`[Year].[Year].[Year].&[${dataObj.latestYear}]`);
            return client.query(query, "jsonrecords");
          })
          .then(resp => resp.data.data.reduce((acc, d) => {
            acc[d[`ID ${level}`]] = d[dataObj.measure];
            return acc;
          }, {}))
          .catch(err => {
            console.error(` 🌎  ${level} Pop Cache Error: ${err.message}`);
            if (err.config) console.error(err.config.url);
          }));

      const rawPops = await Promise.all(popQueries);
      const pops = rawPops.reduce((obj, d) => (obj = Object.assign(obj, d), obj), {});
      dataObj.data = pops;
      dataObj.data.length !== undefined ? console.log("dataObj.cube: ", dataObj.cube) : "";
    });
  });
};

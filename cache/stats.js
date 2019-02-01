const {Client} = require("mondrian-rest-client");
const {CANON_LOGICLAYER_CUBE} = process.env;

const metaData = require("../app/utils/stats");
const statTopics = {};
statTopics.healthTopics = metaData.healthTopics;
statTopics.socialDeterminants = metaData.socialDeterminants;

module.exports = async function() {
  Object.entries(statTopics).forEach(statTopic => {
    console.log("statTopic: ", statTopic);
    const client = new Client(CANON_LOGICLAYER_CUBE);
    const levels = ["County", "Place", "Zip", "Tract", "Zip Region"];
    statTopic[1].forEach(async dataObj => {
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
    });
  });
  return statTopics;
};

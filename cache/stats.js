const {MultiClient} = require("mondrian-rest-client");
const d3 = require("d3-array"); 

const {CANON_LOGICLAYER_CUBE} = process.env;
const statTopics = require("../app/utils/stats");

module.exports = async function() {
  Object.entries(statTopics).forEach(statTopic => {
    const client = new MultiClient([CANON_LOGICLAYER_CUBE, "https://acs-api.datausa.io/"]);
    statTopic[1].forEach(async dataObj => {
      const cut = dataObj.hasOwnProperty("yearDimension") ? `[End Year].[End Year].[End Year].&[${dataObj.latestYear}]` : `[Year].[Year].[Year].&[${dataObj.latestYear}]`;
      const popQueries = dataObj.depth
        .map(level => client.cube(dataObj.cube)
          .then(c => {
            if (level instanceof Array) {
              const query = c.query
                .drilldown("Geography", level[0], level[1])
                .measure(dataObj.measure)
                .cut(cut);
              return client.query(query, "jsonrecords");
            }
            else {
              const query = c.query
                .drilldown("Geography", level, level)
                .measure(dataObj.measure)
                .cut(cut);
              return client.query(query, "jsonrecords");
            }
          })
          .then(resp => resp.data.data.reduce((acc, d) => {
            acc[d[`ID ${level}`]] = d[dataObj.measure];
            return acc;
          }, {}))
          .catch(err => {
            console.error(` 🌎  ${dataObj.measure} Error: ${err.message}`);
            if (err.config) console.error(err.config.url);
          }));

      const rawPops = await Promise.all(popQueries);
      const pops = rawPops.reduce((obj, d) => (obj = Object.assign(obj, d), obj), {});
      const allValues = Object.values(pops);
      const domain = [d3.min(allValues), d3.median(allValues), d3.max(allValues)];
      dataObj.data = pops;
      dataObj.domain = domain;
    });
  });
  return statTopics;
};

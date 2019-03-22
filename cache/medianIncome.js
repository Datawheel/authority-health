const {Client} = require("mondrian-rest-client");

module.exports = async function() {

  const client = new Client("https://acs-api.datausa.io");

  const levels = ["County", "Place", "Zip", "Tract"];
  const medianIncomeQueries = levels
    .map(level => client.cube("acs_yg_household_income_5")
      .then(c => {
        const query = c.query
          .drilldown("Geography", level, level)
          .measure("Household Income")
          .cut("[Year].[Year].[Year].&[2017]");
        return client.query(query, "jsonrecords");
      })
      .then(resp => resp.data.data.reduce((acc, d) => {
        acc[d[`ID ${level}`]] = d["Household Income"];
        return acc;
      }, {}))
      .catch(err => {
        console.error(` 🌎  ${level} Median Income Cache Error: ${err.message}`);
        if (err.config) console.error(err.config.url);
      }));

  const rawMedianIncome = await Promise.all(medianIncomeQueries);
  const medianIncome = rawMedianIncome.reduce((obj, d) => (obj = Object.assign(obj, d), obj), {});
  return medianIncome;
};

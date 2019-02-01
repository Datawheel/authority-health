const axios = require("axios");

const {CANON_LOGICLAYER_CUBE} = process.env;

const statTopics = require("../app/utils/stats");

const prefixMap = {
  "050": "county",
  "160": "place",
  "140": "tract",
  "860": "zip"
};

// groupBy function groups object by property.
function groupBy(objectArray, property) {
  return objectArray.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

function findGeoLevels(groupedObj) {
  const result = [];
  groupedObj.hasOwnProperty("zip") ? result.push({zip: groupedObj.zip.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid}) : "";
  groupedObj.hasOwnProperty("place") ? result.push({place: groupedObj.place.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid}) : "";
  groupedObj.hasOwnProperty("county") ? result.push({county: groupedObj.county.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid}) : "";
  return result;
}

module.exports = function(app) {

  const {cache} = app.settings;

  app.get("/api/topstats", async(req, res) => {
    res.json(cache.stats);
  });

  app.get("/api/stats/:id", async(req, res) => {
    const {id} = req.params;
    const levels = {
      county: ["county"],
      place: ["county"],
      zip: ["tract", "place", "county"],
      tract: ["zip", "place", "county"]
    };

    const currentLevel = prefixMap[id.slice(0, 3)];
    const targetLevels = levels[currentLevel].join(",");
    const locationData = await axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevels}&overlapSize=true`)
      .then(resp => resp.data)
      .catch(err => console.log(err));
      
    const groupedValues = groupBy(locationData, "level");
    const geoLevels = findGeoLevels(groupedValues);
    console.log("geoLevels: ", geoLevels);
    res.json(locationData);
  });
};

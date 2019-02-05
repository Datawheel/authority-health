const axios = require("axios");
const d3 = require("d3-scale");

const {CANON_LOGICLAYER_CUBE} = process.env;

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
  groupedObj.hasOwnProperty("zip") ? result.push(groupedObj.zip.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid) : "";
  groupedObj.hasOwnProperty("place") ? result.push(groupedObj.place.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid) : "";
  groupedObj.hasOwnProperty("county") ? result.push(groupedObj.county.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid) : "";
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

    // Add current location ID at the beginning of the geoLevels array.
    geoLevels.unshift(id);

    const currentLocationMeasureData = {};
    const healthTopics = [];
    const socialDeterminants = [];

    // Check if measure data is available for locations in geoLevels array and set their rank.
    Object.entries(cache.stats).forEach(statTopic => {
      statTopic[1].forEach(d => {
        const matchId = geoLevels.find(parentId => d.data.hasOwnProperty(parentId));
        const value = d.data[matchId];
        if (value !== undefined) {
          const scale = d3.scaleLinear()
            .domain(d.domain)
            .range([-1, 0, 1]);

          statTopic[0] === "healthTopics" ? healthTopics.push({measure: d.measure, rank: scale(value), value}) : socialDeterminants.push({measure: d.measure, rank: scale(value), value});
        }
      });
    });

    // Sort and slice each topStat data and add it to the currentLocationMeasureData.
    currentLocationMeasureData.healthTopics = healthTopics.sort((a, b) => Math.abs(b.rank) - Math.abs(a.rank));
    currentLocationMeasureData.healthTopics = currentLocationMeasureData.healthTopics.length > 3 ? currentLocationMeasureData.healthTopics.slice(0, 3) : currentLocationMeasureData.healthTopics;

    currentLocationMeasureData.socialDeterminants = socialDeterminants.sort((a, b) => Math.abs(b.rank) - Math.abs(a.rank)).slice(0, 3);
    currentLocationMeasureData.socialDeterminants = currentLocationMeasureData.socialDeterminants.length > 3 ? currentLocationMeasureData.socialDeterminants.slice(0, 3) : currentLocationMeasureData.socialDeterminants;
    
    res.json(currentLocationMeasureData);
  });
};

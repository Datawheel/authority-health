const axios = require("axios");
const d3 = require("d3-scale");
const {formatAbbreviate} = require("d3plus-format");
const formatters = require("../app/utils/formatters");
const {CANON_LOGICLAYER_CUBE} = process.env;
const {titleCase} = require("d3plus-text");

const regionLookup = {
  48236: "04",
  48230: "04",
  48167: "10",
  48168: "10",
  48170: "10",
  48188: "21",
  48187: "21",
  48125: "02",
  48141: "02",
  48127: "02",
  48212: "09",
  48213: "09",
  48211: "09",
  48150: "26",
  48152: "26",
  48154: "26",
  48121: "06",
  48123: "06",
  48120: "06",
  48126: "06",
  48128: "06",
  48124: "06",
  48101: "01",
  48217: "01",
  48229: "01",
  48218: "01",
  48122: "01",
  48240: "24",
  48239: "24",
  48180: "18",
  48203: "13",
  48238: "13",
  48134: "25",
  48173: "25",
  48193: "25",
  48183: "25",
  48138: "25",
  48195: "08",
  48192: "08",
  48136: "27",
  48135: "27",
  48184: "27",
  48186: "27",
  48185: "27",
  48214: "16",
  48207: "16",
  48225: "07",
  48224: "07",
  48216: "03",
  48208: "03",
  48222: "03",
  48201: "03",
  48202: "03",
  48226: "03",
  48231: "03",
  48164: "12",
  48174: "12",
  48111: "12",
  48112: "12",
  48227: "19",
  48223: "14",
  48228: "14",
  48235: "23",
  48204: "11",
  48206: "11",
  48221: "22",
  48146: "17",
  48219: "20",
  48209: "05",
  48210: "05",
  48215: "16",
  48205: "15",
  48234: "15"
};

const prefixMap = {
  "050": "county",
  "160": "place",
  "140": "tract",
  "860": "zip",
  "ZRX": "zip_region"
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

function findParentGeoLevels(groupedObj) {
  const result = [];
  // If groupedObj has zip level data, then check for the zip region as well.
  if (groupedObj.hasOwnProperty("zip")) {
    const topZipLevel = groupedObj.zip.sort((a, b) => b.overlap_size - a.overlap_size)[0];
    // Push zip ID to the result array.
    result.push(topZipLevel.geoid);
    // Push zip region ID to the result array if the topZipLevel is in the regionLookup.
    regionLookup.hasOwnProperty(topZipLevel.name) ? result.push(`ZRXXXUS${regionLookup[topZipLevel.name]}`) : "";
  }
  groupedObj.hasOwnProperty("place") ? result.push(groupedObj.place.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid) : "";
  groupedObj.hasOwnProperty("county") ? result.push(groupedObj.county.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid) : "";
  return result;
}

module.exports = function(app) {

  const {cache, db} = app.settings;

  app.get("/api/topstats", async(req, res) => {
    res.json(cache.stats);
  });

  app.get("/api/stats/:id", async(req, res) => {
    const {id} = req.params;
    const levels = {
      county: ["county"],
      place: ["zip", "county"],
      zip: ["tract", "place", "county"],
      tract: ["zip", "place", "county"],
      zip_region: ["county"]
    };

    const currentLevel = prefixMap[id.slice(0, 3)];
    const targetLevels = levels[currentLevel].join(",");

    // Get the parent geographies for the current location.
    const locationData = await axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevels}&overlapSize=true`)
      .then(resp => resp.data)
      .catch(err => console.log(err));

    const groupedValues = groupBy(locationData, "level");
    // Select top most parent from multiple same level parents with max overlap_size.
    const geoLevels = findParentGeoLevels(groupedValues);

    // Add current location ID at the beginning of the geoLevels array.
    geoLevels.unshift(id);

    const currentLocationMeasureData = {};
    const healthTopics = [];
    const socialDeterminants = [];

    // cache.cube has all the measure and year data. To view data in browser go to the /api/cubes url.
    const cubeYearData = cache.cube.years;

    // Check if measure data is available for locations in geoLevels array and set their rank.
    Object.entries(cache.stats).forEach(statTopic => {
      statTopic[1].forEach(d => {
        const matchId = geoLevels.find(parentId => d.data.hasOwnProperty(parentId));
        const value = d.data[matchId];
        if (value !== undefined) {
          const scale = d3.scaleLinear()
            .domain(d.domain)
            .range([-1, 0, 1]);

          const statData = {
            measure: d.measure,
            geoId: matchId,
            rank: scale(value),
            value: formatters.hasOwnProperty(d.measure) ? formatters[d.measure](formatAbbreviate(value)) : formatAbbreviate(value),
            years: d.cube.startsWith("acs_yg") ? 5 : cubeYearData[d.cube].years.length, // if its a shared acs cube (which is not in Authority Health cubes), then set the years to 5.
            latestYear: d.latestYear,
            yearDimension: d.hasOwnProperty("yearDimension") ? true : false
          };
          statTopic[0] === "healthTopics" ? healthTopics.push(statData) : socialDeterminants.push(statData);
        }
      });
    });

    // Sort and slice each topStat data and add it to the currentLocationMeasureData.
    currentLocationMeasureData.healthTopics = healthTopics.sort((a, b) => Math.abs(b.rank) - Math.abs(a.rank));
    currentLocationMeasureData.healthTopics = currentLocationMeasureData.healthTopics.length > 3 ? currentLocationMeasureData.healthTopics.slice(0, 3) : currentLocationMeasureData.healthTopics;

    currentLocationMeasureData.socialDeterminants = socialDeterminants.sort((a, b) => Math.abs(b.rank) - Math.abs(a.rank)).slice(0, 3);
    currentLocationMeasureData.socialDeterminants = currentLocationMeasureData.socialDeterminants.length > 3 ? currentLocationMeasureData.socialDeterminants.slice(0, 3) : currentLocationMeasureData.socialDeterminants;

    currentLocationMeasureData.total = healthTopics.length + socialDeterminants.length;
    currentLocationMeasureData.locations = geoLevels;

    // Get all Place/Tract/Zip level data that are in Wayne County.
    const allLocations = await db.search.findAll().then(results => results.map(resp => resp.toJSON()));
    const population = cache.pops;
    const medianIncome = cache.medianIncome;
    const currLevel = titleCase(prefixMap[id.slice(0, 3)]);

    const currentLevelLocations = allLocations.filter(d => d.hierarchy === currLevel);
    currentLevelLocations.forEach(location => {
      population.hasOwnProperty(location.id) ? location.population = population[location.id] : location.population = 0;
      medianIncome.hasOwnProperty(location.id) ? location.medianIncome = medianIncome[location.id] : location.medianIncome = 0;
    });
    
    // Sort and rank loctions based on their population.
    currentLevelLocations.sort((a, b) => b.population - a.population);
    currentLevelLocations.forEach((d, i) => d.populationRank = i + 1);

    // Sort and rank loctions based on their median income.
    currentLevelLocations.sort((a, b) => b.medianIncome - a.medianIncome);
    currentLevelLocations.forEach((d, i) => d.medianIncomeRank = i + 1);

    currentLocationMeasureData.rankData = currentLevelLocations;
    res.json(currentLocationMeasureData);
  });
};

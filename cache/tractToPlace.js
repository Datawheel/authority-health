const axios = require("axios");
const PromiseThrottle = require("promise-throttle");

const {CANON_LOGICLAYER_CUBE} = process.env;

const throttle = new PromiseThrottle({
  requestsPerSecond: 50,
  promiseImplementation: Promise
});

module.exports = async function(app) {
  const {db} = app.settings;

  // Get all Place/Tract/Zip level data which are in the Wayne County.
  const allLocations = await db.search.findAll().then(results => results.map(resp => resp.toJSON()));

  // Find a place for each zip in Wayne County.
  const allZips = allLocations.filter(d => d.hierarchy === "Zip");
  // Get a place for each zip.
  const zipToPlacePromises = [];
  allZips.forEach(d => {
    zipToPlacePromises.push(axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${d.id}?targetLevels=place&overlapSize=true`));
  });

  const zipToPlace = {};
  const tractToPlace = {};
  Promise.all(zipToPlacePromises).then(results => {
    allZips.forEach((d, i) => {
      const data = results[i].data;
      zipToPlace[d.id] = data.length !== 0 ? data.sort((a, b) => b.overlap_size - a.overlap_size)[0] : "";
    });

    // Now find Zip for each tract in Wayne County & assign Place using above zipToPlace object.
    const allTracts = allLocations.filter(d => d.hierarchy === "Tract");
    const tractToPlacePromises = [];
    allTracts.forEach(d => {
      tractToPlacePromises.push(throttle.add(() => axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${d.id}?targetLevels=zip&overlapSize=true`)));
    });

    Promise.all(tractToPlacePromises).then(results2 => {
      allTracts.forEach((d, i) => {
        if (results2[i] !== undefined) {
          const data = results2[i].data;
          const zipId = data.length !== 0 ? data.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid : "";
          if (zipId) tractToPlace[d.id] = zipToPlace.hasOwnProperty(zipId) ? zipToPlace[zipId].name : "";
        }
      });
    })
      .catch(err => console.log(err));
  })
    .catch(err => console.log(err));

  return tractToPlace;
};

const axios = require("axios");
const PromiseThrottle = require("promise-throttle");
const readline = require("readline");

const {CANON_LOGICLAYER_CUBE} = process.env;

const throttle = new PromiseThrottle({
  requestsPerSecond: 25,
  promiseImplementation: Promise
});

module.exports = async function(app) {
  const {db} = app.settings;

  // Get all Place/Tract/Zip level data which are in the Wayne County.

  // Find a place for each zip in Wayne County.
  const allZips = await db.search.findAll({where: {hierarchy: "Zip"}});
  // Get a place for each zip.
  const zipToPlacePromises = [];
  let zipCount = 0;
  allZips.forEach(d => {
    zipToPlacePromises.push(axios
      .get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${d.id}?targetLevels=place&overlapSize=true`)
      .then(resp => {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        zipCount++;
        process.stdout.write(`zip to place lookup: ${zipCount} of ${allZips.length} queries complete`);
        return resp.data;
      }));
  });

  const zipToPlaceObjs = {};
  const zipToPlace = {};
  const tractToPlace = {};
  await Promise.all(zipToPlacePromises)
    .then(results => {

      allZips.forEach((d, i) => {
        const data = results[i];
        zipToPlaceObjs[d.id] = data.length !== 0 ? data.sort((a, b) => b.overlap_size - a.overlap_size)[0] : "";
        zipToPlace[d.id] = zipToPlaceObjs.hasOwnProperty(d.id) ? zipToPlaceObjs[d.id].name : "";
      });

    })
    .catch(err => console.log(err));



  // Now find Zip for each tract in Wayne County & assign Place using above zipToPlace object.
  const allTracts = await db.search.findAll({where: {hierarchy: "Tract"}});
  const tractToPlacePromises = [];
  let tractCount = 0;
  allTracts.forEach(d => {
    tractToPlacePromises.push(throttle.add(() => axios
      .get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${d.id}?targetLevels=zip&overlapSize=true`))
      .then(resp => {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        tractCount++;
        process.stdout.write(`tract to place lookup: ${tractCount} of ${allTracts.length} queries complete`);
        return resp.data;
      }));
  });

  await Promise.all(tractToPlacePromises)
    .then(results2 => {
      allTracts.forEach((d, i) => {
        if (results2[i] !== undefined) {
          const data = results2[i];
          const zipId = data.length !== 0 ? data.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid : "";
          if (zipId) tractToPlace[d.id] = zipToPlaceObjs.hasOwnProperty(zipId) ? zipToPlaceObjs[zipId].name : "";
        }
      });
    })
    .catch(err => console.log(err));

  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);

  return {tractToPlace, zipToPlace};

};

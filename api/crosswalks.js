const axios = require("axios");

const {CANON_LOGICLAYER_CUBE} = process.env;

const prefixMap = {
  "050": "County",
  "160": "Place",
  "140": "Tract",
  "860": "Zip"
};

module.exports = function(app) {

  app.get("/api/geo/children/:id/", async(req, res) => {

    const {id} = req.params;
    const {level} = req.query;
    const targetLevel = level ? level.replace(/^[A-Z]{1}/g, chr => chr.toLowerCase()) : false;

    const prefix = prefixMap[id.slice(0, 3)];

    if (level === "Region") {
      res.json({cut: "05000US26163", drilldown: level});
    }
    else if (level === "Tract" && prefix === "County") {
      res.json({cut: "05000US26163", drilldown: level});
    }
    else if (prefix === level) {
      res.json({cut: "05000US26163", drilldown: level});
    }
    else if (targetLevel) {
      const cuts = await axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevel}`)
        .then(resp => resp.data)
        .then(arr => arr.map(d => d.geoid))
        .catch(() => []);
      res.json(cuts || []);
    }
    else if (prefix === "County") {
      res.json({cut: "04000US26", drilldown: "Place"});
    }
    else {
      res.json({cut: "05000US26163", drilldown: "Tract"});
    }

  });

};

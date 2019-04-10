const axios = require("axios"),
      sequelize = require("sequelize"),
      url = require("url");

const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/image/:id/:size", async(req, res) => {
    const {id, size} = req.params;

    /** Sends the finally found image, and includes fallbacks */
    async function sendImage(image) {

      const id = image || "76";
      if (size === "json") {
        const resp = await db.images.findOne({where: {id}});
        res.json(resp);
      }
      else {
        res.sendFile(`${process.cwd()}/static/images/profile/${size}/${id}.jpg`, err => {
          if (err) res.status(err.status);
          res.end();
        });
      }

    }

    const attr = await db.search.findOne({where: {[sequelize.Op.or]: {id, slug: id}}});

    if (!attr) sendImage(false);
    else {

      const {imageId} = attr;

      if (!imageId) {

        const ids = axios
          .get(url.resolve(CANON_LOGICLAYER_CUBE, `/geoservice-api/relations/parents/${attr.id}?targetLevels=county,place,zip`))
          .then(d => d.data.reverse())
          .then(d => d.map(p => p.geoid))
          .catch(() => []);

        const parentAttrs = await db.search.findAll({where: {id: ids}}).catch(() => []);

        const parentImage = parentAttrs
          .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
          .find(p => p.imageId);

        sendImage(parentImage ? parentImage.imageId : false);

      }
      else sendImage(imageId);

    }
  });

};

const axios = require("axios"),
      sequelize = require("sequelize"),
      url = require("url");

const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/image/:id/:size", (req, res) => {
    const {id, size} = req.params;

    /** Sends the finally found image, and includes fallbacks */
    function sendImage(image) {

      const id = image || "76";
      if (size === "json") db.images.findOne({where: {id}}).then(resp => res.json(resp));
      else res.sendFile(`${process.cwd()}/static/images/profile/${size}/${id}.jpg`);

    }

    db.search.findOne({where: {[sequelize.Op.or]: {id, slug: id}}})
      .then(attr => {

        if (!attr) sendImage(false);
        else {

          const {imageId} = attr;

          if (!imageId) {

            axios.get(url.resolve(CANON_LOGICLAYER_CUBE, `/geoservice-api/relations/parents/${attr.id}`))
              .then(d => d.data.reverse())
              .then(d => d.map(p => p.geoid))
              .then(d => {
                const attrs = db.search.findAll({where: {id: d}});
                return Promise.all([d, attrs]);
              })
              .then(([ids, parentAttrs]) => {
                const parentImage = parentAttrs
                  .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
                  .find(p => p.imageId).imageId;
                sendImage(parentImage);
              });

          }
          else sendImage(imageId);

        }

      });
  });

};

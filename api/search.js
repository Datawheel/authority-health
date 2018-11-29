const sequelize = require("sequelize");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/search", async(req, res) => {

    const where = {};

    let {limit = "10"} = req.query;
    limit = parseInt(limit, 10);

    const {id, q} = req.query;

    if (q) {
      where[sequelize.Op.or] = [
        {display: {[sequelize.Op.iLike]: `%${q}%`}},
        {keywords: {[sequelize.Op.overlap]: [q]}}
      ];
    }

    if (id) where.id = id.includes(",") ? id.split(",") : id;

    const rows = await db.search.findAll({
      include: [{model: db.images}],
      limit,
      order: [["zvalue", "DESC"]],
      where
    });

    const results = rows.map(d => ({
      level: d.hierarchy.toLowerCase(),
      geoid: d.id,
      image: d.image,
      keywords: d.keywords,
      name: d.display,
      slug: d.slug
    }));

    res.json(results);

  });

};

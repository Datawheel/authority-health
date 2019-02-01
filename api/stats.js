module.exports = function(app) {

  const {cache} = app.settings;

  app.get("/api/topstats", async(req, res) => {
    res.json(cache.stats);
  });
};

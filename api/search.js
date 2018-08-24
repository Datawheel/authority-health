module.exports = function(app) {

  const {populations} = app.settings.cache;
  
  app.get("/api/search", (req, res) => {

    const {q, id} = req.query;

    let filteredPopulation = populations;

    if (id) filteredPopulation = populations.find(obj => obj.geoid === id);
    else if (q) filteredPopulation = populations.filter(obj => obj.name.toLowerCase().includes(q.toLowerCase()));

    res.json(filteredPopulation).end();

  });

};

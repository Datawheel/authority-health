const {CANON_API, CANON_LOGICLAYER_CUBE} = process.env;

/**
    The object that this file exports is used to set configurations for canon
    and it's sub-modules.
*/
module.exports = {
  logiclayer: {
    cubeFilters: [
      {
        filter: cubes => cubes.filter(c => c.name.includes("_5")),
        key: cube => cube.name.replace(/_[0-9]$/g, "")
      }
    ],
    relations: {
      Geography: {
        tracts: {
          url: id => `${CANON_API}/api/geo/children/${id}/?level=Tract`
        },
        regions: {
          url: id => `${CANON_API}/api/geo/children/${id}/?level=Region`
        },
        zips: {
          url: id => `${CANON_API}/api/geo/children/${id}/?level=Zip`
        }
      }
    },
    substitutions: {
      Geography: {
        levels: {
          County: ["County"],
          Place: ["County"],
          Tract: ["Zip", "Place", "County"],
          Zip: ["Tract", "Place", "County"]
        },
        url: (id, level) => {
          const targetLevel = level.replace(/^[A-Z]{1}/g, chr => chr.toLowerCase());
          return `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevel}&overlapSize=true`;
        },
        callback: arr => {
          arr = arr.filter(d => d.level !== "county");
          if (!arr.length) return "05000US26163";
          return arr.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid;
        }
      }
    }
  }
};

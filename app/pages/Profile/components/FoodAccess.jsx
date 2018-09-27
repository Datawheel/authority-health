import React from "react";
// import {connect} from "react-redux";
import {BarChart, Treemap} from "d3plus-react";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "./Stat";

class FoodAccess extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Food Access</SectionTitle>
        <article>
          Some text about food access and some about its stats.
          <Stat 
            title="Food title"
            value={0}
          />
          {/* <BarChart  /> */}
        </article>
        <Treemap config={{
          data: "/api/data?measures=Farmers%27%20markets,Grocery%20stores,Supercenters%20and%20club%20stores,Convenience%20stores&County=05000US26163&Year=all",
          groupBy: "StoreType",
          height: 300,
          width: 400,
          label: d => d.StoreType,
          legend: true,
          sum: d => d[d.StoreType]
        }}
        dataFormat={resp => {
          const storeTypes = [];
          resp.source[0].measures.forEach(storeType => storeTypes.push(storeType));

          const data = [];
          storeTypes.map(storeType => {
            const result = resp.data.reduce((acc, currentValue) => {
              if (acc === null && currentValue[storeType] !== null) {
                return Object.assign({}, currentValue, {StoreType: storeType});
              }
              return acc;
            }, null);
            data.push(result);
          });
          return data;
        }}
        />
      </SectionColumns>
    );
  }
}

FoodAccess.defaultProps = {
  slug: "FoodAccess"
};

export default FoodAccess;

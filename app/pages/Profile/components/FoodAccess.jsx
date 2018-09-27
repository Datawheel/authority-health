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
          data: "/api/data?measures=Farmers%27%20markets,Grocery%20stores,Supercenters%20and%20club%20stores,Convenience%20stores,Fast-food%20restaurants,Full-service%20restaurants&County=05000US26163&Year=all",
          groupBy: ["Group", "FoodServiceType"],
          height: 400,
          width: 600,
          legend: true,
          sum: d => d[d.FoodServiceType]
        }}
        dataFormat={resp => {
          const storeTypes = [];
          const restaurantTypes = [];
          resp.source[0].measures.forEach(foodServiceType => foodServiceType.toLowerCase().includes("restaurant") ? restaurantTypes.push(foodServiceType) : storeTypes.push(foodServiceType));
          const data = [];
          storeTypes.map(storeType => {
            const result = resp.data.reduce((acc, currentValue) => {
              if (acc === null && currentValue[storeType] !== null) {
                return Object.assign({}, currentValue, {FoodServiceType: storeType, Group: "Stores"});
              }
              return acc;
            }, null);
            data.push(result);
          });
          restaurantTypes.map(restaurantType => {
            const result = resp.data.reduce((acc, currentValue) => {
              if (acc === null && currentValue[restaurantType] !== null) {
                return Object.assign({}, currentValue, {FoodServiceType: restaurantType, Group: "Restaurants"});
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

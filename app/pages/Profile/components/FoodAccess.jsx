import React from "react";
import {connect} from "react-redux";
import {Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "./Stat";

class FoodAccess extends SectionColumns {

  render() {

    const {snapWicData} = this.props;
    const snapWicArr = ["SNAP-authorized stores", "WIC-authorized stores"];
    const snapWicLatestData = [];
    snapWicArr.map(d => {
      const result = snapWicData.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue[d] !== null) {
          return Object.assign({}, currentValue, {FoodServiceType: d, Group: "Restaurants"});
        }
        return acc;
      }, null);
      snapWicLatestData.push(result);
    });

    return (
      <SectionColumns>
        <SectionTitle>Food Access</SectionTitle>
        <article>
          <Stat 
            title={`SNAP-authorized stores in ${snapWicLatestData[0]["ID Year"]}`}
            value={formatAbbreviate(snapWicLatestData[0]["SNAP-authorized stores"])}
          />
          <Stat
            title={`WIC-authorized stores in ${snapWicLatestData[1]["ID Year"]}`}
            value={formatAbbreviate(snapWicLatestData[1]["WIC-authorized stores"])}
          />
          <br/><br/>
          The total number of SNAP-authorized stores in Wayne County in {snapWicLatestData[0]["ID Year"]} were {formatAbbreviate(snapWicLatestData[0]["SNAP-authorized stores"])} and WIC-authorized stores in {snapWicLatestData[1]["ID Year"]} were {formatAbbreviate(snapWicLatestData[1]["WIC-authorized stores"])}.
          <br/><br/>
          The Treemap here shows the percentage of Fast-food restaurants, Full-service restaurants, Convinence stores, Grocery stores, Supercenters and Farmers market in Wayne County.
        </article>
        <Treemap config={{
          data: "/api/data?measures=Farmers%27%20markets,Grocery%20stores,Supercenters%20and%20club%20stores,Convenience%20stores,Fast-food%20restaurants,Full-service%20restaurants&County=05000US26163&Year=all",
          groupBy: ["Group", "FoodServiceType"],
          height: 400,
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

FoodAccess.need = [
  fetchData("snapWicData", "/api/data?measures=SNAP-authorized%20stores,WIC-authorized%20stores&County=05000US26163&Year=all")
];

const mapStateToProps = state => ({
  snapWicData: state.data.snapWicData
});

export default connect(mapStateToProps)(FoodAccess);

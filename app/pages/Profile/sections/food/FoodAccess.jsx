import React from "react";
import {connect} from "react-redux";
import {Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class FoodAccess extends SectionColumns {

  render() {

    const {snapWicData} = this.props;
    const snapWicArr = snapWicData.source[0].measures;
    const snapWicLatestData = snapWicArr.map(d => {
      const result = snapWicData.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue[d] !== null) {
          return Object.assign({}, currentValue, {FoodServiceType: d, Group: "Restaurants"});
        }
        return acc;
      }, null);
      return result;
    });

    const snapLatestYear = snapWicLatestData[0]["ID Year"];
    const snapLatestValue = formatAbbreviate(snapWicLatestData[0]["SNAP-authorized stores"]);
    const county = snapWicData.data[0].County;
    const countyId = snapWicData.data[0]["ID County"];

    return (
      <SectionColumns>
        <SectionTitle>Food Access</SectionTitle>
        <article>
          <Stat 
            title={`SNAP-authorized stores in ${snapLatestYear}`}
            value={snapLatestValue}
          />
          <Stat
            title={`WIC-authorized stores in ${snapWicLatestData[1]["ID Year"]}`}
            value={formatAbbreviate(snapWicLatestData[1]["WIC-authorized stores"])}
          />
          <p>The total number of SNAP-authorized stores in {county} County in {snapLatestYear} were {snapLatestValue} and WIC-authorized stores in {snapWicLatestData[1]["ID Year"]} were {formatAbbreviate(snapWicLatestData[1]["WIC-authorized stores"])}.</p>
          <p>The Treemap here shows the percentage of Fast-food restaurants, Full-service restaurants, Convinence stores, Grocery stores, Specialized food stores, Supercenters and Farmers market in the {county} County.</p>
        </article>
        <Treemap config={{
          data: `/api/data?measures=Farmers%27%20markets,Grocery%20stores,Supercenters%20and%20club%20stores,Convenience%20stores,Fast-food%20restaurants,Full-service%20restaurants,Specialized%20food%20stores&County=${countyId}&Year=all`,
          groupBy: ["Group", "FoodServiceType"],
          height: 400,
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
  slug: "food-access"
};

FoodAccess.need = [
  fetchData("snapWicData", "/api/data?measures=SNAP-authorized%20stores,WIC-authorized%20stores&County=<id>&Year=all")
];

const mapStateToProps = state => ({
  snapWicData: state.data.snapWicData
});

export default connect(mapStateToProps)(FoodAccess);

import React from "react";
import {connect} from "react-redux";
import {Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class FoodAccess extends SectionColumns {

  render() {

    const {snapWicData} = this.props;

    // Get latest year SNAP and WIC authorized stores data
    const snapWicArr = ["SNAP", "WIC"];
    const snapWicLatestData = snapWicArr.map(d => {
      const result = snapWicData.reduce((acc, currentValue) => {
        if (acc === null && currentValue["Assistance Type"] !== null && currentValue["Assistance Type"] === d) {
          return currentValue;
        }
        return acc;
      }, null);
      return result;
    });

    // Get SNAP latest year data:
    const snapLatestYear = snapWicLatestData[0]["ID Year"];
    const snapLatestYearValue = formatAbbreviate(snapWicLatestData[0]["Number of Stores"]);

    // Get WIC latest year data:
    const wicLatestYear = snapWicLatestData[1]["ID Year"];
    const wicLatestYearValue = formatAbbreviate(snapWicLatestData[1]["Number of Stores"]);

    // Get county information for current location
    const county = snapWicData[0].County;
    const countyId = snapWicData[0]["ID County"];

    return (
      <SectionColumns>
        <SectionTitle>Food Access</SectionTitle>
        <article>
          <Stat 
            title={`SNAP-authorized stores in ${snapLatestYear}`}
            value={snapLatestYearValue}
          />
          <Stat
            title={`WIC-authorized stores in ${wicLatestYear}`}
            value={wicLatestYearValue}
          />
          <p>The total number of SNAP-authorized stores in {county} County in {snapLatestYear} were {snapLatestYearValue} and WIC-authorized stores in {wicLatestYear} were {wicLatestYearValue}.</p>
          <p>The Treemap here shows the percentage of Fast-food restaurants, Full-service restaurants, Convinence stores, Grocery stores, Specialized food stores, Supercenters and Farmers market in the {county} County.</p>
        </article>

        {/* Draw a Treemap to show types of stores and restaurants. */}
        <Treemap config={{
          data: `/api/data?measures=Number%20of%20Stores&drilldowns=Sub-category&County=${countyId}&Year=all`,
          groupBy: ["Group", "Sub-category"],
          height: 400,
          sum: d => d["Number of Stores"],
          tooltipConfig: {tbody: [["Count:", d => `${d["Number of Stores"]} in ${d.Year}`]]}
        }}
        dataFormat={resp => {
          // Find and return an array of objects for the latest year data for each store type and restaurant type.
          const storeTypes = ["Farmers' markets", "Convenience stores", "Grocery stores", "Specialized food stores", "Supercenters and club stores"];
          const restaurantTypes = ["Fast-food restaurants", "Full-service restaurants"];
          const data = [];
          storeTypes.map(storeType => {
            const result = resp.data.reduce((acc, currentValue) => {
              if (acc === null && currentValue["Sub-category"] !== null && currentValue["Sub-category"] === storeType) {
                return Object.assign({}, currentValue, {Group: "Stores"});
              }
              return acc;
            }, null);
            data.push(result);
          });
          restaurantTypes.map(restaurantType => {
            const result = resp.data.reduce((acc, currentValue) => {
              if (acc === null && currentValue["Sub-category"] !== null && currentValue["Sub-category"] === restaurantType) {
                return Object.assign({}, currentValue, {Group: "Restaurants"});
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
  fetchData("snapWicData", "/api/data?measures=Number%20of%20Stores&drilldowns=Assistance%20Type&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  snapWicData: state.data.snapWicData
});

export default connect(mapStateToProps)(FoodAccess);

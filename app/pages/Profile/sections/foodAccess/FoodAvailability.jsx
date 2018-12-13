import React from "react";
import {connect} from "react-redux";
import {format} from "d3-format";
import {Treemap} from "d3plus-react";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const commas = format(",d");

class FoodAvailability extends SectionColumns {

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
    const snapLatestYear = snapWicLatestData[0].Year;
    const snapLatestYearValue = snapWicLatestData[0]["Number of Stores"];

    // Get WIC latest year data:
    const wicLatestYear = snapWicLatestData[1].Year;
    const wicLatestYearValue = snapWicLatestData[1]["Number of Stores"];

    // Get county information for current location
    const county = snapWicData[0].Geography;
    const countyId = snapWicData[0]["ID Geography"];

    return (
      <SectionColumns>
        <SectionTitle>Food Availability</SectionTitle>
        <article>
          <Stat
            title="SNAP-authorized stores"
            year={snapLatestYear}
            value={commas(snapLatestYearValue)}
          />
          <Stat
            title="WIC-authorized stores"
            year={wicLatestYear}
            value={wicLatestYearValue}
          />
          <p>The average monthly number of SNAP-authorized stores in {county} County in {snapLatestYear} was {commas(snapLatestYearValue)} and there were {commas(wicLatestYearValue)} WIC-authorized stores in {wicLatestYear}.</p>
          <p>The chart here shows the share of fast-food restaurants, full-service restaurants, convinence stores, grocery stores, specialized food stores, supercenters and farmers market in the {county} County.</p>
        </article>

        {/* Draw a Treemap to show types of stores and restaurants. */}
        <Treemap config={{
          data: `/api/data?measures=Number%20of%20Stores&drilldowns=Sub-category&County=${countyId}&Year=all`,
          groupBy: ["Group", "Sub-category"],
          label: d => d["Sub-category"] instanceof Array ? titleCase(d.Group) : titleCase(d["Sub-category"]),
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

FoodAvailability.defaultProps = {
  slug: "food-availability"
};

FoodAvailability.need = [
  fetchData("snapWicData", "/api/data?measures=Number%20of%20Stores&drilldowns=Assistance%20Type&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  snapWicData: state.data.snapWicData
});

export default connect(mapStateToProps)(FoodAvailability);

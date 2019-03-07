import React from "react";
import {connect} from "react-redux";
import {format} from "d3-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";

const commas = format(",d");

class FoodStamps extends SectionColumns {

  render() {

    const {snapWicData} = this.props;
    const isSnapWicDataAvailableForCurrentGeography = snapWicData.source[0].substitutions.length === 0;

    // Get latest year SNAP and WIC authorized stores data
    const snapWicArr = ["SNAP", "WIC"];
    const snapWicLatestData = snapWicArr.map(d => {
      const result = snapWicData.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue["Assistance Type"] !== null && currentValue["Assistance Type"] === d) {
          return currentValue;
        }
        return acc;
      }, null);
      return result;
    });

    // Get SNAP latest year data:
    const snapLatestYear = snapWicLatestData[0].Year;
    const snapLatestYearValue = snapWicLatestData[0]["Number of Nutrition Assistance Stores"];

    // Get WIC latest year data:
    const wicLatestYear = snapWicLatestData[1].Year;
    const wicLatestYearValue = snapWicLatestData[1]["Number of Nutrition Assistance Stores"];

    // Get county information for current location
    const county = snapWicData.data[0].Geography;

    return (
      <SectionColumns>
        <SectionTitle>Food Stamps</SectionTitle>
        <article>
          {isSnapWicDataAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">Showing data for {snapWicData.data[0].Geography}.</div>}
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
          <p>The average monthly number of SNAP-authorized stores in {county} in {snapLatestYear} was {commas(snapLatestYearValue)} and there were {commas(wicLatestYearValue)} WIC-authorized stores in {wicLatestYear}.</p>
          <Contact slug={this.props.slug} />
        </article>
      </SectionColumns>
    );
  }
}

FoodStamps.defaultProps = {
  slug: "food-stamps"
};

FoodStamps.need = [
  fetchData("snapWicData", "/api/data?measures=Number of Nutrition Assistance Stores&drilldowns=Assistance Type&Geography=<id>&Year=all") // getting all year data since WIC and SNAP both have different latest years.
];

const mapStateToProps = state => ({
  snapWicData: state.data.snapWicData
});

export default connect(mapStateToProps)(FoodStamps);

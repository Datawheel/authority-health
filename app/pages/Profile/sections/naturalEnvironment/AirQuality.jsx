import React from "react";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class AirQuality extends SectionColumns {

  render() {

    const {airPollutants} = this.props;
    console.log("airPollutants: ", airPollutants);

    // Get the Poverty by Race data.
    const recentYearAirPollutants = {};
    nest()
      .key(d => d.Year)
      .entries(airPollutants)
      .forEach(group => {
        group.key >= airPollutants[0].Year ? Object.assign(recentYearAirPollutants, group) : {};
      });
    // const filterDataBelowPovertyByRace = filterOutTotalRaceData.filter(d => d["ID Poverty Status"] === 0);

    recentYearAirPollutants.values.sort((a, b) => b["Number of Days"] - a["Number of Days"]);
    const topRecentYearAirPollutants = recentYearAirPollutants.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Air Quality</SectionTitle>
        <article>
          {/* <Stat 
            title={`Top Air Poluutants in ${topRecentYearAirPollutants.Year}`}
            value={`${topRecentYearAirPollutants.Category} ${this.forceUpdate(topRecentYearAirPollutants["Number of Days"])}`}
          /> */}

          <BarChart config={{
            data: airPollutants,
            discrete: "y",
            height: 300,
            groupBy: "Category",
            legend: false,
            x: "Number of Days",
            y: "Category",
            time: "ID Year",
            label: false,
            ySort: (a, b) => a["Number of Days"] - b["Number of Days"],
            xConfig: {
              tickFormat: d => formatAbbreviate(d),
              labelRotation: false,
              title: "Number of days"
            },
            yConfig: {
              title: "Types of Pollutants"
            },
            tooltipConfig: {tbody: [["Number of Days: ", d => formatAbbreviate(d["Number of Days"])]]}
          }}
          />
        </article>
      </SectionColumns>
    );
  }
}

AirQuality.defaultProps = {
  slug: "air-quality"
};

AirQuality.need = [
  fetchData("airPollutants", "/api/data?measures=Number%20of%20Days&drilldowns=Category&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  airPollutants: state.data.airPollutants
});

export default connect(mapStateToProps)(AirQuality);

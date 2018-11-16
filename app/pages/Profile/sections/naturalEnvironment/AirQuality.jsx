import React from "react";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class AirQuality extends SectionColumns {

  render() {

    const {airPollutants, airQualityStats} = this.props;

    // Get the air polutants data.
    const recentYearAirPollutants = {};
    nest()
      .key(d => d.Year)
      .entries(airPollutants)
      .forEach(group => {
        group.key >= airPollutants[0].Year ? Object.assign(recentYearAirPollutants, group) : {};
      });

    // Find top recent year air polutants data:
    recentYearAirPollutants.values.sort((a, b) => b["Number of Days"] - a["Number of Days"]);
    const topRecentYearAirPollutants = recentYearAirPollutants.values[0];

    // Get the air polutants data.
    const recentYearAirQualityStats = {};
    nest()
      .key(d => d.Year)
      .entries(airQualityStats)
      .forEach(group => {
        group.key >= airQualityStats[0].Year ? Object.assign(recentYearAirQualityStats, group) : {};
      });

    return (
      <SectionColumns>
        <SectionTitle>Air Quality</SectionTitle>
        <article>
          <Stat
            title={`Top Air Polutants in ${topRecentYearAirPollutants.Year}`}
            value={`${topRecentYearAirPollutants.Category} ${formatAbbreviate(topRecentYearAirPollutants["Number of Days"])} Days`}
          />
          <Stat
            title={`Median Air Quality Index in ${recentYearAirQualityStats.values[0].Year}`}
            value={`${recentYearAirQualityStats.values[0].County} ${recentYearAirQualityStats.values[0]["Median AQI"]}`}
          />

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
        {/* Lineplot to show Median AQI stats over the years in the Waye county. */}
        <LinePlot config={{
          data: airQualityStats,
          discrete: "x",
          height: 250,
          legend: false,
          groupBy: "ID County",
          label: d => d.Year,
          x: "Year",
          xConfig: {
            title: "Year"
          },
          y: "Median AQI",
          yConfig: {
            title: "Median AQI"
          },
          tooltipConfig: {tbody: [["Value", d => d["Median AQI"]]]}
        }}
        />
      </SectionColumns>
    );
  }
}

AirQuality.defaultProps = {
  slug: "air-quality"
};

AirQuality.need = [
  fetchData("airPollutants", "/api/data?measures=Number%20of%20Days&drilldowns=Category&County=<id>&Year=all", d => d.data),
  fetchData("airQualityStats", "/api/data?measures=Median%20AQI&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  airPollutants: state.data.airPollutants,
  airQualityStats: state.data.airQualityStats
});

export default connect(mapStateToProps)(AirQuality);

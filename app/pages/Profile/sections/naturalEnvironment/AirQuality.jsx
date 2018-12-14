import React from "react";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, LinePlot, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

class AirQuality extends SectionColumns {

  render() {

    const {airQualityDays, airQualityMedianAQIs, airPollutants} = this.props;

    // Get the air polutants data.
    const recentYearAirQualityDays = {};
    nest()
      .key(d => d.Year)
      .entries(airQualityDays)
      .forEach(group => {
        group.key >= airQualityDays[0].Year ? Object.assign(recentYearAirQualityDays, group) : {};
      });

    // Find top recent year air polutants data:
    recentYearAirQualityDays.values.sort((a, b) => b["Number of Days"] - a["Number of Days"]);
    const topRecentYearAirQualityDays = recentYearAirQualityDays.values[0];

    // Get the air quality median AQI data.
    const recentYearAirQualityMedianAQIs = {};
    nest()
      .key(d => d.Year)
      .entries(airQualityMedianAQIs)
      .forEach(group => {
        group.key >= airQualityMedianAQIs[0].Year ? Object.assign(recentYearAirQualityMedianAQIs, group) : {};
      });

    // Get the air polutants data.
    const recentYearAirPollutantsData = {};
    nest()
      .key(d => d.Year)
      .entries(airPollutants)
      .forEach(group => {
        group.key >= airPollutants[0].Year ? Object.assign(recentYearAirPollutantsData, group) : {};
      });
    recentYearAirPollutantsData.values.sort((a, b) => b["Number of Days"] - a["Number of Days"]);
    const topRecentYearAirPollutant = recentYearAirPollutantsData.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Air Quality</SectionTitle>
        <article>
          <Stat
            title={"Top Air quality days"}
            year={topRecentYearAirQualityDays.Year}
            value={topRecentYearAirQualityDays.Category}
            qualifier={`${formatAbbreviate(topRecentYearAirQualityDays["Number of Days"])} Days`}
          />
          <Stat
            title={"Median Air Quality Index"}
            year={recentYearAirQualityMedianAQIs.values[0].Year}
            value={recentYearAirQualityMedianAQIs.values[0].Geography}
            qualifier={recentYearAirQualityMedianAQIs.values[0]["Median AQI"]}
          />
          <Stat
            title={`Top Air Pollutants in ${topRecentYearAirPollutant.Year}`}
            year={topRecentYearAirPollutant.Geography}
            value={topRecentYearAirPollutant.Pollutant}
            qualifier={`${topRecentYearAirPollutant["Number of Days"]} days`}
          />

          {/* Barchart to show Air quality days for current location. */}
          <BarChart config={{
            data: airQualityDays,
            discrete: "y",
            height: 200,
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
            tooltipConfig: {tbody: [["Number of Days: ", d => formatAbbreviate(d["Number of Days"])]]}
          }}
          />

          {/* Draw a Treemap for Air Pollutants. */}
          <Treemap config={{
            data: airPollutants,
            height: 200,
            sum: d => d["Number of Days"],
            legend: false,
            groupBy: "Pollutant",
            time: "Year",
            title: "Air Pollutants",
            tooltipConfig: {tbody: [["", d => `${d["Number of Days"]} days`]]}
          }}
          />
        </article>

        {/* Lineplot to show Median AQI stats over the years in the Waye county. */}
        <LinePlot config={{
          data: airQualityMedianAQIs,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "ID Geography",
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
  fetchData("airQualityDays", "/api/data?measures=Number of Days&drilldowns=Category&Geography=<id>&Year=all", d => d.data),
  fetchData("airQualityMedianAQIs", "/api/data?measures=Median AQI&Geography=<id>&Year=all", d => d.data),
  fetchData("airPollutants", "/api/data?measures=Number of Days&drilldowns=Pollutant&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  airQualityDays: state.data.airQualityDays,
  airQualityMedianAQIs: state.data.airQualityMedianAQIs,
  airPollutants: state.data.airPollutants
});

export default connect(mapStateToProps)(AirQuality);

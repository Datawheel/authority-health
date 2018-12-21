import React from "react";
import {nest} from "d3-collection";
import {sum} from "d3-array";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

import Stat from "../../../../components/Stat";

class AirQuality extends SectionColumns {

  render() {

    const {airQualityDays, airQualityMedianAQIs, airPollutants} = this.props;
    console.log("airQualityDays: ", airQualityDays);

    // Get the air polutants data.
    const recentYearAirQualityDays = {};
    nest()
      .key(d => d.Year)
      .entries(airQualityDays)
      .forEach(group => {
        group.key >= airQualityDays[0].Year ? Object.assign(recentYearAirQualityDays, group) : {};
      });

    // Find top recent year air polutants data:
    const totalNumberOfDays = sum(recentYearAirQualityDays.values, d => d["Number of Days"]);
    recentYearAirQualityDays.values.forEach(d => d.share = d["Number of Days"] / totalNumberOfDays * 100);
    console.log("recentYearAirQualityDays: ", recentYearAirQualityDays);
    recentYearAirQualityDays.values.sort((a, b) => b.share - a.share);
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
    console.log("airPollutants: ", airPollutants);

    return (
      <SectionColumns>
        <SectionTitle>Air Quality</SectionTitle>
        <article>
          <Stat
            title={"Days with good quality"}
            year={topRecentYearAirQualityDays.Year}
            value={formatPercentage(topRecentYearAirQualityDays.share)}
            qualifier={`${formatAbbreviate(topRecentYearAirQualityDays["Number of Days"])} of 90 days measured`}
          />
          <Stat
            title={"Median Air Quality Index"}
            year={recentYearAirQualityMedianAQIs.values[0].Year}
            value={recentYearAirQualityMedianAQIs.values[0]["Median AQI"]}
          />
          <Stat
            title={"Most common air pollutant"}
            year={topRecentYearAirPollutant.Year}
            value={topRecentYearAirPollutant.Pollutant}
            qualifier={`${topRecentYearAirPollutant["Number of Days"]} days`}
          />

          {/* Lineplot to show air pollutants over the years. */}
          <LinePlot config={{
            data: airPollutants,
            discrete: "x",
            height: 200,
            legend: false,
            groupBy: "Pollutant",
            x: "Year",
            y: "Number of Days",
            yConfig: {
              title: "Air Pollutants"
            },
            tooltipConfig: {tbody: [["Number of Days", d => d["Number of Days"]]]}
          }}
          />

          {/* Lineplot to show Median AQI stats over the years in the Waye county. */}
          <LinePlot config={{
            data: airQualityMedianAQIs,
            discrete: "x",
            height: 200,
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
        </article>

        {/* Lineplot to show air pollutants over the years. */}
        <LinePlot config={{
          data: airQualityDays,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Category",
          x: "Year",
          y: "Number of Days",
          yConfig: {
            title: "Air Quality"
          },
          tooltipConfig: {tbody: [["Number of Days", d => d["Number of Days"]]]}
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

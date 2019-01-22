import React from "react";
import {nest} from "d3-collection";
import {sum} from "d3-array";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

import Stat from "../../../../components/Stat";

class AirQuality extends SectionColumns {

  render() {

    const {airQualityDays, airQualityMedianAQIs, airPollutants} = this.props;

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isAirQualityDaysAvailableForCurrentGeography = airQualityDays.source[0].substitutions.length === 0;

    // Get the air polutants data.
    const recentYearAirQualityDays = {};
    nest()
      .key(d => d.Year)
      .entries(airQualityDays.data)
      .forEach(group => {
        group.key >= airQualityDays.data[0].Year ? Object.assign(recentYearAirQualityDays, group) : {};
      });

    // Find top recent year air polutants data:
    const totalNumberOfDays = sum(recentYearAirQualityDays.values, d => d["Air Quality Days"]);
    recentYearAirQualityDays.values.forEach(d => d.share = d["Air Quality Days"] / totalNumberOfDays * 100);
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
    recentYearAirPollutantsData.values.sort((a, b) => b["Air Pollutant Days"] - a["Air Pollutant Days"]);
    const topRecentYearAirPollutant = recentYearAirPollutantsData.values[0];
    
    return (
      <SectionColumns>
        <SectionTitle>Air Quality</SectionTitle>
        <article>
          {isAirQualityDaysAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">Showing data for {airQualityDays.data[0].Geography}.</div>}
          <Stat
            title={"Days with good quality"}
            year={topRecentYearAirQualityDays.Year}
            value={formatPercentage(topRecentYearAirQualityDays.share)}
            qualifier={`${topRecentYearAirQualityDays["Air Quality Days"]} of 90 days measured`}
          />
          <Stat
            title={"Most common air pollutant"}
            year={topRecentYearAirPollutant.Year}
            value={topRecentYearAirPollutant.Pollutant}
            qualifier={`${topRecentYearAirPollutant["Air Pollutant Days"]} days`}
          />
          <Stat
            title={"Median Air Quality Index"}
            year={recentYearAirQualityMedianAQIs.values[0].Year}
            value={recentYearAirQualityMedianAQIs.values[0]["Median AQI"]}
          />

          <p>{topRecentYearAirQualityDays["Air Quality Days"]} of 90 days measured were good quality air in {topRecentYearAirQualityDays.Year}. The most common air pollutants was {topRecentYearAirPollutant.Pollutant} ({topRecentYearAirPollutant.Year}) and the median AQI was {recentYearAirQualityMedianAQIs.values[0]["Median AQI"]} in {recentYearAirQualityMedianAQIs.values[0].Geography}.</p>
          <p>The following charts show the distribution of air quality days, air pollutants and median AQI over years.</p>

          {/* Lineplot to show air pollutants over the years. */}
          <LinePlot config={{
            data: airPollutants,
            discrete: "x",
            height: 200,
            title: "Air Pollutants Over Years",
            legend: false,
            groupBy: "Pollutant",
            x: "Year",
            y: "Air Pollutant Days",
            yConfig: {
              title: "Testing Days"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Air Pollutant Days", d => d["Air Pollutant Days"]], ["Location", d => d.Geography]]}
          }}
          />

          {/* Lineplot to show Median AQI stats over the years in the Waye county. */}
          <LinePlot config={{
            data: airQualityMedianAQIs,
            discrete: "x",
            height: 200,
            title: "Median AQI Over Years",
            legend: false,
            groupBy: "Geography",
            x: "Year",
            xConfig: {
              title: "Year"
            },
            y: "Median AQI",
            yConfig: {
              title: "Median AQI"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Median AQI", d => d["Median AQI"]], ["Location", d => d.Geography]]}
          }}
          />
        </article>

        {/* Lineplot to show air pollutants over the years. */}
        <LinePlot config={{
          data: airQualityDays.data,
          discrete: "x",
          height: 400,
          title: "Air Quality Over Years",
          legend: false,
          label: d => titleCase(d.Category),
          groupBy: "Category",
          x: "Year",
          y: "Air Quality Days",
          yConfig: {
            title: "Testing Days"
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Air Quality Days", d => d["Air Quality Days"]], ["Location", d => d.Geography]]}
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
  fetchData("airQualityDays", "/api/data?measures=Air Quality Days&drilldowns=Category&Geography=<id>&Year=all"),
  fetchData("airQualityMedianAQIs", "/api/data?measures=Median AQI&Geography=<id>&Year=all", d => d.data),
  fetchData("airPollutants", "/api/data?measures=Air Pollutant Days&drilldowns=Pollutant&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  airQualityDays: state.data.airQualityDays,
  airQualityMedianAQIs: state.data.airQualityMedianAQIs,
  airPollutants: state.data.airPollutants
});

export default connect(mapStateToProps)(AirQuality);

import React from "react";
import {sum} from "d3-array";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";

class AirQuality extends SectionColumns {

  render() {

    const {meta, airQualityDays, airQualityMedianAQIs, airPollutants} = this.props;

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isAirQualityDaysAvailableForCurrentGeography = airQualityDays.source[0].substitutions.length === 0;

    // Get top recent year air polutants data
    const totalNumberOfDays = sum(airQualityDays.data, d => d["Air Quality Days"]);
    airQualityDays.data.forEach(d => d.share = d["Air Quality Days"] / totalNumberOfDays * 100);
    const topRecentYearAirQualityDays = airQualityDays.data.sort((a, b) => b.share - a.share)[0];

    // Get top air polutants data.
    const topRecentYearAirPollutant = airPollutants.sort((a, b) => b["Air Pollutant Days"] - a["Air Pollutant Days"])[0];

    return (
      <SectionColumns>
        <SectionTitle>Air Quality</SectionTitle>
        <article>
          {isAirQualityDaysAvailableForCurrentGeography ? <div></div> : <Disclaimer>data is shown for {airQualityDays.data[0].Geography}</Disclaimer>}
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
            year={airQualityMedianAQIs[0].Year}
            value={airQualityMedianAQIs[0]["Median AQI"]}
          />

          <p>{topRecentYearAirQualityDays["Air Quality Days"]} of 90 days measured were good quality air in {topRecentYearAirQualityDays.Year}. The most common air pollutants was {topRecentYearAirPollutant.Pollutant} ({topRecentYearAirPollutant.Year}) and the median AQI was {airQualityMedianAQIs[0]["Median AQI"]} in {airQualityMedianAQIs[0].Geography}.</p>

          {/* Lineplot to show air pollutants over the years. */}
          <LinePlot config={{
            data: `/api/data?measures=Air Pollutant Days&drilldowns=Pollutant&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 200,
            title: d => `Air Pollutants Over Years in ${d[0].Geography}`,
            legend: false,
            groupBy: "Pollutant",
            x: "Year",
            y: "Air Pollutant Days",
            yConfig: {
              title: "Testing Days"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Air Pollutant Days", d => d["Air Pollutant Days"]], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => resp.data}
          />

          {/* Lineplot to show Median AQI stats over the years in the Waye county. */}
          <LinePlot config={{
            data: `/api/data?measures=Median AQI&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 200,
            title: d => `Median AQI Over Years in ${d[0].Geography}`,
            legend: false,
            groupBy: "Geography",
            x: "Year",
            y: "Median AQI",
            yConfig: {
              title: "Median AQI"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Median AQI", d => d["Median AQI"]], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => resp.data}
          />
          <Contact slug={this.props.slug} />
        </article>

        {/* Lineplot to show air quality days over the years. */}
        <LinePlot config={{
          data: `/api/data?measures=Air Quality Days&drilldowns=Category&Geography=${meta.id}&Year=all`,
          discrete: "x",
          title: d => `Air Quality Over Years in ${d[0].Geography}`,
          legend: false,
          label: d => titleCase(d.Category),
          groupBy: "Category",
          x: "Year",
          y: "Air Quality Days",
          yConfig: {
            title: "Testing Days"
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Air Quality Days", d => d["Air Quality Days"]], ["County", d => d.Geography]]}
        }}
        dataFormat={resp => resp.data}
        />
      </SectionColumns>
    );
  }
}

AirQuality.defaultProps = {
  slug: "air-quality"
};

AirQuality.need = [
  fetchData("airQualityDays", "/api/data?measures=Air Quality Days&drilldowns=Category&Geography=<id>&Year=latest"),
  fetchData("airQualityMedianAQIs", "/api/data?measures=Median AQI&Geography=<id>&Year=latest", d => d.data),
  fetchData("airPollutants", "/api/data?measures=Air Pollutant Days&drilldowns=Pollutant&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  airQualityDays: state.data.airQualityDays,
  airQualityMedianAQIs: state.data.airQualityMedianAQIs,
  airPollutants: state.data.airPollutants
});

export default connect(mapStateToProps)(AirQuality);

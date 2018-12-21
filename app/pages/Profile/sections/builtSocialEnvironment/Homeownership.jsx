import React from "react";
import {connect} from "react-redux";
import {format} from "d3-format";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
const formatPropertyValue = d => `$${formatAbbreviate(d)}`;
const commas = format(",d");

class Homeownership extends SectionColumns {

  render() {

    const {occupancyData, medianHousingUnitsValueForTracts, medianHousingUnitsValueForProfile, constructionDateData} = this.props;

    // Get occupancy data data for latest year.
    const recentYearOccupancyData = {};
    nest()
      .key(d => d.Year)
      .entries(occupancyData)
      .forEach(group => {
        const total = sum(group.values, d => d["Housing Units"]);
        group.values.forEach(d => d.share = d["Housing Units"] / total * 100);
        group.key >= occupancyData[0].Year ? Object.assign(recentYearOccupancyData, group) : {};
      });
    // Find top Occupancy data for most recent year.
    const recentYearOccupiedHouses = recentYearOccupancyData.values.filter(d => d["ID Occupancy Status"] === 0);
    recentYearOccupiedHouses.sort((a, b) => b.share - a.share);
    const topOccupancyData = recentYearOccupiedHouses[0];

    // Find top Median Housing Units value for most recent year.
    const recentYearHousingValueForProfile = {};
    nest()
      .key(d => d.Year)
      .entries(medianHousingUnitsValueForProfile)
      .forEach(group => {
        group.key >= medianHousingUnitsValueForProfile[0].Year ? Object.assign(recentYearHousingValueForProfile, group) : {};
      });
    recentYearHousingValueForProfile.values.sort((a, b) => b["Property Value"] - a["Property Value"]);
    const topMedianHousingUnitsValueForProfile = recentYearHousingValueForProfile.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Homeownership</SectionTitle>
        <article>
          <Stat
            title="Median property value"
            year={topMedianHousingUnitsValueForProfile.Year}
            value={`$${commas(topMedianHousingUnitsValueForProfile["Property Value"])}`}
          />
          <Stat
            title="Median construction year"
            year={`AS OF ${constructionDateData[0].Year}`}
            value={constructionDateData[0]["Construction Date"]}
          />
          <p>The median property value in {topMedianHousingUnitsValueForProfile.Geography}, as of {topMedianHousingUnitsValueForProfile.Year}, is ${commas(topMedianHousingUnitsValueForProfile["Property Value"])}. {formatAbbreviate(topOccupancyData.share)}% of households in {topOccupancyData.Geography} County were occupied in {topOccupancyData.Year}.</p>
          <p>The following map shows the median property value for each tract in Wayne County.</p>
        </article>

        {/* Geomap to show Property Values for all tracts in the Wayne County. */}
        <Geomap config={{
          data: medianHousingUnitsValueForTracts,
          groupBy: "ID Geography",
          colorScale: "Property Value",
          colorScaleConfig: {
            axisConfig: {tickFormat: d => formatPropertyValue(d)}
          },
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Share", d => `$${formatAbbreviate(d["Property Value"])}`]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        />
      </SectionColumns>
    );
  }
}

Homeownership.defaultProps = {
  slug: "homeownership"
};

Homeownership.need = [
  fetchData("occupancyData", "/api/data?measures=Housing Units&drilldowns=Occupancy Status&Geography=<id>&Year=all", d => d.data),
  fetchData("medianHousingUnitsValueForTracts", "https://niagara.datausa.io/api/data?measures=Property Value&Year=all&Geography=05000US26163:children", d => d.data),
  fetchData("medianHousingUnitsValueForProfile", "https://niagara.datausa.io/api/data?measures=Property Value&Year=all&Geography=<id>", d => d.data),
  fetchData("constructionDateData", "/api/data?measures=Construction Date&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  occupancyData: state.data.occupancyData,
  medianHousingUnitsValueForTracts: state.data.medianHousingUnitsValueForTracts,
  medianHousingUnitsValueForProfile: state.data.medianHousingUnitsValueForProfile,
  constructionDateData: state.data.constructionDateData
});

export default connect(mapStateToProps)(Homeownership);

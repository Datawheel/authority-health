import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
const formatPopulation = d => `${formatAbbreviate(d)}%`;

class VacantHousingUnits extends SectionColumns {

  render() {

    const {occupancyData, medianHousingUnitsValue} = this.props;

    // Get the health center data for latest year.
    const recentYearOccupancyData = {};
    nest()
      .key(d => d.Year)
      .entries(occupancyData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= occupancyData[0].Year ? Object.assign(recentYearOccupancyData, group) : {};
      });

    // Filter occupancyData to remove vacant houses data.
    const filteredOccupancyData = occupancyData.filter(d => d["ID Occupancy Status"] === 0);

    // Find top Occupancy data for most recent year.
    const recentYearOccupiedHouses = recentYearOccupancyData.values.filter(d => d["ID Occupancy Status"] === 0);
    recentYearOccupiedHouses.sort((a, b) => b.share - a.share);
    const topOccupancyData = recentYearOccupiedHouses[0];

    const recentYearHousingValue = {};
    nest()
      .key(d => d.Year)
      .entries(medianHousingUnitsValue)
      .forEach(group => {
        group.key >= medianHousingUnitsValue[0].Year ? Object.assign(recentYearHousingValue, group) : {};
      });
    recentYearHousingValue.values.sort((a, b) => b["Property Value"] - a["Property Value"]);
    const topMedianHousingUnitsValue = recentYearHousingValue.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Owned Houses</SectionTitle>
        <article>
          <Stat
            title={`Top median housing value in ${topMedianHousingUnitsValue.Year}`}
            value={`${topMedianHousingUnitsValue.Geography} ${formatAbbreviate(topMedianHousingUnitsValue["Property Value"])}`}
          />
          <Stat
            title={`Maximum occupied housing units in ${topOccupancyData.Year}`}
            value={`${topOccupancyData.County} county ${formatAbbreviate(topOccupancyData.share)}%`}
          />
          <p>The Geomap shows the Median housing units value for each tract in the Wayne county.</p>
          <p>The BarChart shows the Occupied housing units in the current location.</p>
          <BarChart config={{
            data: filteredOccupancyData,
            discrete: "x",
            height: 300,
            groupBy: "Occupancy Status",
            label: d => d.Year,
            x: "Year",
            xConfig: {
              title: "Year"
            },
            y: "share",
            yConfig: {
              tickFormat: d => formatPopulation(d),
              title: "Occupied houses"
            },
            tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
          }}
          />
        </article>
        <Geomap config={{
          data: medianHousingUnitsValue,
          groupBy: "ID Geography",
          colorScale: "Property Value",
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Value", d => `$${formatAbbreviate(d["Property Value"])}`]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        />
      </SectionColumns>
    );
  }
}

VacantHousingUnits.defaultProps = {
  slug: "owned-houses"
};

VacantHousingUnits.need = [
  fetchData("occupancyData", "/api/data?measures=Population&drilldowns=Occupancy%20Status&County=<id>&Year=all", d => d.data),
  fetchData("medianHousingUnitsValue", "https://gila-cliff.datausa.io/api/data?measures=Property%20Value&Year=all&Geography=05000US26163:children", d => d.data)
];

const mapStateToProps = state => ({
  occupancyData: state.data.occupancyData,
  medianHousingUnitsValue: state.data.medianHousingUnitsValue
});

export default connect(mapStateToProps)(VacantHousingUnits);

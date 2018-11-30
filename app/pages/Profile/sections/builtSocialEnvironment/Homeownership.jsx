import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {LinePlot, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
const formatPopulation = d => `${formatAbbreviate(d)}%`;

class Homeownership extends SectionColumns {

  render() {

    const {occupancyData, medianHousingUnitsValue, constructionDateData} = this.props;

    // Get the health center data for latest year.
    const recentYearOccupancyData = {};
    nest()
      .key(d => d.Year)
      .entries(occupancyData)
      .forEach(group => {
        const total = sum(group.values, d => d["Housing Units"]);
        group.values.forEach(d => d.share = d["Housing Units"] / total * 100);
        group.key >= occupancyData[0].Year ? Object.assign(recentYearOccupancyData, group) : {};
      });

    // Filter occupancyData to remove vacant houses data.
    const filteredOccupancyData = occupancyData.filter(d => d["ID Occupancy Status"] === 0);

    // Find top Occupancy data for most recent year.
    const recentYearOccupiedHouses = recentYearOccupancyData.values.filter(d => d["ID Occupancy Status"] === 0);
    recentYearOccupiedHouses.sort((a, b) => b.share - a.share);
    const topOccupancyData = recentYearOccupiedHouses[0];

    // Find top Median Housing Units value for most recent year.
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
        <SectionTitle>Homeownership</SectionTitle>
        <article>
          <Stat
            title="Top median housing value"
            year={topMedianHousingUnitsValue.Year}
            value={topMedianHousingUnitsValue.Geography}
            qualifier={formatAbbreviate(topMedianHousingUnitsValue["Property Value"])}
          />
          <Stat
            title="Maximum occupied housing units"
            year={topOccupancyData.Year}
            value={`${topOccupancyData.County} county`}
            qualifier={`${formatAbbreviate(topOccupancyData.share)}%`}
          />
          <Stat
            title="Median house construction year"
            year={`AS OF ${  constructionDateData[0].Year}`}
            value={constructionDateData[0]["Construction Date"]}
            qualifier={`${constructionDateData[0].County} county`}
          />
          <p>The Geomap shows the Median housing units value for each tract in the Wayne county.</p>
          <p>The BarChart shows the Occupied housing units in the current location.</p>

          {/* Lineplot to show occupacy status over the years at current location */}
          <LinePlot config={{
            data: filteredOccupancyData,
            discrete: "x",
            height: 200,
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

        {/* Gepmap to show Property Values for all tracts in the Wayne County. */}
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

Homeownership.defaultProps = {
  slug: "homeownership"
};

Homeownership.need = [
  fetchData("occupancyData", "/api/data?measures=Housing%20Units&drilldowns=Occupancy%20Status&County=<id>&Year=all", d => d.data),
  fetchData("medianHousingUnitsValue", "https://katahdin.datausa.io/api/data?measures=Property%20Value&Year=all&Geography=05000US26163:children", d => d.data),
  fetchData("constructionDateData", "/api/data?measures=Construction%20Date&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  occupancyData: state.data.occupancyData,
  medianHousingUnitsValue: state.data.medianHousingUnitsValue,
  constructionDateData: state.data.constructionDateData
});

export default connect(mapStateToProps)(Homeownership);

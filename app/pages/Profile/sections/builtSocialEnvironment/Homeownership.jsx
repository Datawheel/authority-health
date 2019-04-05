import React from "react";
import {connect} from "react-redux";
import {format} from "d3-format";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import CensusTractDefinition from "components/CensusTractDefinition";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const formatPropertyValue = d => `$${formatAbbreviate(d)}`;
const formatTractName = (d, tractName) => {
  if (tractName === undefined) return d;
  else return `${d.replace(" Wayne County, MI", "")} ${tractName}`;
};
const commas = format(",d");

class Homeownership extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {tractToPlace} = this.props.topStats;
    const {occupancyData, medianHousingUnitsValueForProfile, constructionDateData} = this.props;

    const occupancyDataAvailable = occupancyData.length !== 0;
    const medianHousingUnitsValueForProfileAvailable = medianHousingUnitsValueForProfile.length !== 0;
    const constructionDateDataAvailable = constructionDateData.length !== 0;

    // Get topOccupancyData data data for latest year.
    let topOccupancyData;
    if (occupancyDataAvailable) {
      nest()
        .key(d => d.Year)
        .entries(occupancyData)
        .forEach(group => {
          const total = sum(group.values, d => d["Housing Units"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Housing Units"] / total * 100 : d.share = 0);
        });
      occupancyData.sort((a, b) => b.share - a.share);
      topOccupancyData = occupancyData[0];
    }

    // Find top Median Housing Units value for most recent year.
    let topMedianHousingUnitsValueForProfile;
    if (medianHousingUnitsValueForProfileAvailable) {
      topMedianHousingUnitsValueForProfile = medianHousingUnitsValueForProfile[0];
    }

    return (
      <SectionColumns>
        <SectionTitle>Homeownership</SectionTitle>
        <article>
          <Stat
            title="Median property value"
            year={medianHousingUnitsValueForProfileAvailable ? topMedianHousingUnitsValueForProfile.Year : ""}
            value={medianHousingUnitsValueForProfileAvailable ? `$${commas(topMedianHousingUnitsValueForProfile["Property Value"])}` : "N/A"}
          />
          <Stat
            title="Median construction year"
            year={constructionDateDataAvailable ? `AS OF ${constructionDateData[0].Year}` : ""}
            value={constructionDateDataAvailable ? constructionDateData[0]["Construction Date"] : "N/A"}
          />
          <p>{medianHousingUnitsValueForProfileAvailable ? <span>In {topMedianHousingUnitsValueForProfile.Year}, the median property value in {topMedianHousingUnitsValueForProfile.Geography}, was ${commas(topMedianHousingUnitsValueForProfile["Property Value"])}.</span> : ""} </p>
          <p>{occupancyDataAvailable ? <span>{formatAbbreviate(topOccupancyData.share)}% of households in {topOccupancyData.Geography} were occupied in {topOccupancyData.Year}.</span> : ""}</p>
          <p>The following map shows the median property value for <CensusTractDefinition text="census tracts" /> in Wayne County.</p>
          
          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        {/* Geomap to show Property Values for all tracts in the Wayne County. */}
        <Geomap config={{
          data: "https://acs.datausa.io/api/data?measures=Property Value&Geography=05000US26163:children&Year=all",
          groupBy: "ID Geography",
          label: d => formatTractName(d.Geography, tractToPlace[d["ID Geography"]]),
          colorScale: "Property Value",
          colorScaleConfig: {
            axisConfig: {tickFormat: d => formatPropertyValue(d)}
          },
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Median Property Value", d => `$${formatAbbreviate(d["Property Value"])}`]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        dataFormat={resp => {
          this.setState({sources: updateSource(resp.source, this.state.sources)});
          return resp.data;
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
  fetchData("occupancyData", "/api/data?measures=Housing Units&drilldowns=Occupancy Status&Geography=<id>&Year=latest", d => d.data),
  fetchData("medianHousingUnitsValueForProfile", "https://acs.datausa.io/api/data?measures=Property Value&Geography=<id>&Year=latest", d => d.data),
  fetchData("constructionDateData", "/api/data?measures=Construction Date&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  topStats: state.data.topStats,
  occupancyData: state.data.occupancyData,
  medianHousingUnitsValueForProfile: state.data.medianHousingUnitsValueForProfile,
  constructionDateData: state.data.constructionDateData
});

export default connect(mapStateToProps)(Homeownership);

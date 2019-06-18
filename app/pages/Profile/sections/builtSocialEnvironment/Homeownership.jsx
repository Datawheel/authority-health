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
import places from "utils/places";
import CensusTractDefinition from "components/CensusTractDefinition";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatPropertyValue = d => `$${formatAbbreviate(d)}`;

const commas = format(",d");

const formatTopojsonFilter = (d, meta, childrenTractIds) => {
  if (meta.level === "county") return places.includes(d.id);
  else if (meta.level === "tract") return d.id.startsWith("14000US26163");
  else return childrenTractIds.includes(d.id);
};

const formatTractName = (tractName, cityName) => cityName === undefined ? tractName : `${tractName.replace(", Wayne County, MI", "")}, ${cityName}`;
const formatGeomapLabel = (d, meta, tractToPlace) => {
  if (d.Geography === undefined) return d;
  if (meta.level === "county") return d.Geography;
  if (meta.level === "tract") return formatTractName(d.Geography, tractToPlace[d["ID Geography"]]);
  else return `${d.Geography.replace(", Wayne County, MI", "")}, ${meta.name}`;
};

const getGeomapTitle = meta => {
  if (meta.level === "county") return "Lowest median property value within places in Wayne County";
  else if (meta.level === "tract") return "Lowest median property value within census tracts in Wayne County";
  else return `Lowest median property value within tracts in ${meta.name}`;
};

const formatGeomapPropertyValueData = (data, meta, childrenTractIds) => {
  let filteredChildrenGeography = [];
  if (meta.level === "tract") {
    filteredChildrenGeography = data;
  }
  else if (meta.level === "county") {
    data.forEach(d => {
      if (places.includes(d["ID Geography"])) filteredChildrenGeography.push(d);
    });
  }
  else {
    data.forEach(d => {
      if (childrenTractIds.includes(d["ID Geography"])) filteredChildrenGeography.push(d);
    });
  }
  const topRecentYearData = filteredChildrenGeography.sort((a, b) => a["Property Value"] - b["Property Value"])[0];
  return [filteredChildrenGeography, topRecentYearData];
};

class Homeownership extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {tractToPlace} = this.props.topStats;
    const {
      meta,
      childrenTractIds,
      occupancyData,
      medianHousingValueForCurrentProfile,
      medianHousingValueForAllPlaces,
      medianHousingValueForAllTracts,
      constructionDateData
    } = this.props;

    const occupancyDataAvailable = occupancyData.length !== 0;
    const medianHousingValueForCurrentProfileAvailable = medianHousingValueForCurrentProfile.length !== 0;
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
    if (medianHousingValueForCurrentProfileAvailable) {
      topMedianHousingUnitsValueForProfile = medianHousingValueForCurrentProfile[0];
    }

    let topChildrenGeographyData;
    if (meta.level === "county") {
      topChildrenGeographyData = formatGeomapPropertyValueData(medianHousingValueForAllPlaces, meta, childrenTractIds)[1];
    }
    else {
      topChildrenGeographyData = formatGeomapPropertyValueData(medianHousingValueForAllTracts, meta, childrenTractIds)[1];
    }

    return (
      <SectionColumns>
        <SectionTitle>Homeownership</SectionTitle>
        <article>
          <Stat
            title="Median property value"
            year={medianHousingValueForCurrentProfileAvailable ? topMedianHousingUnitsValueForProfile.Year : ""}
            value={medianHousingValueForCurrentProfileAvailable ? `$${commas(topMedianHousingUnitsValueForProfile["Property Value"])}` : "N/A"}
            qualifier={medianHousingValueForCurrentProfileAvailable ? `in ${topMedianHousingUnitsValueForProfile.Geography}` : `in ${meta.name}`}
          />
          <Stat
            title={getGeomapTitle(meta)}
            year={topChildrenGeographyData.Year}
            value={`$${commas(topChildrenGeographyData["Property Value"])}`}
            qualifier={formatGeomapLabel(topChildrenGeographyData, meta, tractToPlace)}
          />
          <Stat
            title="Median construction year"
            year={constructionDateDataAvailable ? `AS OF ${constructionDateData[0].Year}` : ""}
            value={constructionDateDataAvailable ? constructionDateData[0]["Construction Date"] : "N/A"}
          />
          <p>{medianHousingValueForCurrentProfileAvailable ? <span>In {topMedianHousingUnitsValueForProfile.Year}, the median property value in {topMedianHousingUnitsValueForProfile.Geography}, was ${commas(topMedianHousingUnitsValueForProfile["Property Value"])}.</span> : ""}
            {occupancyDataAvailable ? <span> {formatAbbreviate(topOccupancyData.share)}% of the households in {topOccupancyData.Geography} were occupied as of {topOccupancyData.Year}.</span> : ""}</p>
          <p>The following map shows the median property value for the <CensusTractDefinition text="census tracts" /> in {topOccupancyData.Geography}.</p>

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ meta.level === "county" ? "https://acs.datausa.io/api/data?measures=Property Value&Geography=04000US26:places&Year=all" : "https://acs.datausa.io/api/data?measures=Property Value&Geography=05000US26163:children&Year=all" }
            title="Map of Homeownership" />

          <Geomap ref={comp => this.viz = comp} config={{
            data: meta.level === "county" ? "https://acs.datausa.io/api/data?measures=Property Value&Geography=04000US26:places&Year=all" : "https://acs.datausa.io/api/data?measures=Property Value&Geography=05000US26163:children&Year=all",
            groupBy: "ID Geography",
            label: d => formatGeomapLabel(d, meta, tractToPlace),
            colorScale: "Property Value",
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPropertyValue(d)}
            },
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Median Property Value", d => `$${formatAbbreviate(d["Property Value"])}`]]},
            topojson: meta.level === "county" ? "/topojson/place.json" : "/topojson/tract.json",
            topojsonFilter: d => formatTopojsonFilter(d, meta, childrenTractIds)
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return resp.data;
          }}
          />
        </div>
      </SectionColumns>
    );
  }
}

Homeownership.defaultProps = {
  slug: "homeownership"
};

Homeownership.need = [
  fetchData("occupancyData", "/api/data?measures=Housing Units&drilldowns=Occupancy Status&Geography=<id>&Year=latest", d => d.data),
  fetchData("medianHousingValueForCurrentProfile", "https://acs.datausa.io/api/data?measures=Property Value&Geography=<id>&Year=latest", d => d.data),
  fetchData("medianHousingValueForAllPlaces", "https://acs.datausa.io/api/data?measures=Property Value&Geography=04000US26:places&Year=latest", d => d.data),
  fetchData("medianHousingValueForAllTracts", "https://acs.datausa.io/api/data?measures=Property Value&Geography=05000US26163:children&Year=latest", d => d.data),
  fetchData("constructionDateData", "/api/data?measures=Construction Date&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  childrenTractIds: state.data.childrenTractIds,
  occupancyData: state.data.occupancyData,
  medianHousingValueForCurrentProfile: state.data.medianHousingValueForCurrentProfile,
  medianHousingValueForAllPlaces: state.data.medianHousingValueForAllPlaces,
  medianHousingValueForAllTracts: state.data.medianHousingValueForAllTracts,
  constructionDateData: state.data.constructionDateData
});

export default connect(mapStateToProps)(Homeownership);

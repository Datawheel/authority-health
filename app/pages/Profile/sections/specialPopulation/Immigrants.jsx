import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import styles from "style.yml";

import Contact from "components/Contact";
import Stat from "components/Stat";
import places from "utils/places";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatTractName = (tractName, cityName) => cityName === undefined ? tractName : `${tractName}, ${cityName}`;
const formatGeomapLabel = (d, meta, tractToPlace) => {
  if (meta.level === "county") return d.Place;
  if (meta.level === "tract") return formatTractName(d.Geography, tractToPlace[d["ID Geography"]]);
  else return `${d.Geography}, ${meta.name}`;
};

const formatTopojsonFilter = (d, meta, childrenTractIds) => {
  if (meta.level === "county") return places.includes(d.id);
  else if (meta.level === "tract") return d.id.startsWith("14000US26163");
  else return childrenTractIds.includes(d.id);
};

const findTotalImmigrants = data => {
  const total = sum(data, d => d["Poverty by Nativity"]);
  const filteredData = data.filter(d => d.Nativity === "Foreign Born")[0];
  filteredData.share = total !== 0 ? filteredData["Poverty by Nativity"] / total * 100 : 0;
  return filteredData;
};

const findImmigrantsInPoverty = data => {
  const total = sum(data, d => d["Poverty by Nativity"]);
  const filteredData = data.filter(d => d.Nativity === "Foreign Born" && d["ID Poverty Status"] === 0)[0];
  filteredData.share = total !== 0 ? filteredData["Poverty by Nativity"] / total * 100 : 0;
  return filteredData;
};

const formatGeomapData = (data, meta, childrenTractIds, totalImmigrantsSelected = true) => {
  let filteredChildrenGeography = [];
  if (meta.level === "tract") {
    filteredChildrenGeography = data;
  }
  else if (meta.level === "county") {
    data.forEach(d => {
      if (places.includes(d["ID Place"])) filteredChildrenGeography.push(d);
    });
  }
  else {
    data.forEach(d => {
      if (childrenTractIds.includes(d["ID Geography"])) filteredChildrenGeography.push(d);
    });
  }
  if (totalImmigrantsSelected) {
    nest()
      .key(d => d.Year)
      .entries(filteredChildrenGeography)
      .forEach(group => {
        const total = sum(group.values, d => d["Poverty by Nativity"]);
        group.values.forEach(d => {
          if (d["ID Nativity"] === 1) total !== 0 ? d.share = d["Poverty by Nativity"] / total * 100 : d.share = 0;
        });
      });
  }
  else {
    nest()
      .key(d => d.Year)
      .entries(filteredChildrenGeography)
      .forEach(group => {
        const total = sum(group.values, d => d["Poverty by Nativity"]);
        group.values.forEach(d => {
          if (d["ID Nativity"] === 1 && d["ID Poverty Status"] === 1) total !== 0 ? d.share = d["Poverty by Nativity"] / total * 100 : d.share = 0;
        });
      });
  }

  // Find the top immigrant data for the recent year.
  const filteredImmigrantsData = totalImmigrantsSelected ? filteredChildrenGeography.filter(d => d["ID Nativity"] === 1) : filteredChildrenGeography.filter(d => d["ID Nativity"] === 1 && d["ID Poverty Status"] === 1);
  const topImmigrantsData = filteredImmigrantsData.sort((a, b) => b.share - a.share)[0];
  return [filteredImmigrantsData, topImmigrantsData];
};

const getGeomapTitle = (meta, dropdownValue) => {
  if (meta.level === "county") return `City with most immigrtants ${dropdownValue === "Total Immigrants" ? "" : "in poverty"} in Wayne County`;
  else if (meta.level === "tract") return `Census tract with most immigrtants ${dropdownValue === "Total Immigrants" ? "" : "in poverty"} in Wayne County`;
  else return `Census tract with most immigrtants ${dropdownValue === "Total Immigrants" ? "" : "in poverty"} in ${meta.name}`;
};

const getGeomapQualifier = (data, meta) => {
  if (meta.level === "county") return `${formatPercentage(data.share)} of the total population in this city`;
  return `${formatPercentage(data.share)} of the population in this census tract`;
};

class Immigrants extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta,
      dropdownValue: "Total Immigrants",
      immigrantsPovertyChildrenGeographyData: [],
      immigrantsInPovertyNationData: [],
      immigrantsInPovertyStateData: [],
      immigrantsInPovertyCountyData: [],
      immigrantsPovertyDataForCurrentLocation: [],
      sources: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue =  event.target.value; // stores event value here to prevent "Synthetic Events" error.
    const meta = this.state.meta;
    if (dropdownValue === "Immigrants in Poverty") {
      const immigrantsPovertyChildrenGeographyData = axios.get(`/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&Geography=${meta.id}:children&Year=latest`); // get all places data
      const countyData = axios.get("/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&County=05000US26163&Year=latest"); // get Wayne County level data
      const nationData = axios.get("/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&Nation=01000US&Year=latest"); // get United States data
      const stateData = axios.get("/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&State=04000US26&Year=latest"); // get Michigan state data,
      let currentLevelData;
      if (meta.name !== "county") {
        currentLevelData = axios.get(`/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&Geography=${meta.id}&Year=latest`); // if current location is not county, then get current level data
      }
      Promise.all([immigrantsPovertyChildrenGeographyData, countyData, nationData, stateData, currentLevelData]).then(values => {
        this.setState({
          immigrantsPovertyChildrenGeographyData: values[0].data.data,
          immigrantsInPovertyCountyData: values[1].data.data,
          immigrantsInPovertyNationData: values[2].data.data,
          immigrantsInPovertyStateData: values[3].data.data,
          immigrantsPovertyDataForCurrentLocation: values[4].data.data,
          dropdownValue
        });
      });
    }
    else this.setState({dropdownValue});
  }

  render() {
    const {
      meta,
      dropdownValue,
      immigrantsPovertyChildrenGeographyData,
      immigrantsInPovertyNationData,
      immigrantsInPovertyStateData,
      immigrantsInPovertyCountyData,
      immigrantsPovertyDataForCurrentLocation
    } = this.state;

    const {
      childrenTractIds,
      immigrantsDataForCurrentLocation,
      immigrantsDataForNation,
      immigrantsDataForState,
      immigrantsDataForWayneCounty,
      immigrantsChildrenGeographyData
    } = this.props;
    const {tractToPlace} = this.props.topStats;

    const dropdownList = ["Total Immigrants", "Immigrants in Poverty"];
    const totalImmigrantsSelected = dropdownValue === "Total Immigrants";

    let USImmigrantsData, currentLevelImmigrantsData, michiganImmigrantsData, wayneCountyImmigrantsData;
    if (totalImmigrantsSelected) {
      USImmigrantsData = findTotalImmigrants(immigrantsDataForNation);
      michiganImmigrantsData = findTotalImmigrants(immigrantsDataForState);
      wayneCountyImmigrantsData = findTotalImmigrants(immigrantsDataForWayneCounty);
      currentLevelImmigrantsData = meta.level !== "county" ? findTotalImmigrants(immigrantsDataForCurrentLocation) : wayneCountyImmigrantsData;
    }
    else {
      USImmigrantsData = findImmigrantsInPoverty(immigrantsInPovertyNationData);
      michiganImmigrantsData = findImmigrantsInPoverty(immigrantsInPovertyStateData);
      wayneCountyImmigrantsData = findImmigrantsInPoverty(immigrantsInPovertyCountyData);
      currentLevelImmigrantsData = meta.level !== "county" ? findImmigrantsInPoverty(immigrantsPovertyDataForCurrentLocation) : wayneCountyImmigrantsData;
    }

    const immigrantsDataForCurrentLocationAvailable = immigrantsDataForCurrentLocation.length !== 0;
    const immigrantsPovertyDataForCurrentLocationAvailable = immigrantsPovertyDataForCurrentLocation.length !== 0;

    const topStats = totalImmigrantsSelected ? formatGeomapData(immigrantsChildrenGeographyData, meta, childrenTractIds, true)[1] : formatGeomapData(immigrantsPovertyChildrenGeographyData, meta, childrenTractIds, false)[1];

    return (
      <SectionColumns>
        <SectionTitle>Immigrants</SectionTitle>
        <article>
          {/* Create a dropdown for total immigrants and immigrants in poverty choices. */}
          <label className="pt-label pt-inline" htmlFor="health-center-dropdown">
            Show data for
            <div className="pt-select">
              <select id="health-center-dropdown" onChange={this.handleChange}>
                {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </label>

          {/* Show top stats and a short paragraph about it for each Nativity. */}
          {totalImmigrantsSelected
            ? <div className="font-sm">
              <Stat
                title={"Immigrant population"}
                year={immigrantsDataForCurrentLocationAvailable ? currentLevelImmigrantsData.Year : ""}
                value={immigrantsDataForCurrentLocationAvailable ? formatPercentage(currentLevelImmigrantsData.share) : "N/A"}
                qualifier={immigrantsDataForCurrentLocationAvailable ? `of the population in ${meta.level !== "county" ? currentLevelImmigrantsData.Geography : "Wayne County"}` : ""}
              />
              <Stat
                title={getGeomapTitle(meta, dropdownValue)}
                year={topStats.Year}
                value={formatGeomapLabel(topStats, meta, tractToPlace)}
                qualifier={getGeomapQualifier(topStats, meta)}
              />

              {meta.level !== "county"
                ? <p>In {currentLevelImmigrantsData.Year}, {formatPercentage(currentLevelImmigrantsData.share)} of the population in {currentLevelImmigrantsData.Geography} were immigrants, compared to {formatPercentage(wayneCountyImmigrantsData.share)} {}
                in Wayne County, {formatPercentage(michiganImmigrantsData.share)} in Michigan, and {formatPercentage(USImmigrantsData.share)} in the United States.</p>
                : <p>In {USImmigrantsData.Year}, {formatPercentage(wayneCountyImmigrantsData.share)} of the population in Wayne County were immigrants, compared to {}
                  {formatPercentage(michiganImmigrantsData.share)} in Michigan, and {formatPercentage(USImmigrantsData.share)} in the United States.</p>
              }
              <p>{`${getGeomapTitle(meta, dropdownValue)} was ${formatGeomapLabel(topStats, meta, tractToPlace)} (${getGeomapQualifier(topStats, meta)}).`}</p>
              {immigrantsDataForCurrentLocationAvailable ? <p>The map here shows the {meta.level === "county" ? "cities" : "tracts"} in {meta.level === "county" || meta.level === "tracts" ? "Wayne County" : `${meta.name}`} by their percentage of immigrants.</p> : ""}
            </div>

            : <div className="font-sm">
              <Stat
                title={"Immigrants in poverty"}
                year={immigrantsPovertyDataForCurrentLocationAvailable ? currentLevelImmigrantsData.Year : ""}
                value={immigrantsPovertyDataForCurrentLocationAvailable ? formatPercentage(currentLevelImmigrantsData.share) : "N/A"}
                qualifier={immigrantsDataForCurrentLocationAvailable ? `of the population in ${meta.level !== "county" ? currentLevelImmigrantsData.Geography : "Wayne County"}` : ""}
              />
              <Stat
                title={getGeomapTitle(meta, dropdownValue)}
                year={topStats.Year}
                value={formatGeomapLabel(topStats, meta, tractToPlace)}
                qualifier={getGeomapQualifier(topStats, meta)}
              />

              {meta.level !== "county"
                ? <p>In {currentLevelImmigrantsData.Year}, {formatPercentage(currentLevelImmigrantsData.share)} of the population in {currentLevelImmigrantsData.Geography} were immigrants in poverty, compared to {}
                  {formatPercentage(wayneCountyImmigrantsData.share)} in Wayne County, {formatPercentage(michiganImmigrantsData.share)} in Michigan and {formatPercentage(USImmigrantsData.share)} in the United States.</p>
                : <p>In {wayneCountyImmigrantsData.Year}, {formatPercentage(wayneCountyImmigrantsData.share)} of the population in in Wayne County were immigrants in poverty, compared to {}
                  {formatPercentage(michiganImmigrantsData.share)} in Michigan and {formatPercentage(USImmigrantsData.share)} in the United States.</p>
              }
              <p>{`${getGeomapTitle(meta, dropdownValue)} was ${formatGeomapLabel(topStats, meta, tractToPlace)} (${getGeomapQualifier(topStats, meta)}).`}</p>
              {immigrantsDataForCurrentLocationAvailable ? <p>The map here shows the {meta.level === "county" ? "cities" : "tracts"} in {meta.level === "county" || meta.level === "tracts" ? "Wayne County" : `${meta.name}`} by their percentage of immigrants in poverty.</p> : ""}
            </div>
          }

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <Geomap config={{
          data: totalImmigrantsSelected ? `/api/data?measures=Poverty by Nativity&drilldowns=Nativity&Geography=${meta.id}:children&Year=latest` : `/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&Geography=${meta.id}:children&Year=latest`,
          groupBy: meta.level === "county" ? "ID Place" : "ID Geography",
          colorScale: "share",
          title: `Immigrants by ${meta.level === "county" ? "Places" : "Census Tracts"} in ${meta.level === "county" || meta.level === "tract" ? "Wayne County" : meta.name}`,
          colorScaleConfig: {
            axisConfig: {tickFormat: d => formatPercentage(d)},
            color: dropdownValue === "Immigrants in Poverty"
              ? [
                styles.white,
                styles["danger-light"],
                styles.danger,
                styles["danger-dark"]
              ]
              : [
                styles.white,
                styles["majorelle-light"],
                styles.majorelle,
                styles["majorelle-dark"]
              ]
          },
          time: "Year",
          label: d => formatGeomapLabel(d, meta, tractToPlace),
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)]]},
          topojson: meta.level === "county" ? "/topojson/place.json" : "/topojson/tract.json",
          topojsonFilter: d => formatTopojsonFilter(d, meta, childrenTractIds)
        }}
        dataFormat={resp => {
          this.setState({sources: updateSource(resp.source, this.state.sources)});
          return totalImmigrantsSelected ? formatGeomapData(resp.data, meta, childrenTractIds, true)[0] : formatGeomapData(resp.data, meta, childrenTractIds, false)[0];
        }}
        />
      </SectionColumns>
    );
  }
}

Immigrants.defaultProps = {
  slug: "immigrants"
};

Immigrants.need = [
  fetchData("immigrantsData", "/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Place&Year=latest", d => d.data),
  fetchData("immigrantsDataForNation", "/api/data?measures=Poverty by Nativity&drilldowns=Nativity&Nation=01000US&Year=latest", d => d.data),
  fetchData("immigrantsDataForState", "/api/data?measures=Poverty by Nativity&drilldowns=Nativity&State=04000US26&Year=latest", d => d.data),
  fetchData("immigrantsDataForWayneCounty", "/api/data?measures=Poverty by Nativity&drilldowns=Nativity&County=05000US26163&Year=latest", d => d.data),
  fetchData("immigrantsDataForCurrentLocation", "/api/data?measures=Poverty by Nativity&drilldowns=Nativity&Geography=<id>&Year=latest", d => d.data),
  fetchData("immigrantsChildrenGeographyData", "/api/data?measures=Poverty by Nativity&drilldowns=Nativity&Geography=<id>:children&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  childrenTractIds: state.data.childrenTractIds,
  immigrantsData: state.data.immigrantsData,
  immigrantsDataForNation: state.data.immigrantsDataForNation,
  immigrantsDataForState: state.data.immigrantsDataForState,
  immigrantsDataForWayneCounty: state.data.immigrantsDataForWayneCounty,
  immigrantsDataForCurrentLocation: state.data.immigrantsDataForCurrentLocation,
  immigrantsChildrenGeographyData: state.data.immigrantsChildrenGeographyData
});

export default connect(mapStateToProps)(Immigrants);

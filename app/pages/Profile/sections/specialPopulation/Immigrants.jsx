import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import places from "utils/places";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatImmigrantsData = immigrantsData => {
  // Find the percentage of immigrants for each city and add it to each immigrants object in immigrantsData array.
  nest()
    .key(d => d.Year)
    .entries(immigrantsData)
    .forEach(group => {
      nest()
        .key(d => d["ID Place"])
        .entries(group.values)
        .forEach(place => {
          const total = sum(place.values, d => d["Poverty by Nativity"]);
          place.values.forEach(d => {
            if (d["ID Nativity"] === 1) total !== 0 ? d.share = d["Poverty by Nativity"] / total * 100 : d.share = 0;
          });
        });
    });
  // Find the top immigrant data for the recent year.
  const filteredImmigrantsData = immigrantsData.filter(d => d["ID Nativity"] === 1);
  const topImmigrantsData = filteredImmigrantsData.sort((a, b) => b.share - a.share)[0];
  return [filteredImmigrantsData, topImmigrantsData];
};

const formatImmigrantsPovertyData = immigrantsPovertyData => {
  // Find the percentage of immigrants in poverty for each city and add it to each object in immigrantsPovertyData array.
  nest()
    .key(d => d.Year)
    .entries(immigrantsPovertyData)
    .forEach(group => {
      nest()
        .key(d => d["ID Place"])
        .entries(group.values)
        .forEach(place => {
          const total = sum(place.values, d => d["Poverty by Nativity"]);
          place.values.forEach(d => {
            if (d["ID Poverty Status"] === 0) total !== 0 ? d.share = d["Poverty by Nativity"] / total * 100 : d.share = 0;
          });
        });
    });
  // Find the top immigrants in poverty data for the recent year.
  const filteredPovertyData = immigrantsPovertyData.filter(d => d["ID Nativity"] === 1 && d["ID Poverty Status"] === 0);
  const topPovertyData = filteredPovertyData.sort((a, b) => b.share - a.share)[0];
  return [filteredPovertyData, topPovertyData];
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

class Immigrants extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta,
      dropdownValue: "Total Immigrants",
      immigrantsPovertyData: [],
      immigrantsInPovertyNationData: [],
      immigrantsInPovertyStateData: [],
      immigrantsInPovertyCountyData: [],
      immigrantsPovertyDataForCurrentLocation: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue =  event.target.value; // stores event value here to prevent "Synthetic Events" error.
    const meta = this.state.meta;
    if (dropdownValue === "Immigrants in Poverty") {
      const immigrantsPovertyData = axios.get("/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status,Place&Year=latest"); // get all places data
      const countyData = axios.get("/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&County=05000US26163&Year=latest"); // get Wayne County level data
      const nationData = axios.get("/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&Nation=01000US&Year=latest"); // get United States data
      const stateData = axios.get("/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&State=04000US26&Year=latest"); // get Michigan state data
      let currentLevelData;
      if (meta.name !== "county") {
        currentLevelData = axios.get(`/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&Geography=${meta.id}&Year=latest`); // if current location is not county, then get current level data
      } 
      Promise.all([immigrantsPovertyData, countyData, nationData, stateData, currentLevelData]).then(values => {
        this.setState({
          immigrantsPovertyData: values[0].data.data,
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
      immigrantsPovertyData, 
      immigrantsInPovertyNationData,
      immigrantsInPovertyStateData,
      immigrantsInPovertyCountyData,
      immigrantsPovertyDataForCurrentLocation
    } = this.state;

    const {
      immigrantsData, 
      immigrantsDataForCurrentLocation, 
      immigrantsDataForNation, 
      immigrantsDataForState, 
      immigrantsDataForWayneCounty
    } = this.props;

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

    const topStats = totalImmigrantsSelected ? formatImmigrantsData(immigrantsData)[1] : formatImmigrantsPovertyData(immigrantsPovertyData)[1];

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
            ? <div>
              <Stat
                title={"Immigrant population"}
                year={immigrantsDataForCurrentLocationAvailable ? currentLevelImmigrantsData.Year : ""}
                value={immigrantsDataForCurrentLocationAvailable ? formatPercentage(currentLevelImmigrantsData.share) : "N/A"}
                qualifier={immigrantsDataForCurrentLocationAvailable ? `of the population in ${meta.level !== "county" ? currentLevelImmigrantsData.Geography : "Wayne County"}` : ""}
              />
              <Stat
                title="City with most immigrants"
                year={topStats.Year}
                value={topStats.Place}
                qualifier={formatPercentage(topStats.share)}
              />
              
              {meta.level !== "county"
                ? <p>In {currentLevelImmigrantsData.Year}, {formatPercentage(currentLevelImmigrantsData.share)} of the population in {currentLevelImmigrantsData.Geography} were immigrants, compared to {formatPercentage(wayneCountyImmigrantsData.share)} {}
                in Wayne County, {formatPercentage(michiganImmigrantsData.share)} in Michigan, and {formatPercentage(USImmigrantsData.share)} in the United States.</p>
                : <p>In {USImmigrantsData.Year}, {formatPercentage(wayneCountyImmigrantsData.share)} of the population in Wayne County were immigrants, compared to {}
                  {formatPercentage(michiganImmigrantsData.share)} in Michigan, and {formatPercentage(USImmigrantsData.share)} in the United States.</p>
              }
              <p>The city with the highest immigrant population in Wayne County was {topStats.Place} ({formatPercentage(topStats.share)}).</p>
              {immigrantsDataForCurrentLocationAvailable ? <p>The map here shows the cities in Wayne County by their percentage of immigrants.</p> : ""}
            </div>
            : <div>
              <Stat
                title={"Immigrants in poverty"}
                year={immigrantsPovertyDataForCurrentLocationAvailable ? currentLevelImmigrantsData.Year : ""}
                value={immigrantsPovertyDataForCurrentLocationAvailable ? formatPercentage(currentLevelImmigrantsData.share) : "N/A"}
                qualifier={immigrantsDataForCurrentLocationAvailable ? `of the population in ${meta.level !== "county" ? currentLevelImmigrantsData.Geography : "Wayne County"}` : ""}
              />
              <Stat
                title="City with most immigrants in poverty"
                year={topStats.Year}
                value={topStats.Place}
                qualifier={formatPercentage(topStats.share)}
              />
              
              {meta.level !== "county" 
                ? <p>In {currentLevelImmigrantsData.Year}, {formatPercentage(currentLevelImmigrantsData.share)} of the population in {currentLevelImmigrantsData.Geography} were immigrants in poverty, compared to {}
                  {formatPercentage(wayneCountyImmigrantsData.share)} in Wayne County, {formatPercentage(michiganImmigrantsData.share)} in Michigan and {formatPercentage(USImmigrantsData.share)} in the United States.</p>
                : <p>In {wayneCountyImmigrantsData.Year}, {formatPercentage(wayneCountyImmigrantsData.share)} of the population in in Wayne County were immigrants in poverty, compared to {}
                  {formatPercentage(michiganImmigrantsData.share)} in Michigan and {formatPercentage(USImmigrantsData.share)} in the United States.</p>
              }
              <p>The city with the highest immigrants in poverty in Wayne County was {topStats.Place} ({formatPercentage(topStats.share)}).</p>
              
              {immigrantsPovertyDataForCurrentLocationAvailable ? <p>The map here shows the cities in Wayne County by their percentage of immigrants in poverty.</p> : "" }
            </div>
          }

          <Contact slug={this.props.slug} />
        </article>

        <Geomap config={{
          data: totalImmigrantsSelected ? "/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Place&Year=all" : "/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status,Place&Year=all",
          groupBy: "ID Place",
          colorScale: "share",
          colorScaleConfig: {axisConfig: {tickFormat: d => formatPercentage(d)}},
          time: "Year",
          label: d => d.Place,
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Population", dropdownValue], ["Share", d => formatPercentage(d.share)]]},
          topojson: "/topojson/place.json",
          topojsonFilter: d => places.includes(d.id)
        }}
        dataFormat={resp => totalImmigrantsSelected ? formatImmigrantsData(resp.data)[0] : formatImmigrantsPovertyData(resp.data)[0]}
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
  fetchData("immigrantsDataForCurrentLocation", "/api/data?measures=Poverty by Nativity&drilldowns=Nativity&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  immigrantsData: state.data.immigrantsData,
  immigrantsDataForNation: state.data.immigrantsDataForNation,
  immigrantsDataForState: state.data.immigrantsDataForState,
  immigrantsDataForWayneCounty: state.data.immigrantsDataForWayneCounty,
  immigrantsDataForCurrentLocation: state.data.immigrantsDataForCurrentLocation
});

export default connect(mapStateToProps)(Immigrants);

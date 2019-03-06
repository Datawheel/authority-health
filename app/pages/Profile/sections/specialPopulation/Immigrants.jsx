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

const formatPopulation = d => `${formatAbbreviate(d)}%`;

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

class Immigrants extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta,
      dropdownValue: "Total Immigrants",
      immigrantsPovertyData: [],
      immigrantsPovertyDataForCurrentLocation: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue =  event.target.value; // stores event value here to prevent "Synthetic Events" error.
    if (dropdownValue === "Immigrants in Poverty") {
      axios.get("/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status,Place&Year=latest")
        .then(resp => {
          axios.get(`/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&Geography=${this.state.meta.id}&Year=latest`)
            .then(d => {
              this.setState({
                immigrantsPovertyDataForCurrentLocation: d.data.data,
                immigrantsPovertyData: resp.data.data,
                dropdownValue
              });
            });
        });
    }
    else this.setState({dropdownValue});
  }

  render() {

    const {dropdownValue, immigrantsPovertyData, immigrantsPovertyDataForCurrentLocation} = this.state;
    const {immigrantsData, immigrantsDataForCurrentLocation} = this.props;

    const dropdownList = ["Total Immigrants", "Immigrants in Poverty"];
    const totalImmigrantsSelected = dropdownValue === "Total Immigrants";

    const immigrantsDataForCurrentLocationAvailable = immigrantsDataForCurrentLocation.length !== 0;
    const immigrantsPovertyDataForCurrentLocationAvailable = immigrantsPovertyDataForCurrentLocation.length !== 0;

    let getImmigrantsDataForCurrentLocation;
    if (immigrantsDataForCurrentLocationAvailable) {
      nest()
        .key(d => d.Year)
        .entries(immigrantsDataForCurrentLocation)
        .forEach(group => {
          const total = sum(group.values, d => d["Poverty by Nativity"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Poverty by Nativity"] / total * 100 : d.share = 0);
        });
      getImmigrantsDataForCurrentLocation = immigrantsDataForCurrentLocation.filter(d => d.Nativity === "Foreign Born");
    }

    let getImmigrantsPovertyDataForCurrentLocation;
    if (immigrantsPovertyDataForCurrentLocationAvailable) {
      nest()
        .key(d => d.Year)
        .entries(immigrantsPovertyDataForCurrentLocation)
        .forEach(group => {
          const total = sum(group.values, d => d["Poverty by Nativity"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Poverty by Nativity"] / total * 100 : d.share = 0);
        });
      getImmigrantsPovertyDataForCurrentLocation = immigrantsPovertyDataForCurrentLocation.filter((d => d.Nativity === "Foreign Born") && (d => d["ID Poverty Status"] === 0));
    }

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
                year={getImmigrantsDataForCurrentLocation ? getImmigrantsDataForCurrentLocation[0].Year : ""}
                value={getImmigrantsDataForCurrentLocation ? formatPopulation(getImmigrantsDataForCurrentLocation[0].share) : "N/A"}
              />
              <Stat
                title="City with most immigrants"
                year={topStats.Year}
                value={topStats.Place}
                qualifier={formatPopulation(topStats.share)}
              />
              <p>
                {getImmigrantsDataForCurrentLocation ? <span>In {getImmigrantsDataForCurrentLocation[0].Year}, {formatPopulation(getImmigrantsDataForCurrentLocation[0].share)} of the population in {getImmigrantsDataForCurrentLocation[0].Geography} was immigrants.</span> : ""} {" "} 
                The city with the highest immigrant population in Wayne County was {topStats.Place} ({formatPopulation(topStats.share)}).
              </p>
              {getImmigrantsDataForCurrentLocation ? <p>The map here shows the cities in {getImmigrantsDataForCurrentLocation[0].Geography} by their percentage of immigrants.</p> : ""}
            </div>
            : <div>
              <Stat
                title={"Immigrants in poverty"}
                year={getImmigrantsPovertyDataForCurrentLocation ? getImmigrantsPovertyDataForCurrentLocation[0].Year : ""}
                value={getImmigrantsPovertyDataForCurrentLocation ? formatPopulation(getImmigrantsPovertyDataForCurrentLocation[0].share) : "N/A"}
              />
              <Stat
                title="City with most immigrants in poverty"
                year={topStats.Year}
                value={topStats.Place}
                qualifier={formatPopulation(topStats.share)}
              />
              <p>
                {getImmigrantsPovertyDataForCurrentLocation ? <span>In {getImmigrantsDataForCurrentLocation[0].Year}, {formatPopulation(getImmigrantsDataForCurrentLocation[0].share)} of the population in {getImmigrantsDataForCurrentLocation[0].Geography} was immigrants.</span> : ""}{" "}
                The city with the highest immigrants in poverty in Wayne County was {topStats.Place} ({formatPopulation(topStats.share)}).
              </p>
              {getImmigrantsPovertyDataForCurrentLocation ? <p>The map here shows the cities in {getImmigrantsPovertyDataForCurrentLocation[0].Geography} by their percentage of immigrants in poverty.</p> : "" }
            </div>
          }

          <Contact slug={this.props.slug} />
        </article>

        <Geomap config={{
          data: totalImmigrantsSelected ? "/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Place&Year=all" : "/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status,Place&Year=all",
          groupBy: "ID Place",
          colorScale: "share",
          title: totalImmigrantsSelected ? "Immigrant Population" : "Immigrants in Poverty",
          colorScaleConfig: {axisConfig: {tickFormat: d => formatPopulation(d)}},
          time: "Year",
          label: d => d.Place,
          height: 400,
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Population", dropdownValue], ["Share", d => formatPopulation(d.share)]]},
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
  fetchData("immigrantsDataForCurrentLocation", "/api/data?measures=Poverty by Nativity&drilldowns=Nativity&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  immigrantsData: state.data.immigrantsData,
  immigrantsDataForCurrentLocation: state.data.immigrantsDataForCurrentLocation
});

export default connect(mapStateToProps)(Immigrants);

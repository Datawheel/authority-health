import React from "react";
import {connect} from "react-redux";
import {max, sum} from "d3-array";
import {nest} from "d3-collection";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import places from "../../../../utils/places";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class Immigrants extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Total Immigrants"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {immigrantsData, immigrantsPovertyData} = this.props;
    const {dropdownValue} = this.state;
    const dropdownList = ["Total Immigrants", "Immigrants in Poverty"];
    const totalImmigrantsSelected = dropdownValue === "Total Immigrants";

    // Find the percentage of immigrants for each city and add it to each immigrants object in immigrantsData array.
    nest()
      .key(d => d.Year)
      .entries(immigrantsData)
      .forEach(group => {
        nest()
          .key(d => d["ID Place"])
          .entries(group.values)
          .forEach(place => {
            const total = sum(place.values, d => d.Population);
            place.values.forEach(d => {
              if (d["ID Nativity"] === 1) d.share = d.Population / total * 100;
            });
          });
      });

    // Find the top immigrant data for the recent year.
    const recentImmigrantsYear = max(immigrantsData, d => d["ID Year"]);
    const recentYearImmigrantsData = immigrantsData.filter(d => d["ID Year"] === recentImmigrantsYear);
    const filteredImmigrantsData = recentYearImmigrantsData.filter(d => d["ID Nativity"] === 1);
    filteredImmigrantsData.sort((a, b) => b.share - a.share);
    const topImmigrantsData = filteredImmigrantsData[0];

    // Find the percentage of immigrants in poverty for each city and add it to each object in immigrantsPovertyData array.
    nest()
      .key(d => d.Year)
      .entries(immigrantsPovertyData)
      .forEach(group => {
        nest()
          .key(d => d["ID Place"])
          .entries(group.values)
          .forEach(place => {
            const total = sum(place.values, d => d.Population);
            place.values.forEach(d => {
              if (d["ID Poverty Status"] === 0) d.share = d.Population / total * 100;
            });
          });
      });

    // Find the top immigrants in poverty data for the recent year.
    const recentProvertyYear = max(immigrantsPovertyData, d => d["ID Year"]);
    const recentYearPovertyData = immigrantsPovertyData.filter(d => d["ID Year"] === recentProvertyYear);
    const filteredPovertyData = recentYearPovertyData.filter(d => d["ID Nativity"] === 1 && d["ID Poverty Status"] === 0);
    filteredPovertyData.sort((a, b) => b.share - a.share);
    const topPovertyData = filteredPovertyData[0];

    return (
      <SectionColumns>
        <SectionTitle>Immigrants</SectionTitle>
        <article>
          {/* Create a dropdown for total immigrants and immigrants in poverty choices. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {/* Show top stats and a short paragraph about it for each Nativity. */}
          {totalImmigrantsSelected
            ? <div>
              <Stat
                title="Most Immigrants"
                year={topImmigrantsData.Year}
                value={topImmigrantsData.Place}
                qualifier={formatPopulation(topImmigrantsData.share)}
              />
              <p>In {topImmigrantsData.Year}, the city with the highest Immigrant population was {topImmigrantsData.Place} ({formatPopulation(topImmigrantsData.share)}) compared to {topPovertyData.Place}, which has the most immigrants in poverty ({formatPopulation(topPovertyData.share)}).</p>
              <p>The map here shows the cities by their percentage of immigrants.</p>
            </div>
            : <div>
              <Stat
                title="Most Immigrants in Poverty"
                year={topPovertyData.Year}
                value={topPovertyData.Place}
                qualifier={formatPopulation(topPovertyData.share)}
              />
              <p>In {topImmigrantsData.Year}, the city with the highest Immigrant population was {topImmigrantsData.Place} ({formatPopulation(topImmigrantsData.share)}) compared to {topPovertyData.Place}, which has the most immigrants in poverty ({formatPopulation(topPovertyData.share)}).</p>
              <p>The map here shows the cities by their percentage of immigrants in poverty.</p>
            </div>
          }
        </article>

        <Geomap config={{
          data: totalImmigrantsSelected ? filteredImmigrantsData : filteredPovertyData,
          groupBy: "ID Place",
          colorScale: "share",
          colorScaleConfig: {axisConfig: {tickFormat: d => formatPopulation(d)}},
          time: "Year",
          label: d => d.Place,
          height: 400,
          tooltipConfig: {tbody: [["Population", dropdownValue], ["Share", d => formatPopulation(d.share)]]},
          topojson: "/topojson/place.json",
          topojsonFilter: d => places.includes(d.id)
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
  fetchData("immigrantsData", "/api/data?measures=Population&drilldowns=Nativity,Place&Year=all", d => d.data),
  fetchData("immigrantsPovertyData", "/api/data?measures=Population&drilldowns=Nativity,Poverty Status,Place&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  immigrantsData: state.data.immigrantsData,
  immigrantsPovertyData: state.data.immigrantsPovertyData
});

export default connect(mapStateToProps)(Immigrants);

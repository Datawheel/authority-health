import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
// import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
// import zipcodes from "utils/zipcodes";

const formatRaceNames = d => d.replace("Health Center Patients", "");
const lowerCaseRaceName = d => d.trim() === "Black" || d.trim() === "White" ? d.toLowerCase() : d;
const formatPercentage = d => `${formatAbbreviate(d * 100)}%`;
// const formatDropdownName = d => d === "Health Centers" ? "Number of Health Centers" : d;

const formatRaceAndEthnicityData = raceAndEthnicityData => {
  // Add RaceType property to raceAndEthnicityData so that each race type can have individual object.
  const data = [];
  nest()
    .key(d => d.Year)
    .entries(raceAndEthnicityData.data)
    .forEach(group => {
      raceAndEthnicityData.source[0].measures.map(d => {
        const result = group.values.reduce((acc, currentValue) => {
          if (acc === null && currentValue[d] !== null) {
            // Non-white race population is the sum of all the race population minus White population.
            if (d === "Non-white Health Center Patients") {
              d = "White Health Center Patients";
              currentValue[d] = 1 - currentValue["Non-white Health Center Patients"];
              return Object.assign({}, currentValue, {RaceType: d});
            }
            return Object.assign({}, currentValue, {RaceType: d});
          }
          return acc;
        }, null);
        data.push(result);
      });
    });
  return data;
};

class HealthCenterDemographics extends SectionColumns {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     healthCenterData: this.props.healthCenterData,
  //     dropdownValue: "Health Centers"
  //   };
  // }
  
  // Handler function for dropdown onChange event.
  // handleChange = event => {
  //   this.setState({dropdownValue: event.target.value});
  //   axios.get(`/api/data?measures=${event.target.value}&drilldowns=Zip&Year=latest`)
  //     .then(resp => this.setState({healthCenterData: resp.data}));
  // }

  render() {
    const {meta, raceAndEthnicityData, raceAndEthnicityZipLevelData} = this.props;
    const isZipLevelDataAvailable = raceAndEthnicityZipLevelData.data.length !== 0;
    // const {healthCenterData, dropdownValue} = this.state;
    // const dropdownList = ["Health Centers", "Health Center Penetration", "Low-Income Health Center Penetration", "Uninsured Health Center Penetration"];

    // Get the current dropdown value data for latest year.
    // const topRecentYearDropdownValueData = healthCenterData.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    const recentYearData = formatRaceAndEthnicityData(raceAndEthnicityData).sort((a, b) => b[b.RaceType] - a[a.RaceType]);
    const topMostRaceData = recentYearData[0];
    const topSecondRaceData = recentYearData[1];
    const topThirdRaceData = recentYearData[2];

    let recentYearZipLevelData, topZipLevelData;
    if (isZipLevelDataAvailable) {
      recentYearZipLevelData = formatRaceAndEthnicityData(raceAndEthnicityZipLevelData).sort((a, b) => b[b.RaceType] - a[a.RaceType]);
      topZipLevelData = recentYearZipLevelData[0];
    }

    // const isHealthCentersSelected = dropdownValue === "Health Centers";

    return (
      <SectionColumns>
        <SectionTitle>Health Center Demographics</SectionTitle>
        <article>
          {isZipLevelDataAvailable ? <div></div> : meta.name === "" ? <div></div> : <div className="disclaimer">Showing data for Wayne County</div>}
          {/* Create a dropdown list. */}
          {/* <label className="pt-label pt-inline" htmlFor="health-center-dropdown">
            Show data for
            <div className="pt-select">
              <select id="health-center-dropdown" onChange={this.handleChange}>
                {dropdownList.map(item => <option key={item} value={item}>{formatDropdownName(item)}</option>)}
              </select>
            </div>
          </label> */}
          {/* Show top stats for each dropdown choice. */}
          {/* {isHealthCentersSelected
            ? <div>
              <Stat
                title={`Zip Code with the most ${dropdownValue}`}
                year={`${topRecentYearDropdownValueData.Year}`}
                value={topRecentYearDropdownValueData.Zip}
                qualifier={`${topRecentYearDropdownValueData[dropdownValue]} Health Centers`}
              />
              <p>In {topRecentYearDropdownValueData.Year}, the zip code in Wayne County with the most {dropdownValue} was {topRecentYearDropdownValueData.Zip} ({topRecentYearDropdownValueData[dropdownValue]} health centers).</p>
              <p>The following map shows the total number of health centers for all zip codes in Wayne County.</p>
            </div>
            : <div>
              <Stat
                title="Zip Code with the most health center visits"
                year={`${topRecentYearDropdownValueData.Year}`}
                value={topRecentYearDropdownValueData.Zip}
                qualifier={formatPercentage(topRecentYearDropdownValueData[dropdownValue])}
              />
              <p> In {topRecentYearDropdownValueData.Year}, the zip code in Wayne County with the most {dropdownValue.toLowerCase()} was {topRecentYearDropdownValueData.Zip} ({formatPercentage(topRecentYearDropdownValueData[dropdownValue])}).</p>
              <p>The following map shows the share of {dropdownValue.toLowerCase()} for all zip codes in Wayne County.</p>
            </div>
          } */}

          {isZipLevelDataAvailable 
            ? <Stat
              title={`Most visited health center race in ${topZipLevelData.Geography}`}
              year={`${topZipLevelData.Year}`}
              value={formatRaceNames(topZipLevelData.RaceType)}
              qualifier={`${formatPercentage(topZipLevelData[topZipLevelData.RaceType])} of the population in ${topZipLevelData.Geography}`}
            /> : null}

          <Stat
            title={"Most visited health center race in Wayne County"}
            year={`${topMostRaceData.Year}`}
            value={formatRaceNames(topMostRaceData.RaceType)}
            qualifier={`${formatPercentage(topMostRaceData[topMostRaceData.RaceType])} of the population in Wayne County`}
          />

          {isZipLevelDataAvailable ? <p>In {topMostRaceData.Year}, {formatPercentage(topZipLevelData[topZipLevelData.RaceType])} of the population in {`zip ${topZipLevelData.Geography}`} were {lowerCaseRaceName(formatRaceNames(topZipLevelData.RaceType))} residents who visited health centers more than any other race/ethnicity group, compared to {formatPercentage(topMostRaceData[topMostRaceData.RaceType])} {lowerCaseRaceName(formatRaceNames(topMostRaceData.RaceType))} residents in Wayne County.</p> 
            : <p>In {topMostRaceData.Year}, {lowerCaseRaceName(formatRaceNames(topMostRaceData.RaceType))} residents of Wayne County visited health centers more than any other race/ethnicity group ({formatPercentage(topMostRaceData[topMostRaceData.RaceType])} of the population). This is followed by {formatRaceNames(topSecondRaceData.RaceType)} residents ({formatPercentage(topSecondRaceData[topSecondRaceData.RaceType])}) and then {formatRaceNames(topThirdRaceData.RaceType)} residents ({formatPercentage(topThirdRaceData[topThirdRaceData.RaceType])}).</p>}

          <p> The following chart shows the health center visitors breakdown across all race/ethnicity groups in {isZipLevelDataAvailable ? topZipLevelData.Geography : "Wayne County"}.</p>

          <Contact slug={this.props.slug} />

        </article>

        {/* Draw a BarChart to show data for health center data by race */}
        <BarChart config={{
          data: isZipLevelDataAvailable ? `/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Geography=${meta.id}&Year=all` : "/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Year=all",
          discrete: "y",
          height: 250,
          legend: false,
          groupBy: "RaceType",
          label: d => formatRaceNames(d.RaceType),
          x: d => d[d.RaceType],
          y: "RaceType",
          time: "Year",
          xConfig: {
            tickFormat: d => formatPercentage(d),
            labelRotation: false
          },
          yConfig: {ticks: []},
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d[d.RaceType])], ["Geography", d => isZipLevelDataAvailable ? d.Geography : "Wayne County"]]}
        }}
        dataFormat={resp => formatRaceAndEthnicityData(resp)}
        />

        {/* Draw Geomap to show health center count for each zip code in the Wayne county */}
        {/* <Geomap config={{
          data: "/api/data?measures=Health Centers,Health Center Penetration,Low-Income Health Center Penetration,Uninsured Health Center Penetration&drilldowns=Zip&Year=all",
          groupBy: d => d["ID Zip"].slice(7),
          colorScale: dropdownValue,
          colorScaleConfig: {
            axisConfig: {tickFormat: isHealthCentersSelected ? d => d : d => formatPercentage(d)}
          },
          label: d => d.Zip,
          height: 400,
          time: "Year",
          tooltipConfig: isHealthCentersSelected ? {tbody: [["Year", d => d.Year], ["Health Centers", d => d[dropdownValue]]]} : {tbody: [["Year", d => d.Year], ["Visitor", dropdownValue], ["Share", d => formatPercentage(d[dropdownValue])]]},
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
          topojsonId: d => d.properties.ZCTA5CE10
        }}
        dataFormat={resp => resp.data}
        /> */}
      </SectionColumns>
    );
  }
}

HealthCenterDemographics.defaultProps = {
  slug: "health-center-demographics"
};

HealthCenterDemographics.need = [
  // fetchData("healthCenterData", "/api/data?measures=Health Centers&drilldowns=Zip&Year=latest"),
  fetchData("raceAndEthnicityData", "/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Year=latest"),
  fetchData("raceAndEthnicityZipLevelData", "/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  // healthCenterData: state.data.healthCenterData,
  raceAndEthnicityData: state.data.raceAndEthnicityData,
  raceAndEthnicityZipLevelData: state.data.raceAndEthnicityZipLevelData
});

export default connect(mapStateToProps)(HealthCenterDemographics);
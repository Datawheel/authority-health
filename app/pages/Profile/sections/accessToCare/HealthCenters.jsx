import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import zipcodes from "../../../../utils/zipcodes";

const formatRaceNames = d => d.replace("Health Center Patients", "");

const formatPercentage = d => `${formatAbbreviate(d * 100)}%`;

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

class HealthCenters extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {
      healthCenterData: this.props.healthCenterData,
      dropdownValue: "Health Centers"
    };
  }
  
  // Handler function for dropdown onChange event.
  handleChange = event => {
    this.setState({dropdownValue: event.target.value});
    axios.get(`/api/data?measures=${event.target.value}&drilldowns=Zip&Year=latest`)
      .then(resp => this.setState({healthCenterData: resp.data}));
  }

  render() {
    const {raceAndEthnicityData} = this.props;
    const {healthCenterData, dropdownValue} = this.state;
    const dropdownList = ["Health Centers", "Health Center Penetration", "Low-Income Health Center Penetration", "Uninsured Health Center Penetration"];

    // Get the current dropdown value data for latest year.
    const topRecentYearDropdownValueData = healthCenterData.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    const recentYearRaceAndEthnicityData = formatRaceAndEthnicityData(raceAndEthnicityData).sort((a, b) => b[b.RaceType] - a[a.RaceType]);
    const topMostRaceData = recentYearRaceAndEthnicityData[0];
    const topSecondRaceData = recentYearRaceAndEthnicityData[1];
    const topThirdRaceData = recentYearRaceAndEthnicityData[2];

    const isHealthCentersSelected = dropdownValue === "Health Centers";

    return (
      <SectionColumns>
        <SectionTitle>Health Centers</SectionTitle>
        <article>
          {/* Create a dropdown list. */}
          <div className="pt-select">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          {/* Show top stats for each dropdown choice. */}
          {isHealthCentersSelected
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
              <p> In {topRecentYearDropdownValueData.Year}, the zip code in Wayne County with the most {dropdownValue.toLowerCase()} visiting health centers was {topRecentYearDropdownValueData.Zip} ({formatPercentage(topRecentYearDropdownValueData[dropdownValue])}).</p>
              <p>The following map shows the share of {dropdownValue.toLowerCase()} for all zip codes in Wayne County.</p>
            </div>
          }

          <p>{formatRaceNames(topMostRaceData.RaceType)} residents of Wayne County visit health centers more than any other race/ethnicity group ({formatPercentage(topMostRaceData[topMostRaceData.RaceType])}). This is followed by {formatRaceNames(topSecondRaceData.RaceType)} residents ({formatPercentage(topSecondRaceData[topSecondRaceData.RaceType])}) and then {formatRaceNames(topThirdRaceData.RaceType)} residents ({formatPercentage(topThirdRaceData[topThirdRaceData.RaceType])}).</p>
          <p> The following barchart shows the breakdown across all race/ethnicity groups in Wayne County.</p>

          {/* Draw a BarChart to show data for health center data by race */}
          <BarChart config={{
            data: "/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Year=all",
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d[d.RaceType])]]}
          }}
          dataFormat={resp => formatRaceAndEthnicityData(resp)}
          />
        </article>

        {/* Draw Geomap to show health center count for each zip code in the Wayne county */}
        <Geomap config={{
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
        />
      </SectionColumns>
    );
  }
}

HealthCenters.defaultProps = {
  slug: "health-centers"
};

HealthCenters.need = [
  fetchData("healthCenterData", "/api/data?measures=Health Centers&drilldowns=Zip&Year=latest"),
  fetchData("raceAndEthnicityData", "/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Year=latest")
];

const mapStateToProps = state => ({
  healthCenterData: state.data.healthCenterData,
  raceAndEthnicityData: state.data.raceAndEthnicityData
});

export default connect(mapStateToProps)(HealthCenters);

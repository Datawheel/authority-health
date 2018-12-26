import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import zipcodes from "../../../../utils/zipcodes";

const formatName = d => {
  const nameArr = d.split(" ");
  return nameArr.reduce((acc, currValue, i) => i === 0 ? "" : acc.concat(currValue), "").trim();
};

const formatRaceNames = d => d.split(" ").slice(1).join();

const formatPercentage = d => `${formatAbbreviate(d * 100)}%`;

const formatMeasureName = d => {
  if (d === "Health Centers") return d;
  const nameArr = d.split(" ");
  return `${nameArr[2]} Population`;
};

class HealthCenters extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Health Centers"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {
    const {healthCenterData, raceAndEthnicityData} = this.props;
    const {dropdownValue} = this.state;
    const dropdownList = healthCenterData.source[0].measures;

    // Get the current dropdown value data for latest year.
    const recentYearHealthCenterData = {};
    nest()
      .key(d => d.Year)
      .entries(healthCenterData.data)
      .forEach(group => {
        group.key >= healthCenterData.data[0].Year ? Object.assign(recentYearHealthCenterData, group) : {};
      });
    const topRecentYearDropdownValueData = recentYearHealthCenterData.values.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    // Get most recent year data for race and ethnicity.
    // Add RaceType property to raceAndEthnicityData so that each race type can have individual object.
    const recentYearRaceAndEthnicityData = {};
    const data = [];
    nest()
      .key(d => d.Year)
      .entries(raceAndEthnicityData.data)
      .forEach(group => {
        raceAndEthnicityData.source[0].measures.map(d => {
          const result = group.values.reduce((acc, currentValue) => {
            if (acc === null && currentValue[d] !== null) {
              // Non-white race population is the sum of all the race population minus White population.
              if (d === "% Non-white") {
                d = "% White";
                currentValue[d] = 1 - currentValue["% Non-white"];
                return Object.assign({}, currentValue, {RaceType: d});
              }
              return Object.assign({}, currentValue, {RaceType: d});
            }
            return acc;
          }, null);
          data.push(result);
        });
        group.key >= raceAndEthnicityData.data[0].Year ? Object.assign(recentYearRaceAndEthnicityData, group) : {};
      });

    nest()
      .key(d => d.Year)
      .entries(data)
      .forEach(group => {
        group.key >= data[0].Year ? Object.assign(recentYearRaceAndEthnicityData, group) : {};
      });

    recentYearRaceAndEthnicityData.values.sort((a, b) => b[b.RaceType] - a[a.RaceType]);
    const topMostRaceData = recentYearRaceAndEthnicityData.values[0];
    const topSecondRaceData = recentYearRaceAndEthnicityData.values[1];
    const topThirdRaceData = recentYearRaceAndEthnicityData.values[2];

    const isHealthCentersSelected = dropdownValue === "Health Centers";

    return (
      <SectionColumns>
        <SectionTitle>Health Centers</SectionTitle>
        <article>
          {/* Create a dropdown list. */}
          <div className="pt-select">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{formatMeasureName(item)}</option>)}
            </select>
          </div>
          {/* Show top stats for each dropdown choice. */}
          {isHealthCentersSelected 
            ? <div>
              <Stat
                title={`Zip Code with the most ${formatMeasureName(dropdownValue)}`}
                year={`${topRecentYearDropdownValueData.Year}`}
                value={topRecentYearDropdownValueData["Zip Code"]}
                qualifier={`${topRecentYearDropdownValueData[dropdownValue]} Health Centers`}
              />
              <p>In {topRecentYearDropdownValueData.Year}, the zip code in Wayne County with the most {dropdownValue} was {topRecentYearDropdownValueData["Zip Code"]} ({topRecentYearDropdownValueData[dropdownValue]} health centers).</p>
              <p>The following map shows the total number of health centers for all zip codes in Wayne County, MI.</p>
            </div>
            : <div>
              <Stat
                title="Zip Code with the most health center visits"
                year={`${topRecentYearDropdownValueData.Year}`}
                value={topRecentYearDropdownValueData["Zip Code"]}
                qualifier={formatPercentage(topRecentYearDropdownValueData[dropdownValue])}
              />
              <p>In {topRecentYearDropdownValueData.Year}, the zip code in Wayne County with the most {formatMeasureName(dropdownValue).toLowerCase()} visiting health centers was {topRecentYearDropdownValueData["Zip Code"]} ({formatPercentage(topRecentYearDropdownValueData[dropdownValue])}).</p>
              <p>The following map shows the share of {formatMeasureName(dropdownValue).toLowerCase()} visiting health centers for all zip codes in Wayne County, MI.</p>
            </div>
          }

          <p>{formatRaceNames(topMostRaceData.RaceType)} Residents of Wayne County visit health centers more than any other race/ethnicity group ({formatPercentage(topMostRaceData[topMostRaceData.RaceType])}). This is followed by {formatRaceNames(topSecondRaceData.RaceType)} residents ({formatPercentage(topSecondRaceData[topSecondRaceData.RaceType])}) and then {formatRaceNames(topThirdRaceData.RaceType)} residents ({formatPercentage(topThirdRaceData[topThirdRaceData.RaceType])}).</p>
          <p> The following barchart shows the breakdown across all race/ethnicity groups in Wayne County.</p>
          
          {/* Draw a BarChart to show data for health center data by race */}
          <BarChart config={{
            data,
            discrete: "y",
            height: 250,
            legend: false,
            groupBy: "RaceType",
            label: d => formatName(d.RaceType),
            x: d => d[d.RaceType],
            y: "RaceType",
            time: "ID Year",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              labelRotation: false
            },
            yConfig: {ticks: []},
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d[d.RaceType])]]}
          }}
          />
        </article>

        {/* Draw Geomap to show health center count for each zip code in the Wayne county */}
        <Geomap config={{
          data: healthCenterData.data,
          groupBy: "Zip Code",
          colorScale: dropdownValue,
          colorScaleConfig: {
            axisConfig: {tickFormat: isHealthCentersSelected ? d => d : d => formatPercentage(d)}
          },
          label: d => d["Zip Code"],
          height: 400,
          time: "Year",
          tooltipConfig: isHealthCentersSelected ? {tbody: [["Year", d => d.Year], ["Health Centers", d => d[dropdownValue]]]} : {tbody: [["Year", d => d.Year], ["Visitor", formatMeasureName(dropdownValue)], ["Share", d => formatPercentage(d[dropdownValue])]]},
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
          topojsonId: d => d.properties.ZCTA5CE10
        }}
        />
      </SectionColumns>
    );
  }
}

HealthCenters.defaultProps = {
  slug: "health-centers"
};

HealthCenters.need = [
  fetchData("healthCenterData", "/api/data?measures=Health Centers,Penetration of Total Population,Penetration of Low-Income,Penetration of Uninsured Population&drilldowns=Zip Code&Year=all"),
  fetchData("raceAndEthnicityData", "/api/data?measures=% Non-white,% Hispanic,% Black,% Asian,% American Indian/Alaska Native&Year=all")
];

const mapStateToProps = state => ({
  healthCenterData: state.data.healthCenterData,
  raceAndEthnicityData: state.data.raceAndEthnicityData
});

export default connect(mapStateToProps)(HealthCenters);

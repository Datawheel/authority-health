import React from "react";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "./Stat";

const formatName = name => name.split(",")[0];

class DemographicFoodAccess extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Children, low access to store (%)"};
  }

  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {foodAccessByTypes} = this.props;
    console.log("foodAccessByTypes: ", foodAccessByTypes);

    const data = foodAccessByTypes.source[0].measures.map(d => {
      const result = foodAccessByTypes.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue[d] !== null) {
          return Object.assign({}, currentValue, {AgeRaceType: d});
        }
        return acc;
      }, null);
      return result;
    });

    console.log("data: ", data);

    const raceAndAgeTypes = ["Children, low access to store (%)", "Seniors, low access to store (%)", "White, low access to store (%)", "Black, low access to store (%)", "Hispanic ethnicity, low access to store (%)", "Asian, low access to store (%)", "American Indian or Alaska Native, low access to store (%)", "Hawaiian or Pacific Islander, low access to store (%)", "Multiracial, low access to store (%)"];
    const dropdownValues = item => <option value={item}>{item}</option>;
    const currentRaceAndAgeData = data.find(d => d.AgeRaceType === this.state.dropdownValue);

    const ageData = [], raceData = [];
    data.forEach(d => d.AgeRaceType === raceAndAgeTypes[0] || d.AgeRaceType === raceAndAgeTypes[1] ? ageData.push(d) : raceData.push(d));

    return (
      <SectionColumns>
        <SectionTitle>Demographic Access</SectionTitle>
        <article>
          <select onChange={this.handleChange}>{raceAndAgeTypes.map(dropdownValues)}</select>
          <Stat
            title={`Access in ${currentRaceAndAgeData.County} County`}
            value={`${formatAbbreviate(currentRaceAndAgeData[this.state.dropdownValue])}%`}
          />
          {/* <p>{largestRaceGroup} {formatAbbreviate(largestRaceGroupPercentage)}% in the year {foodAccessByRace.data[0]["ID Year"]} in {foodAccessByRace.data[0].County} County</p> */}

          {this.state.dropdownValue === raceAndAgeTypes[0] || this.state.dropdownValue === raceAndAgeTypes[1]
            ? <BarChart config={{
              data: ageData,
              discrete: "y",
              height: 200,
              legend: false,
              groupBy: "AgeRaceType",
              x: d => d[d.AgeRaceType],
              y: "AgeRaceType",
              yConfig: {ticks: []},
              tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d[d.AgeRaceType])]]}
            }}
            />
            : <BarChart config={{
              data: raceData,
              discrete: "y",
              height: 300,
              legend: false,
              groupBy: "AgeRaceType",
              x: d => d[d.AgeRaceType],
              y: "AgeRaceType",
              yConfig: {
                ticks: [],
                tickFormat: d => formatName(d)
              },
              tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d[d.AgeRaceType])]]}
            }}
            />
          }
        </article>

        <Geomap config={{
          data: "/api/data?measures=White%2C%20low%20access%20to%20store%20(%25),Black%2C%20low%20access%20to%20store%20(%25),Hispanic%20ethnicity%2C%20low%20access%20to%20store%20(%25),Asian%2C%20low%20access%20to%20store%20(%25),American%20Indian%20or%20Alaska%20Native%2C%20low%20access%20to%20store%20(%25),Hawaiian%20or%20Pacific%20Islander%2C%20low%20access%20to%20store%20(%25),Multiracial%2C%20low%20access%20to%20store%20(%25),Children%2C%20low%20access%20to%20store%20(%25),Seniors%2C%20low%20access%20to%20store%20(%25)&drilldowns=County&Year=all",
          groupBy: "ID County",
          colorScale: this.state.dropdownValue,
          label: d => d.County,
          height: 400,
          tooltipConfig: {tbody: [["Value", d => {
            console.log("d[this.state.dropdownValue]: ", d[this.state.dropdownValue]);
            return formatAbbreviate(d[this.state.dropdownValue]);
          }]]},
          topojson: "/topojson/county.json",
          topojsonFilter: d => d.id.startsWith("05000US26")
        }}
        dataFormat={resp => resp.data}
        />
      </SectionColumns>
    );
  }
}

DemographicFoodAccess.defaultProps = {
  slug: "demographic-access"
};

DemographicFoodAccess.need = [
  fetchData("foodAccessByTypes", "/api/data?measures=White%2C%20low%20access%20to%20store%20(%25),Black%2C%20low%20access%20to%20store%20(%25),Hispanic%20ethnicity%2C%20low%20access%20to%20store%20(%25),Asian%2C%20low%20access%20to%20store%20(%25),American%20Indian%20or%20Alaska%20Native%2C%20low%20access%20to%20store%20(%25),Hawaiian%20or%20Pacific%20Islander%2C%20low%20access%20to%20store%20(%25),Multiracial%2C%20low%20access%20to%20store%20(%25),Children%2C%20low%20access%20to%20store%20(%25),Seniors%2C%20low%20access%20to%20store%20(%25)&County=<id>&Year=all")
];

const mapStateToProps = state => ({
  foodAccessByTypes: state.data.foodAccessByTypes
});
  
export default connect(mapStateToProps)(DemographicFoodAccess);

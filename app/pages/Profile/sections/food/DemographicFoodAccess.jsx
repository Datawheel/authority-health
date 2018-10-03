import React from "react";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

const formatName = name => name.split(",")[0];

class DemographicFoodAccess extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Children, low access to store (%)"};
  }

  // Handler for dropdown onChange function.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {foodAccessByTypes} = this.props;

    // Create individual data object for each type of age and race.
    // Add AgeRaceType key in each object.
    const data = foodAccessByTypes.source[0].measures.map(d => {
      const result = foodAccessByTypes.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue[d] !== null) {
          return Object.assign({}, currentValue, {AgeRaceType: d});
        }
        return acc;
      }, null);
      return result;
    });

    // Array of each race and age type.
    const raceAndAgeTypes = ["Children, low access to store (%)", "Seniors, low access to store (%)", "White, low access to store (%)", "Black, low access to store (%)", "Hispanic ethnicity, low access to store (%)", "Asian, low access to store (%)", "American Indian or Alaska Native, low access to store (%)", "Hawaiian or Pacific Islander, low access to store (%)", "Multiracial, low access to store (%)"];
    
    const dropdownValues = item => <option value={item}>{item}</option>;
    
    const currentRaceAndAgeData = data.find(d => d.AgeRaceType === this.state.dropdownValue);

    // Separate data for age and race.
    const ageData = [], raceData = [];
    data.forEach(d => d.AgeRaceType === raceAndAgeTypes[0] || d.AgeRaceType === raceAndAgeTypes[1] ? ageData.push(d) : raceData.push(d));

    // Sort age and race data to get the object with largest age/race value.
    raceData.sort((a, b) =>  b[b.AgeRaceType] - a[a.AgeRaceType]);
    ageData.sort((a, b) =>  b[b.AgeRaceType] - a[a.AgeRaceType]);

    return (
      <SectionColumns>
        <SectionTitle>Demographic Access</SectionTitle>
        <article>
          {/* Create a dropdown using raceAndAgeTypes array. */}
          <select onChange={this.handleChange}>{raceAndAgeTypes.map(dropdownValues)}</select>
          <Stat
            title={`Access in ${currentRaceAndAgeData.County} County`}
            value={`${formatAbbreviate(currentRaceAndAgeData[this.state.dropdownValue])}%`}
          />

          {/* Create a paragraph based on the dropdown choice. */}
          {this.state.dropdownValue === raceAndAgeTypes[0] || this.state.dropdownValue === raceAndAgeTypes[1]
            ? <p> In {ageData[0].County} County {formatName(ageData[0].AgeRaceType)} were the largest age group with {formatAbbreviate(ageData[0][ageData[0].AgeRaceType])}% in the year {ageData[0]["ID Year"]}</p>
            : <p> In {raceData[0].County} County {formatName(raceData[0].AgeRaceType)} were the largest race group with {formatAbbreviate(raceData[0][raceData[0].AgeRaceType])}% in the year {raceData[0]["ID Year"]}</p>
          }

          {/* Create a BarChart based on the dropdown choice. */}
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

        {/* Create a Geomap based on the dropdown choice. */}
        <Geomap config={{
          data: `/api/data?measures=${this.state.dropdownValue.replace(/\%/g, "%25").replace(/\s/g, "%20").replace(/\,/g, "%2C").replace(/\(/g, "%28").replace(/\)/g, "%29")}&drilldowns=County&Year=all`,
          groupBy: "ID County",
          colorScale: this.state.dropdownValue,
          label: d => d.County,
          height: 400,
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d[this.state.dropdownValue])]]},
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

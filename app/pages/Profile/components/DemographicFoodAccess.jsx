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
    this.state = {dropdownValue: ""};
  }

  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {foodAccessByRace} = this.props;
    const races = foodAccessByRace.source[0].measures;
    const data = foodAccessByRace.source[0].measures.map(race => {
      const result = foodAccessByRace.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue[race] !== null) {
          return Object.assign({}, currentValue, {RaceType: race});
        }
        return acc;
      }, null);
      return result;
    });

    data.sort((a, b) =>  b[b.RaceType] - a[a.RaceType]);

    let largestRaceGroupPercentage = foodAccessByRace.data[0][races[0]];
    let largestRaceGroup = formatName(races[0]);
    races.forEach(race => {
      if (foodAccessByRace.data[0][race] > largestRaceGroupPercentage) {
        largestRaceGroupPercentage = foodAccessByRace.data[0][race];
        largestRaceGroup = formatName(race);
      }
    });

    return (
      <SectionColumns>
        <SectionTitle>Demographic Access</SectionTitle>
        <article>

          <select onChange={this.handleChange} value={this.state.value}>
            <option value="Children">Children</option>
            <option value="Seniors">Seniors</option>
            <option value="White">White</option>
            <option value="Black">Black</option>
            <option value="Hispanic ethnicity">Hispanic ethnicity</option>
            <option value="Asian">Asian</option>
            <option value="American Indian or Alaska Native">American Indian or Alaska Native</option>
            <option value="Hawaiian or Pacific Islander">Hawaiian or Pacific Islander</option>
            <option value="Multiracial">Multiracial</option>
          </select>

          <Stat
            title={`Most common ${this.state.dropdownValue} with low store access`}
            value={`${this.state.dropdownValue} ${formatAbbreviate(largestRaceGroupPercentage)}%`}
          />
          <p>{largestRaceGroup} {formatAbbreviate(largestRaceGroupPercentage)}% in the year {foodAccessByRace.data[0]["ID Year"]} in {foodAccessByRace.data[0].County} County</p>
          <BarChart config={{
            data: `/api/data?measures=Children%2C%20low%20access%20to%20store%20(%25),Seniors%2C%20low%20access%20to%20store%20(%25)&County=${foodAccessByRace.data[0]["ID County"]}&Year=all`,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: "AgeType",
            x: d => d[d.AgeType],
            y: "AgeType",
            yConfig: {ticks: []},
            tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d[d.AgeType])]]}
          }}
          dataFormat={resp => {
            const data = resp.source[0].measures.map(ageType => {
              const result = resp.data.reduce((acc, currentValue) => {
                if (acc === null && currentValue[ageType] !== null) {
                  return Object.assign({}, currentValue, {AgeType: ageType});
                }
                return acc;
              }, null);
              return result;
            });
            return data;
          }}
          />
          <BarChart config={{
            data,
            discrete: "y",
            height: 300,
            legend: false,
            groupBy: "RaceType",
            x: d => d[d.RaceType],
            y: "RaceType",
            yConfig: {
              ticks: [],
              tickFormat: d => formatName(d)
            },
            tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d[d.RaceType])]]}
          }}
          />
        </article>

        <Geomap config={{
          data: "/api/data?measures=Children%2C%20low%20access%20to%20store%20(%25),Seniors%2C%20low%20access%20to%20store%20(%25)&drilldowns=County&Year=all",
          groupBy: "ID County",
          colorScale: "Children, low access to store (%)",
          label: d => d.County,
          height: 400,
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d["Children, low access to store (%)"])]]},
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
  fetchData("foodAccessByRace", "/api/data?measures=White%2C%20low%20access%20to%20store%20(%25),Black%2C%20low%20access%20to%20store%20(%25),Hispanic%20ethnicity%2C%20low%20access%20to%20store%20(%25),Asian%2C%20low%20access%20to%20store%20(%25),American%20Indian%20or%20Alaska%20Native%2C%20low%20access%20to%20store%20(%25),Hawaiian%20or%20Pacific%20Islander%2C%20low%20access%20to%20store%20(%25),Multiracial%2C%20low%20access%20to%20store%20(%25)&County=<id>&Year=all")
];

const mapStateToProps = state => ({
  foodAccessByRace: state.data.foodAccessByRace
});
  
export default connect(mapStateToProps)(DemographicFoodAccess);

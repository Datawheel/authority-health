import React from "react";
import {connect} from "react-redux";
// import {Geomap} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class DrugUse extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Binge Drinking Data Value"};
  }

  // Handler for dropdown onChange function.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {smokingDrinkingData} = this.props;

    // Create individual data object for each type of age and race.
    // Add AgeRaceType key in each object.
    const data = smokingDrinkingData.source[0].measures.map(d => {
      const result = smokingDrinkingData.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue[d] !== null) {
          return Object.assign({}, currentValue, {DrupType: d});
        }
        return acc;
      }, null);
      return result;
    });

    console.log("smokingDrinkingData: ", smokingDrinkingData);
    console.log("data: ", data);

    // const dropdownValues = item => <option value={item}>{item}</option>;

    return (
      <SectionColumns>
        <SectionTitle>Drug Use</SectionTitle>
        <article>
          {/* Create a dropdown using raceAndAgeTypes array. */}
          {/* <select onChange={this.handleChange}>{raceAndAgeTypes.map(dropdownValues)}</select> */}
          <Stat
            // title={`Access in ${currentRaceAndAgeData.County} County`}
            // value={`${formatAbbreviate(currentRaceAndAgeData[this.state.dropdownValue])}%`}
          />

        </article>

      </SectionColumns>
    );
  }
}

DrugUse.defaultProps = {
  slug: "drug-use"
};

DrugUse.need = [
  fetchData("smokingDrinkingData", "/api/data?measures=Current%20Smoking%20Data%20Value,Binge%20Drinking%20Data%20Value&City=16000US2621000&Year=all")
];
  
const mapStateToProps = state => ({
  smokingDrinkingData: state.data.smokingDrinkingData
});
  
export default connect(mapStateToProps)(DrugUse);


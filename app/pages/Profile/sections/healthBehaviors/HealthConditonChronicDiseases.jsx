import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class HealthConditonChronicDiseases extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Arthritis Data Value"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {healthConditionData} = this.props;

    const {dropdownValue} = this.state;
    const dropdownList = healthConditionData.source[0].measures;

    const topDropdownValueTract = healthConditionData.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Health Conditon/Chronic Diseases</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <select onChange={this.handleChange}>
            {dropdownList.map((item, i) => <option key={i} value={item}>{item}</option>)}
          </select>

          <Stat
            title={`Majority ${dropdownValue} in ${topDropdownValueTract.Year}`}
            value={`${topDropdownValueTract.Tract} ${formatPercentage(topDropdownValueTract[dropdownValue])}`}
          />

          <p>In {topDropdownValueTract.Year}, top {dropdownValue} was {formatPercentage(topDropdownValueTract[dropdownValue])} in {topDropdownValueTract.Tract}.</p>
        </article>

        {/* Geomap to show Property Values for all tracts in the Wayne County. */}
        <Geomap config={{
          data: healthConditionData.data,
          groupBy: "ID Tract",
          colorScale: dropdownValue,
          label: d => d.Tract,
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Value", d => `${formatPercentage(d[dropdownValue])}`]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        />
      </SectionColumns>
    );
  }
}

HealthConditonChronicDiseases.defaultProps = {
  slug: "health-conditon-chronic-diseases"
};

HealthConditonChronicDiseases.need = [
  fetchData("healthConditionData", "/api/data?measures=Arthritis%20Data%20Value,COPD%20Data%20Value,Chronic%20Kidney%20Disease%20Data%20Value,Coronary%20Heart%20Disease%20Data%20Value,Current%20Asthma%20Data%20Value,High%20Blood%20Pressure%20Data%20Value,High%20Cholesterol%20Data%20Value,Mental%20Health%20Data%20Value,Stroke%20Data%20Value,Taking%20BP%20Medication%20Data%20Value,Teeth%20Loss%20Data%20Value,Sleep%20less%20than%207%20hours%20Data%20Value&drilldowns=Tract&Year=all"),
  fetchData("healthConditionWeightedData", "/api/data?measures=Cardiovascular%20Disease%20Yes%20Weighted%20Percent&drilldowns=End%20Year,Zip%20Region")
];

const mapStateToProps = state => ({
  healthConditionData: state.data.healthConditionData,
  healthConditionWeightedData: state.data.healthConditionWeightedData
});

export default connect(mapStateToProps)(HealthConditonChronicDiseases);

import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
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

    const {healthConditionData, healthConditionWeightedData} = this.props;

    // include all the measures from healthConditionData and healthConditionWeightedData.
    const {dropdownValue} = this.state;
    const dropdownList = healthConditionData.source[0].measures.slice();
    healthConditionWeightedData.source[0].measures.forEach(d => {
      dropdownList.push(d);
    });

    // Get top stats for the most recent year data for the selected dropdown value.
    const topDropdownValueTract = healthConditionData.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    const recentYearWeightedData = {};
    nest()
      .key(d => d["End Year"])
      .entries(healthConditionWeightedData.data)
      .forEach(group => {
        group.key >= healthConditionWeightedData.data[0]["End Year"] ? Object.assign(recentYearWeightedData, group) : {};
      });
    const topDropdownWeightedData = recentYearWeightedData.values[0];

    // Check if the selected dropdown values are from the healthConditionWeightedData.
    const isHealthConditionWeightedValueSelected = dropdownValue === "Cardiovascular Disease Yes Weighted Percent" ||
    dropdownValue === "Ever Depressive Yes Weighted Percent" ||
    dropdownValue === "Ever Heart Attack Yes Weighted Percent" ||
    dropdownValue === "Heart Disease Yes Weighted Percent" ||
    dropdownValue === "HIV Tested Yes Weighted Percent" ||
    dropdownValue === "Poor Mental Health 14 Or More Days Weighted Percent" ||
    dropdownValue === "Gen Health Fair Or Poor Weighted Percent";

    return (
      <SectionColumns>
        <SectionTitle>Health Conditon/Chronic Diseases</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <select onChange={this.handleChange}>
            {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
          </select>

          {/* Show top stats for the dropdown selected. */}
          { isHealthConditionWeightedValueSelected
            ? <Stat
              title={`Majority ${dropdownValue} in ${topDropdownWeightedData["End Year"]}`}
              value={`${topDropdownWeightedData.County} ${formatPercentage(topDropdownWeightedData[dropdownValue])}`}
            />
            : <Stat
              title={`Majority ${dropdownValue} in ${topDropdownValueTract.Year}`}
              value={`${topDropdownValueTract.Tract} ${formatPercentage(topDropdownValueTract[dropdownValue])}`}
            />
          }

          {/* Write short paragraphs explaining the Geomap and top stats for the dropdown value selected */}
          { isHealthConditionWeightedValueSelected
            ? <p>The Geomap here shows {dropdownValue} for Counties in the Michigan State.</p>
            : <p>The Geomap here shows {dropdownValue} for Tracts in the Wayne County, MI.</p>
          }
          { isHealthConditionWeightedValueSelected
            ? <p>In {topDropdownWeightedData["End Year"]}, top {dropdownValue} was {formatPercentage(topDropdownWeightedData[dropdownValue])} in {topDropdownWeightedData.County} County, MI.</p>
            : <p>In {topDropdownValueTract.Year}, top {dropdownValue} was {formatPercentage(topDropdownValueTract[dropdownValue])} in {topDropdownValueTract.Tract}.</p>
          }
        </article>

        {/* Geomap to show health condition data for selected dropdown value for all tracts in the Wayne County. */}
        {isHealthConditionWeightedValueSelected 
          ? <Geomap config={{
            data: healthConditionWeightedData.data,
            groupBy: "ID County",
            colorScale: dropdownValue,
            label: d => d.County,
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Value", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/county.json",
            topojsonFilter: d => d.id.startsWith("05000US26")
          }}
          /> 
          : <Geomap config={{
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
          />}
      </SectionColumns>
    );
  }
}

HealthConditonChronicDiseases.defaultProps = {
  slug: "health-conditon-chronic-diseases"
};

HealthConditonChronicDiseases.need = [
  fetchData("healthConditionData", "/api/data?measures=Arthritis%20Data%20Value,COPD%20Data%20Value,Chronic%20Kidney%20Disease%20Data%20Value,Coronary%20Heart%20Disease%20Data%20Value,Current%20Asthma%20Data%20Value,High%20Blood%20Pressure%20Data%20Value,High%20Cholesterol%20Data%20Value,Mental%20Health%20Data%20Value,Stroke%20Data%20Value,Taking%20BP%20Medication%20Data%20Value,Teeth%20Loss%20Data%20Value,Sleep%20less%20than%207%20hours%20Data%20Value&drilldowns=Tract&Year=all"),
  fetchData("healthConditionWeightedData", "/api/data?measures=Cardiovascular%20Disease%20Yes%20Weighted%20Percent,Ever%20Depressive%20Yes%20Weighted%20Percent,Ever%20Heart%20Attack%20Yes%20Weighted%20Percent,Heart%20Disease%20Yes%20Weighted%20Percent,HIV%20Tested%20Yes%20Weighted%20Percent,Poor%20Mental%20Health%2014%20Or%20More%20Days%20Weighted%20Percent,Gen%20Health%20Fair%20Or%20Poor%20Weighted%20Percent&drilldowns=End%20Year,County")
];

const mapStateToProps = state => ({
  healthConditionData: state.data.healthConditionData,
  healthConditionWeightedData: state.data.healthConditionWeightedData
});

export default connect(mapStateToProps)(HealthConditonChronicDiseases);

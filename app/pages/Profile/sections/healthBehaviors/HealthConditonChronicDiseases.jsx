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

    // Include all the measures from healthConditionData and healthConditionWeightedData in the dropdown list.
    const {dropdownValue} = this.state;
    const dropdownList = healthConditionData.source[0].measures.slice();
    healthConditionWeightedData.source[0].measures.forEach(d => {
      dropdownList.push(d);
    });

    // Check if the selected dropdown values are from the healthConditionWeightedData.
    const isHealthConditionWeightedValueSelected = dropdownValue === "Cardiovascular Disease Yes Weighted Percent" ||
    dropdownValue === "Ever Depressive Yes Weighted Percent" ||
    dropdownValue === "Ever Heart Attack Yes Weighted Percent" ||
    dropdownValue === "Heart Disease Yes Weighted Percent" ||
    dropdownValue === "HIV Tested Yes Weighted Percent" ||
    dropdownValue === "Poor Mental Health 14 Or More Days Weighted Percent" ||
    dropdownValue === "Gen Health Fair Or Poor Weighted Percent";

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

    return (
      <SectionColumns>
        <SectionTitle>Health Conditon/Chronic Diseases</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {/* Show top stats for the dropdown selected. */}
          { isHealthConditionWeightedValueSelected
            ? <Stat
              title={"Location with highest prevalence"}
              year={topDropdownWeightedData["End Year"]}
              value={topDropdownWeightedData.County}
              qualifier={formatPercentage(topDropdownWeightedData[dropdownValue])}
            />
            : <Stat
              title={"Location with highest prevalence"}
              year={topDropdownValueTract.Year}
              value={topDropdownValueTract.Tract}
              qualifier={formatPercentage(topDropdownValueTract[dropdownValue])}
            />
          }

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          { isHealthConditionWeightedValueSelected
            ? <p>In {topDropdownWeightedData["End Year"]}, {topDropdownWeightedData.County} had the highest prevalence of {dropdownValue.toLowerCase()} ({formatPercentage(topDropdownWeightedData[dropdownValue])}) out of all the counties in Michigan.</p>
            : <p>In {topDropdownValueTract.Year}, {topDropdownValueTract.Tract} had the highest prevalence of {dropdownValue.toLowerCase()} ({formatPercentage(topDropdownValueTract[dropdownValue])}) out of all the tracts in Wayne county.</p>
          }
          { isHealthConditionWeightedValueSelected
            ? <p>The map here shows the {dropdownValue.toLowerCase()} for all counties in Michigan.</p>
            : <p>The map here shows the {dropdownValue.toLowerCase()} for all tracts in Wayne County, MI.</p>
          }
        </article>

        {/* Geomap to show health condition data for selected dropdown value. */}
        {isHealthConditionWeightedValueSelected
          ? <Geomap config={{
            data: healthConditionWeightedData.data,
            groupBy: "ID County",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.County,
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/county.json",
            topojsonFilter: d => d.id.startsWith("05000US26")
          }}
          />
          : <Geomap config={{
            data: healthConditionData.data,
            groupBy: "ID Tract",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.Tract,
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue])}`]]},
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
  fetchData("healthConditionData", "/api/data?measures=Arthritis Data Value,COPD Data Value,Chronic Kidney Disease Data Value,Coronary Heart Disease Data Value,Current Asthma Data Value,High Blood Pressure Data Value,High Cholesterol Data Value,Mental Health Data Value,Stroke Data Value,Taking BP Medication Data Value,Teeth Loss Data Value,Sleep less than 7 hours Data Value&drilldowns=Tract&Year=all"),
  fetchData("healthConditionWeightedData", "/api/data?measures=Cardiovascular Disease Yes Weighted Percent,Ever Depressive Yes Weighted Percent,Ever Heart Attack Yes Weighted Percent,Heart Disease Yes Weighted Percent,HIV Tested Yes Weighted Percent,Poor Mental Health 14 Or More Days Weighted Percent,Gen Health Fair Or Poor Weighted Percent&drilldowns=End Year,County")
];

const mapStateToProps = state => ({
  healthConditionData: state.data.healthConditionData,
  healthConditionWeightedData: state.data.healthConditionWeightedData
});

export default connect(mapStateToProps)(HealthConditonChronicDiseases);

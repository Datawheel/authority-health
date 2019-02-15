import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class ConditionsAndChronicDiseases extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      dropdownValue: "Arthritis",
      healthConditionWeightedData: [],
      healthConditionData: this.props.healthConditionData
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    if (dropdownValue === "Cardiovascular Disease" ||
    dropdownValue === "Ever Depressive" ||
    dropdownValue === "Ever Heart Attack" ||
    dropdownValue === "Heart Disease" ||
    dropdownValue === "HIV Tested" ||
    dropdownValue === "Poor Mental Health 14 Or More Days" ||
    dropdownValue === "Gen Health Fair Or Poor") { 
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=latest`)
        .then(resp => {
          this.setState({healthConditionWeightedData: resp.data.data});
          this.setState({dropdownValue});
        }); 
    }
    else {
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Tract&Year=latest`)
        .then(resp => {
          this.setState({healthConditionData: resp.data.data});
          this.setState({dropdownValue});
        });
    }
  }

  render() {
    // Include all the measures in the dropdown list.
    const {dropdownValue, healthConditionData, healthConditionWeightedData} = this.state;
    const dropdownList = ["Arthritis", "COPD", "Chronic Kidney Disease", "Coronary Heart Disease", "Current Asthma", "High Blood Pressure", "High Cholesterol", 
      "Mental Health", "Stroke", "Taking Blood Pressure Medication", "Teeth Loss", "Sleep Less Than 7 Hours", "Cardiovascular Disease", "Ever Depressive", 
      "Ever Heart Attack", "Heart Disease", "HIV Tested", "Poor Mental Health 14 Or More Days", "Gen Health Fair Or Poor"];

    // Check if the selected dropdown values are from the healthConditionWeightedData.
    const isHealthConditionWeightedValueSelected = dropdownValue === "Cardiovascular Disease" ||
    dropdownValue === "Ever Depressive" ||
    dropdownValue === "Ever Heart Attack" ||
    dropdownValue === "Heart Disease" ||
    dropdownValue === "HIV Tested" ||
    dropdownValue === "Poor Mental Health 14 Or More Days" ||
    dropdownValue === "Gen Health Fair Or Poor";

    // Get top stats for the most recent year data for the selected dropdown value.
    const topDropdownValueTract = healthConditionData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];
    const topDropdownWeightedData = healthConditionWeightedData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Conditons & Chronic Diseases</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {/* Show top stats for the dropdown selected. */}
          { isHealthConditionWeightedValueSelected
            ? <div>
              <div className="disclaimer">Data only available for zip regions.</div>
              <Stat
                title={"Location with highest prevalence"}
                year={topDropdownWeightedData["End Year"]}
                value={topDropdownWeightedData["Zip Region"]}
                qualifier={formatPercentage(topDropdownWeightedData[dropdownValue])}
              />
            </div>
            : <div>
              <div className="disclaimer">Data only available for tracts.</div>
              <Stat
                title={"Location with highest prevalence"}
                year={topDropdownValueTract.Year}
                value={topDropdownValueTract.Tract}
                qualifier={formatPercentage(topDropdownValueTract[dropdownValue])}
              />
            </div>
          }

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          { isHealthConditionWeightedValueSelected
            ? <p>In {topDropdownWeightedData["End Year"]}, {topDropdownWeightedData["Zip Region"]} had the highest prevalence of {dropdownValue.toLowerCase()} ({formatPercentage(topDropdownWeightedData[dropdownValue])}) out of all zip regions in Wayne County.</p>
            : <p>In {topDropdownValueTract.Year}, {topDropdownValueTract.Tract} had the highest prevalence of {dropdownValue.toLowerCase()} ({formatPercentage(topDropdownValueTract[dropdownValue])}) out of all the tracts in Wayne County.</p>
          }
          { isHealthConditionWeightedValueSelected
            ? <p>The map here shows the {dropdownValue.toLowerCase()} for zip regions in Wayne County.</p>
            : <p>The map here shows the {dropdownValue.toLowerCase()} for tracts in Wayne County.</p>
          }
        </article>

        {/* Geomap to show health condition data for selected dropdown value. */}
        {isHealthConditionWeightedValueSelected
          ? <Geomap config={{
            data: `/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=all`,
            groupBy: "ID Zip Region",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d["Zip Region"],
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/zipregions.json",
            topojsonId: d => d.properties.REGION,
            topojsonFilter: () => true
          }}
          dataFormat={resp => resp.data}
          />
          : <Geomap config={{
            data: `/api/data?measures=${dropdownValue}&drilldowns=Tract&Year=all`,
            groupBy: "ID Tract",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.Tract,
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/tract.json",
            topojsonFilter: d => d.id.startsWith("14000US26163")
          }}
          dataFormat={resp => resp.data}
          />
        }
      </SectionColumns>
    );
  }
}

ConditionsAndChronicDiseases.defaultProps = {
  slug: "conditons-and-chronic-diseases"
};

ConditionsAndChronicDiseases.need = [
  fetchData("healthConditionData", "/api/data?measures=Arthritis&drilldowns=Tract&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  healthConditionData: state.data.healthConditionData
});

export default connect(mapStateToProps)(ConditionsAndChronicDiseases);

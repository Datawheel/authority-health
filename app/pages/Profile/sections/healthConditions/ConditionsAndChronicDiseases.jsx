import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import styles from "style.yml";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import ZipRegionDefinition from "components/ZipRegionDefinition";
import CensusTractDefinition from "components/CensusTractDefinition";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

const formatDropdownChoiceName = d => d === "Physical Health" ? "Poor General Health Days" : d;

const getArticle = dropdownValue => {
  const firstLetter = dropdownValue[0];
  if (["A", "E", "I", "O", "U"].includes(firstLetter)) return "an";
  return "a";
};

class ConditionsAndChronicDiseases extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      dropdownValue: "Arthritis",
      healthConditionWeightedData: [],
      countyLevelData: [],
      healthConditionData: this.props.healthConditionData,
      sources: []
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
          axios.get(`/api/data?measures=${dropdownValue}&Geography=05000US26163&Year=latest`) // Get Wayne County data for comparison. Only available for MiBRFS cube and not 500 cities.
            .then(d => {
              this.setState({
                healthConditionWeightedData: resp.data.data,
                countyLevelData: d.data.data,
                dropdownValue
              });
            });
        });
    }
    else {
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Tract&Year=latest`)
        .then(resp => {
          this.setState({
            healthConditionData: resp.data.data,
            dropdownValue
          });
        });
    }
  }

  render() {
    const {tractToPlace} = this.props.topStats;

    // Include all the measures in the dropdown list.
    const {dropdownValue, healthConditionData, healthConditionWeightedData, countyLevelData} = this.state;
    const dropdownList = ["Arthritis", "COPD", "Chronic Kidney Disease", "Coronary Heart Disease", "Current Asthma", "High Blood Pressure", "High Cholesterol",
      "Mental Health", "Stroke", "Teeth Loss", "Cardiovascular Disease", "Ever Depressive",
      "Ever Heart Attack", "Heart Disease", "Poor Mental Health 14 Or More Days", "Physical Health", "Gen Health Fair Or Poor"];

    // Check if the selected dropdown values are from the healthConditionWeightedData.
    const isHealthConditionWeightedValueSelected = dropdownValue === "Cardiovascular Disease" ||
    dropdownValue === "Ever Depressive" ||
    dropdownValue === "Ever Heart Attack" ||
    dropdownValue === "Heart Disease" ||
    dropdownValue === "Poor Mental Health 14 Or More Days" ||
    dropdownValue === "Gen Health Fair Or Poor";

    // Get top stats for the most recent year data for the selected dropdown value.
    const topDropdownValueTract = healthConditionData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];
    const topTractPlace = tractToPlace[topDropdownValueTract["ID Tract"]];

    const topDropdownWeightedData = healthConditionWeightedData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Conditons & Chronic Diseases</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <label className="pt-label pt-inline" htmlFor="health-conditions-dropdown">
            Show data for
            <select id="health-conditions-dropdown" onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{formatDropdownChoiceName(item)}</option>)}
            </select>
          </label>

          {/* Show top stats for the dropdown selected. */}
          { isHealthConditionWeightedValueSelected
            ? <Stat
              title={"Location with highest prevalence"}
              year={topDropdownWeightedData["End Year"]}
              value={topDropdownWeightedData["Zip Region"]}
              qualifier={`${formatPercentage(topDropdownWeightedData[dropdownValue], true)} of the population in this zip region`}
            />
            : <Stat
              title={"Location with highest prevalence"}
              year={topDropdownValueTract.Year}
              value={`${topDropdownValueTract.Tract}${ topTractPlace ? `, ${topTractPlace}` : "" }`}
              qualifier={`${formatPercentage(topDropdownValueTract[dropdownValue])} of the population in this tract`}
            />
          }

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          { isHealthConditionWeightedValueSelected
            ? <p>In {topDropdownWeightedData["End Year"]}, {formatPercentage(topDropdownWeightedData[dropdownValue], true)} of the population of the {topDropdownWeightedData["Zip Region"]} <ZipRegionDefinition text="zip region" /> had {getArticle(dropdownValue)} {dropdownValue.toLowerCase()} diagnosis, the highest prevelence of all zip regions in Wayne County, as compared to {formatPercentage(countyLevelData[0][dropdownValue], true)} overall in Wayne County.</p>
            : <p>In {topDropdownValueTract.Year}, {formatPercentage(topDropdownValueTract[dropdownValue])} of the population of <CensusTractDefinition text={topDropdownValueTract.Tract} />{topTractPlace !== undefined ? `, ${topTractPlace}` : ""} had {getArticle(dropdownValue)} {dropdownValue === "COPD" ? "COPD" : formatDropdownChoiceName(dropdownValue).toLowerCase()} diagnosis, the highest prevalence out of all tracts in Detroit, Livonia, Dearborn and Westland.</p>
          }
          { isHealthConditionWeightedValueSelected
            ? <p>The map here shows the percentage of adults who have ever been diagnosed with {dropdownValue.toLowerCase()} within each zip region in Wayne County.</p>
            : <p>The map here shows the percentage of adults who have ever been diagnosed with {dropdownValue === "COPD" ? "COPD" : formatDropdownChoiceName(dropdownValue).toLowerCase()} within each census tract in Detroit, Livonia, Dearborn and Westland.</p>
          }

          {isHealthConditionWeightedValueSelected
            ? <Disclaimer>Data is shown at the zip region level</Disclaimer>
            : <Disclaimer>Data is shown at the census tract level</Disclaimer>
          }
          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        {/* Geomap to show health condition data for selected dropdown value. */}
        {isHealthConditionWeightedValueSelected
          ? <Geomap config={{
            data: `/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=all`,
            groupBy: "ID Zip Region",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d, true)},
              // having high disease prevalency is bad
              color: [
                styles["danger-light"],
                styles.danger,
                styles["danger-dark"]
              ]
            },
            label: d => d["Zip Region"],
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue], true)}`]]},
            topojson: "/topojson/zipregions.json",
            topojsonId: d => d.properties.REGION,
            topojsonFilter: () => true
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return resp.data;
          }}
          />
          : <Geomap config={{
            data: `/api/data?measures=${dropdownValue}&drilldowns=Tract&Year=all`,
            groupBy: "ID Tract",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)},
              // having high disease prevalency is bad
              color: [
                styles["danger-light"],
                styles.danger,
                styles["danger-dark"]
              ]
            },
            label: d => `${d.Tract}, ${tractToPlace[d["ID Tract"]]}`,
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/tract.json",
            topojsonId: d => d.id,
            topojsonFilter: d => d.id.startsWith("14000US26163")
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return resp.data;
          }}
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
  topStats: state.data.topStats,
  healthConditionData: state.data.healthConditionData
});

export default connect(mapStateToProps)(ConditionsAndChronicDiseases);

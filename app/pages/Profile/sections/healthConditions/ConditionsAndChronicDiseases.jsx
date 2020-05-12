import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";
import {color} from "d3-color";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import styles from "style.yml";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import ZipRegionDefinition from "components/ZipRegionDefinition";
import CensusTractDefinition from "components/CensusTractDefinition";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

const formatDropdownChoiceName = d => {
  if (d === "Ever Heart Attack") return "Heart Attack";
  if (d === "Teeth Loss") return "Loss of Teeth";
  if (d === "Ever Depressive") return "Depression";
  if (d === "Mental Health") return "Mental Health (Census Tract)";
  if (d === "Poor Mental Health 14 Or More Days") return "Mental Health (Zip Region)";
  if (d === "Gen Health Fair Or Poor") return "General Health (Zip Region)";
  if (d === "Physical Health") return "General Health (Census Tract)";
  if (d === "Current Asthma") return "Adults With Asthma";
  return d;
};

const getArticle = dropdownValue => {
  const firstLetter = dropdownValue[0];
  if (["A", "E", "I", "O", "U"].includes(firstLetter)) return "an";
  return "a";
};

const formatDropdownParagraphText = d => {
  if (d === "Physical Health" || d === "Gen Health Fair Or Poor") return "fair or poor general health";
  if (d === "Mental Health" || d === "Poor Mental Health 14 Or More Days") return "poor mental health";
  if (d === "Ever Heart Attack") return "heart attack";
  if (d === "Ever Depressive") return "depression";
  if (d === "Teeth Loss") return "loss of teeth";
  return d.toLowerCase().replace("adults with ", "").replace("copd", "COPD");
};

class ConditionsAndChronicDiseases extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      dropdownValue: "Adults With Arthritis",
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
    const {meta} = this.props;

    // Include all the measures in the dropdown list.
    const {dropdownValue, healthConditionData, healthConditionWeightedData, countyLevelData} = this.state;
    const dropdownList = [
      "Adults With Arthritis", "Adults With COPD", "Adults With Chronic Kidney Disease",
      "Adults With Coronary Heart Disease", "Current Asthma", "High Blood Pressure", "High Cholesterol",
      "Stroke", "Teeth Loss", "Cardiovascular Disease", "Ever Depressive", "Ever Heart Attack", "Heart Disease",
      "Mental Health", "Poor Mental Health 14 Or More Days", "Physical Health", "Gen Health Fair Or Poor"];

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

    const missingProfile = meta.level === "tract" && !isHealthConditionWeightedValueSelected
      ? !healthConditionData.find(d => d["ID Tract"] === meta.id)
      : false;

    return (
      <SectionColumns>
        <SectionTitle>Conditions and Chronic Diseases</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <label className="pt-label pt-inline" htmlFor="health-conditions-dropdown">
            Show data for
            <select id="health-conditions-dropdown" onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{formatDropdownChoiceName(item)}</option>)}
            </select>
          </label>

          {isHealthConditionWeightedValueSelected
            ? <Disclaimer>Data is only available at the zip region level.</Disclaimer>
            : <Disclaimer>Data is only available at the census tract level for a subset of cities in Wayne County (Detroit, Dearborn, Livonia, and Westland).{missingProfile ? ` ${meta.name} (highlighted in green) is not included within those cities.` : ""}</Disclaimer>
          }
          {/* Show top stats for the dropdown selected. */}
          { isHealthConditionWeightedValueSelected
            ? <Stat
              title={"Location with highest prevalence"}
              year={topDropdownWeightedData["End Year"]}
              value={<ZipRegionDefinition text={topDropdownWeightedData["Zip Region"]} />}
              qualifier={`${formatPercentage(topDropdownWeightedData[dropdownValue], true)} of the population in this zip region`}
            />
            : <Stat
              title={"Location with highest prevalence"}
              year={topDropdownValueTract.Year}
              value={<p><CensusTractDefinition text={topDropdownValueTract.Tract} />{ topTractPlace ? `, ${topTractPlace}` : "" }</p>}
              qualifier={`${formatPercentage(topDropdownValueTract[dropdownValue])} of the population in this tract`}
            />
          }

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          { isHealthConditionWeightedValueSelected
            ? <p>In {topDropdownWeightedData["End Year"]}, {formatPercentage(topDropdownWeightedData[dropdownValue], true)} of the population of the {topDropdownWeightedData["Zip Region"]} <ZipRegionDefinition text="zip region" /> reported {getArticle(formatDropdownParagraphText(dropdownValue))} diagnosis of {formatDropdownParagraphText(dropdownValue)}, the highest prevelence of all zip regions in Wayne County, as compared to {formatPercentage(countyLevelData[0][dropdownValue], true)} overall in Wayne County.</p>
            : <p>In {topDropdownValueTract.Year}, {formatPercentage(topDropdownValueTract[dropdownValue])} of the population of <CensusTractDefinition text={topDropdownValueTract.Tract} />{topTractPlace !== undefined ? `, ${topTractPlace}` : ""} reported {getArticle(formatDropdownParagraphText(dropdownValue))} diagnosis of {formatDropdownParagraphText(dropdownValue)}, the highest prevalence out of all tracts in Detroit, Livonia, Dearborn and Westland.</p>
          }
          {["Mental Health", "Poor Mental Health 14 Or More Days"].includes(dropdownValue) && <p>Poor mental health is defined as reporting mental health as not good concerning stress, depression, or problems with emotions for 14 or more out of the past 30 days.</p>}
          {["Physical Health", "Gen Health Fair Or Poor"].includes(dropdownValue) && <p>Fair or poor general health is the proportion of adults who reported that their health, in general, was either fair or poor.</p>}
          { isHealthConditionWeightedValueSelected
            ? <p>The map here shows the percentage of adults who have ever been diagnosed with {formatDropdownParagraphText(dropdownValue)} within each zip region in Wayne County.</p>
            : <p>The map here shows the percentage of adults who have {dropdownValue === "Poor Mental Health 14 Or More Days" ? "reported" : dropdownValue === "Current Asthma" ? "reported they currently have asthma" : "ever been diagnosed with" } {dropdownValue !== "Current Asthma" ? formatDropdownParagraphText(dropdownValue) : ""} within each census tract in Detroit, Livonia, Dearborn and Westland.</p>
          }

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=${dropdownValue}&drilldowns=${ isHealthConditionWeightedValueSelected ? "Zip Region" : "Tract" }&Year=all` }
            title="Map of Conditons & Chronic Diseases" />
          {/* Geomap to show health condition data for selected dropdown value. */}
          {isHealthConditionWeightedValueSelected
            ? <Geomap ref={comp => this.viz = comp } config={{
              data: `/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=all`,
              groupBy: "ID Zip Region",
              colorScale: dropdownValue,
              colorScaleConfig: {
                axisConfig: {tickFormat: d => formatPercentage(d, true)},
                // having high disease prevalency is bad
                color: [
                  styles["terra-cotta-white"],
                  styles["danger-light"],
                  styles["terra-cotta-medium"],
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
            : <Geomap ref={comp => this.viz = comp } config={{
              data: `/api/data?measures=${dropdownValue}&drilldowns=Tract&Year=all`,
              groupBy: "ID Tract",
              colorScale: dropdownValue,
              colorScaleConfig: {
                axisConfig: {tickFormat: d => formatPercentage(d)},
                // having high disease prevalency is bad
                color: [
                  styles["terra-cotta-white"],
                  styles["danger-light"],
                  styles["terra-cotta-medium"],
                  styles["danger-dark"]
                ]
              },
              label: d => `${d.Tract}, ${tractToPlace[d["ID Tract"]]}`,
              height: 400,
              shapeConfig: {
                Path: {
                  stroke(d, i) {
                    if (meta.level === "tract" && (d["ID Tract"] === meta.id || d.id === meta.id)) return styles["shamrock-dark"];
                    else if (d.type === "Feature") return "transparent";
                    const c = typeof this._shapeConfig.Path.fill === "function" ? this._shapeConfig.Path.fill(d, i) : this._shapeConfig.Path.fill;
                    return color(c).darker(0.6);
                  },
                  strokeWidth: d => meta.level === "tract" && (d["ID Tract"] === meta.id || d.id === meta.id) ? 2 : 1
                }
              },
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
            topojsonFormat={resp => {
              if (meta.level === "tract") {
                resp.objects.tracts.geometries.sort((a, b) => a.id === meta.id ? 1 : b.id === meta.id ? -1 : 0);
              }
              return resp;
            }}
            />
          }
        </div>
      </SectionColumns>
    );
  }
}

ConditionsAndChronicDiseases.defaultProps = {
  slug: "conditions-and-chronic-diseases"
};

ConditionsAndChronicDiseases.need = [
  fetchData("healthConditionData", "/api/data?measures=Adults With Arthritis&drilldowns=Tract&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  healthConditionData: state.data.healthConditionData
});

export default connect(mapStateToProps)(ConditionsAndChronicDiseases);

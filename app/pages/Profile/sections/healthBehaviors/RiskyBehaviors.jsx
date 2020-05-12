import React from "react";
import {connect} from "react-redux";
import {Geomap, Pie} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";
import {color} from "d3-color";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import styles from "style.yml";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import Glossary from "components/Glossary";
import ZipRegionDefinition from "components/ZipRegionDefinition";
import CensusTractDefinition from "components/CensusTractDefinition";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const definitions = [
  {term: "Current Smoking", definition: "Current smoking is defined as someone who has smoked greater than 100 cigarettes (including hand rolled cigarettes, cigars, cigarillos etc) in their lifetime and has smoked in the last 28 days."},
  {term: "Adults Who Binge Drink", definition: "Binge drinking is defined as the consumption of five or more alcoholic drinks on one occasion in the past month."},
  {term: "Secondhand Smoke Exposure", definition: "Secondhand smoke is a mixture of the smoke that comes from the burning end of a cigarette, cigar, or pipe, and the smoke breathed out by the smoker. It contains more than 7,000 chemicals. Hundreds of those chemicals are toxic and about 70 can cause cancer."},
  {term: "Any Alcohol Consumption", definition: "Any alcohol consumption is defined as some form of alcohol consumption within the past month."}
];

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

const formatMonthlyAlcohol = d => d === "Monthly Alcohol Consumption" ? d.replace("Monthly", "Any") : d;

class RiskyBehaviors extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      dropdownValue: "Current Smoking",
      secondHandSmokeAndMonthlyAlcohol: [],
      countyLevelData: [],
      allTractSmokingDrinkingData: this.props.allTractSmokingDrinkingData,
      sources: []
    };
  }

  // Handler function for dropdown onChange.
  handleChange = event => {
    const dropdownValue = event.target.value;
    if (dropdownValue === "Secondhand Smoke Exposure" || dropdownValue === "Monthly Alcohol Consumption") {
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=latest`)
        .then(resp => {
          axios.get(`/api/data?measures=${dropdownValue}&Geography=05000US26163&Year=latest`) // Get Wayne County data for comparison. Only available for MiBRFS cube and not 500 cities.
            .then(d => {
              this.setState({
                secondHandSmokeAndMonthlyAlcohol: resp.data.data,
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
            allTractSmokingDrinkingData: resp.data.data,
            dropdownValue
          });
        });
    }
  }

  render() {
    const {id} = this.props.meta;
    const {dropdownValue, secondHandSmokeAndMonthlyAlcohol, allTractSmokingDrinkingData, countyLevelData} = this.state;

    const drugTypes = ["Current Smoking", "Adults Who Binge Drink", "Secondhand Smoke Exposure", "Monthly Alcohol Consumption"];

    const isSecondHandSmokeOrMonthlyAlcoholSelected = dropdownValue === "Secondhand Smoke Exposure" || dropdownValue === "Monthly Alcohol Consumption";
    const topSecondHandSmokeAndMonthlyAlcoholData = secondHandSmokeAndMonthlyAlcohol.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    const topTractSmokingDrinkingData = allTractSmokingDrinkingData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];
    let topTractPlace;
    const {tractToPlace} = this.props.topStats;
    if (!isSecondHandSmokeOrMonthlyAlcoholSelected) {
      topTractPlace = tractToPlace[topTractSmokingDrinkingData["ID Tract"]];
    }

    const {meta} = this.props;

    const missingProfile = meta.level === "tract" && !isSecondHandSmokeOrMonthlyAlcoholSelected
      ? !allTractSmokingDrinkingData.find(d => d["ID Tract"] === meta.id)
      : false;

    return (
      <SectionColumns>
        <SectionTitle>Risky Behaviors</SectionTitle>
        <article>
          {/* Create a dropdown for drug types. */}
          <label className="pt-label pt-inline" htmlFor="risky-behaviors-dropdown">
            Show data for
            <select id="risky-behaviors-dropdown" onChange={this.handleChange}>
              {drugTypes.map(item => <option key={item} value={item}>{formatMonthlyAlcohol(item)}</option>)}
            </select>
          </label>

          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <Disclaimer>Data is only available at the zip region level.</Disclaimer>
            : <Disclaimer>Data is only available at the census tract level for a subset of cities in Wayne County (Detroit, Dearborn, Livonia, and Westland).{missingProfile ? ` ${meta.name} (highlighted in green) is not included within those cities.` : ""}</Disclaimer>
          }
          <Stat
            title={isSecondHandSmokeOrMonthlyAlcoholSelected ? "Zip region with highest prevalence" : "Tract with highest prevalence"}
            value={isSecondHandSmokeOrMonthlyAlcoholSelected ?  <ZipRegionDefinition text={topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"]} /> : <p><CensusTractDefinition text={topTractSmokingDrinkingData.Tract} />{ topTractPlace ? `, ${topTractPlace}` : "" }</p>}
            year={isSecondHandSmokeOrMonthlyAlcoholSelected ? topSecondHandSmokeAndMonthlyAlcoholData["End Year"] : topTractSmokingDrinkingData.Year}
            qualifier={isSecondHandSmokeOrMonthlyAlcoholSelected ? `${formatPercentage(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue], true)} of the population of this zip region` : `${formatPercentage(topTractSmokingDrinkingData[dropdownValue])} of the population of this census tract`}
          />
          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <p>In {topSecondHandSmokeAndMonthlyAlcoholData["End Year"]}, {topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"]} <ZipRegionDefinition text="zip region" /> had the highest prevalence of {formatMonthlyAlcohol(dropdownValue).toLowerCase()} ({formatPercentage(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue], true)} of the population), as compared to {formatPercentage(countyLevelData[0][dropdownValue], true)} overall for Wayne County.</p>
            : <p>In {topTractSmokingDrinkingData.Year}, <CensusTractDefinition text={topTractSmokingDrinkingData.Tract} />{topTractPlace !== undefined ? `, ${topTractPlace}` : ""} had the highest prevalence of {dropdownValue.toLowerCase()} out of census tracts in Detroit, Livonia, Dearborn and Westland ({formatPercentage(topTractSmokingDrinkingData[dropdownValue])} of the population).</p>
          }

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />

          <div className="viz">
            {dropdownValue === drugTypes[0] &&
          <Options
            component={this}
            componentKey="viz1"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Smoking Status Current,Smoking Status Former,Smoking Status Never&drilldowns=End Year&Geography=${id}` }
            title="Chart of Drinking Status" />
            }
            {/* Draw a Pie chart to show smoking status: former, current & never. */}
            {/* TODO: distribution bar */}
            {dropdownValue === drugTypes[0] &&
              <Pie ref={comp => this.viz1 = comp} config={{
                data: `/api/data?measures=Smoking Status Current,Smoking Status Former,Smoking Status Never&drilldowns=End Year&Geography=${id}`, // MiBRFS - All Years
                height: 250,
                value: d => d[d.SmokingType],
                legend: false,
                groupBy: "SmokingType",
                label: d => {
                  const wordsArr = d.SmokingType.split(" ");
                  return `${wordsArr[2]}`;
                },
                time: "End Year",
                title: d => `Smoking Status in ${d[0].Geography}`,
                shapeConfig: {
                  Path: {
                    fillOpacity: 1
                  }
                },
                tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Prevalence", d => formatPercentage(d[d.SmokingType], true)], ["County", d => d.Geography]]}
              }}
              dataFormat={resp => {
                const data = [];
                resp.data.forEach(d => {
                  resp.source[0].measures.forEach(smokingType => {
                    if (d[smokingType] !== null) {
                      data.push(Object.assign({}, d, {SmokingType: smokingType}));
                    }
                  });
                });
                this.setState({sources: updateSource(resp.source, this.state.sources)});
                return data;
              }}
              />
            }
          </div>
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=${dropdownValue}&drilldowns=${ isSecondHandSmokeOrMonthlyAlcoholSelected ? "Zip Region" : "Tract" }&Year=all` }
            title="Map of Risky Behaviors" />
          {/* Create a Geomap based on the dropdown choice. */}
          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <Geomap ref={comp => this.viz = comp } config={{
              data: `/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=all`,
              groupBy: "ID Zip Region",
              colorScale: dropdownValue,
              colorScaleConfig: {
                axisConfig: {tickFormat: d => formatPercentage(d, true)},
                // smoking is bad
                color: [
                  styles["terra-cotta-white"],
                  styles["danger-light"],
                  styles["terra-cotta-medium"],
                  styles["danger-dark"]
                ]
              },
              label: d => d["Zip Region"],
              time: "End Year",
              title: `${formatMonthlyAlcohol(dropdownValue)} for Zip Regions in Wayne County`,
              tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Behavior", `${formatMonthlyAlcohol(dropdownValue)}`], ["Prevalence", d => formatPercentage(d[dropdownValue], true)]]},
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
                // smoking is bad
                color: [
                  styles["terra-cotta-white"],
                  styles["danger-light"],
                  styles["terra-cotta-medium"],
                  styles["danger-dark"]
                ]
              },
              label: d => `${d.Tract}, ${tractToPlace[d["ID Tract"]]}`,
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
              title: `${dropdownValue} for Census Tracts within Detroit, Livonia, Dearborn and Westland`,
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Behavior", `${dropdownValue}`], ["Prevalence", d => formatPercentage(d[dropdownValue])]]},
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

RiskyBehaviors.defaultProps = {
  slug: "risky-behaviors"
};

RiskyBehaviors.need = [
  fetchData("allTractSmokingDrinkingData", "/api/data?measures=Current Smoking&drilldowns=Tract&Year=latest", d => d.data) // 500 Cities
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  allTractSmokingDrinkingData: state.data.allTractSmokingDrinkingData
});

export default connect(mapStateToProps)(RiskyBehaviors);

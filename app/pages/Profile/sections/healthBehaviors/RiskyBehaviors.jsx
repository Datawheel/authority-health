import React from "react";
import {connect} from "react-redux";
import {Geomap, Pie} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import ZipRegionDefinition from "components/ZipRegionDefinition";
import CensusTractDefinition from "components/CensusTractDefinition";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

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

    const drugTypes = ["Current Smoking", "Binge Drinking", "Secondhand Smoke Exposure", "Monthly Alcohol Consumption"];

    const isSecondHandSmokeOrMonthlyAlcoholSelected = dropdownValue === "Secondhand Smoke Exposure" || dropdownValue === "Monthly Alcohol Consumption";
    const topSecondHandSmokeAndMonthlyAlcoholData = secondHandSmokeAndMonthlyAlcohol.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    const topTractSmokingDrinkingData = allTractSmokingDrinkingData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];
    let topTractPlace;
    const {tractToPlace} = this.props.topStats;
    if (!isSecondHandSmokeOrMonthlyAlcoholSelected) {
      topTractPlace = tractToPlace[topTractSmokingDrinkingData["ID Tract"]];
    }

    return (
      <SectionColumns>
        <SectionTitle>Risky Behaviors</SectionTitle>
        <article>
          {/* Create a dropdown for drug types. */}
          <label className="pt-label pt-inline" htmlFor="risky-behaviors-dropdown">
            Show data for
            <div className="pt-select">
              <select id="risky-behaviors-dropdown" onChange={this.handleChange}>
                {drugTypes.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </label>

          <Stat
            title={isSecondHandSmokeOrMonthlyAlcoholSelected ? "Zip region with highest prevalence" : "Tract with highest prevalence"}
            value={isSecondHandSmokeOrMonthlyAlcoholSelected ? topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"] : `${topTractSmokingDrinkingData.Tract}, ${topTractPlace}`}
            year={isSecondHandSmokeOrMonthlyAlcoholSelected ? topSecondHandSmokeAndMonthlyAlcoholData["End Year"] : topTractSmokingDrinkingData.Year}
            qualifier={isSecondHandSmokeOrMonthlyAlcoholSelected ? `${formatPercentage(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue], true)} of the population of this zip region` : `${formatPercentage(topTractSmokingDrinkingData[dropdownValue])} of the population of this census tract`}
          />
          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <p>In {topSecondHandSmokeAndMonthlyAlcoholData["End Year"]}, {formatPercentage(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue], true)} of the population of the {topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"]} <ZipRegionDefinition text="zip region" /> had the highest prevalence of {dropdownValue.toLowerCase()}, as compared to {formatPercentage(countyLevelData[0][dropdownValue], true)} overall for Wayne County.</p>
            : <p>In {topTractSmokingDrinkingData.Year}, {formatPercentage(topTractSmokingDrinkingData[dropdownValue])} of the population of <CensusTractDefinition text={topTractSmokingDrinkingData.Tract} />{topTractPlace !== undefined ? `, ${topTractPlace}` : ""} had the highest prevalence of {dropdownValue.toLowerCase()} out of census tracts in Detroit, Livonia, Dearborn and Westland.</p>
          }

          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <Disclaimer>data is shown at the zip region level</Disclaimer>
            : <Disclaimer>data is shown at the census tract level</Disclaimer>
          }
          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />

          {/* Draw a Pie chart to show smoking status: former, current & never. */}
          {/* TODO: distribution bar */}
          {dropdownValue === drugTypes[0]
            ? <div>
              <Pie config={{
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
            </div> : null }
        </article>

        {/* Create a Geomap based on the dropdown choice. */}
        {isSecondHandSmokeOrMonthlyAlcoholSelected
          ? <Geomap config={{
            data: `/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=all`,
            groupBy: "ID Zip Region",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d, true)}
            },
            label: d => d["Zip Region"],
            time: "End Year",
            title: `${dropdownValue} for Zip Regions in Wayne County`,
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Behavior", `${dropdownValue}`], ["Prevalence", d => formatPercentage(d[dropdownValue], true)]]},
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
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => `${d.Tract}, ${tractToPlace[d["ID Tract"]]}`,
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
          />
        }
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

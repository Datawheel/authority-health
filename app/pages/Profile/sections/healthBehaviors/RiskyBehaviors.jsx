import React from "react";
import {connect} from "react-redux";
import {Geomap, Pie} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import ZipRegionDefinition from "components/ZipRegionDefinition";
import CensusTractDefinition from "components/CensusTractDefinition";

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

class RiskyBehaviors extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      dropdownValue: "Current Smoking",
      secondHandSmokeAndMonthlyAlcohol: [],
      countyLevelData: [],
      allTractSmokingDrinkingData: this.props.allTractSmokingDrinkingData
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
            value={isSecondHandSmokeOrMonthlyAlcoholSelected ? topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"] : topTractSmokingDrinkingData.Tract}
            year={isSecondHandSmokeOrMonthlyAlcoholSelected ? topSecondHandSmokeAndMonthlyAlcoholData["End Year"] : topTractSmokingDrinkingData.Year}
            qualifier={isSecondHandSmokeOrMonthlyAlcoholSelected ? `${formatPercentage(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue], true)} of the population of this zip region` : `${formatPercentage(topTractSmokingDrinkingData[dropdownValue])} of the population of this census tract`}
          />
          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <div>
              <p>In {topSecondHandSmokeAndMonthlyAlcoholData["End Year"]}, {formatPercentage(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue], true)} of the population of <ZipRegionDefinition text="zip region" /> {topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"]} had the highest prevalence of {dropdownValue.toLowerCase()}, as compared to {formatPercentage(countyLevelData[0][dropdownValue], true)} in Wayne County.</p>
              <p>The map here shows the {dropdownValue.toLowerCase()} for zip regions in Wayne County.</p>
            </div>
            : <div>
              <p>In {topTractSmokingDrinkingData.Year}, {formatPercentage(topTractSmokingDrinkingData[dropdownValue])} of the population of <CensusTractDefinition text={topTractSmokingDrinkingData.Tract} /> had the highest prevalence of {dropdownValue.toLowerCase()} out of census tracts in Detroit, Livonia, Dearborn and Westland.</p>
              <p>The map here shows the {dropdownValue.toLowerCase()} prevalence for tracts in Detroit, Livonia, Dearborn and Westland and the barchart shows the former, current and never smoking status in Wayne County.</p>
            </div>
          }

          {dropdownValue === drugTypes[0] ? <p>The pie chart here shows the percentage of former, current and never smoking status of the population in Wayne County.</p> : ""}

          {/* Draw a Treemap to show smoking status: former, current & never. */}
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
                title: "Smoking Status",
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
                return data;
              }}
              />
            </div> : null }
          <Contact slug={this.props.slug} />
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
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Behavior", `${dropdownValue}`], ["Prevalence", d => formatPercentage(d[dropdownValue], true)]]},
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Behavior", `${dropdownValue}`], ["Prevalence", d => formatPercentage(d[dropdownValue])]]},
            topojson: "/topojson/tract.json",
            topojsonId: d => d.id,
            topojsonFilter: d => d.id.startsWith("14000US26163")
          }}
          dataFormat={resp => resp.data}
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
  allTractSmokingDrinkingData: state.data.allTractSmokingDrinkingData
});

export default connect(mapStateToProps)(RiskyBehaviors);

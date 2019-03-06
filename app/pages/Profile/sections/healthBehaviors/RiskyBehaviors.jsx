import React from "react";
import {connect} from "react-redux";
import {Geomap, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

class RiskyBehaviors extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      dropdownValue: "Current Smoking",
      secondHandSmokeAndMonthlyAlcohol: [],
      allTractSmokingDrinkingData: this.props.allTractSmokingDrinkingData
    };
  }

  // Handler function for dropdown onChange.
  handleChange = event => {
    const dropdownValue = event.target.value;
    if (dropdownValue === "Secondhand Smoke Exposure" || dropdownValue === "Monthly Alcohol Consumption") { 
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=latest`)
        .then(resp => {
          this.setState({
            secondHandSmokeAndMonthlyAlcohol: resp.data.data,
            dropdownValue
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
    const {dropdownValue, secondHandSmokeAndMonthlyAlcohol, allTractSmokingDrinkingData} = this.state;

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
            value={isSecondHandSmokeOrMonthlyAlcoholSelected ? topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"] : topTractSmokingDrinkingData.Year}
            year={isSecondHandSmokeOrMonthlyAlcoholSelected ? topSecondHandSmokeAndMonthlyAlcoholData["End Year"] : topTractSmokingDrinkingData.Tract}
            qualifier={isSecondHandSmokeOrMonthlyAlcoholSelected ? formatPercentage(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue], true) : formatPercentage(topTractSmokingDrinkingData[dropdownValue])}
          />
          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <div>
              <p>In {topSecondHandSmokeAndMonthlyAlcoholData["End Year"]}, {topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"]} had the highest prevalence of {dropdownValue.toLowerCase()} ({formatPercentage(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue], true)}).</p>
              <p>The map here shows the {dropdownValue.toLowerCase()} for zip regions in Wayne County.</p>
            </div>
            : <div>
              <p>In {topTractSmokingDrinkingData.Year}, {topTractSmokingDrinkingData.Tract} had the highest prevalence of {dropdownValue.toLowerCase()} ({formatPercentage(topTractSmokingDrinkingData[dropdownValue])}) out of all Tracts in Wayne County.</p>
              <p>The map here shows the {dropdownValue.toLowerCase()} for all tracts in Wayne County.</p>
            </div>
          }

          {/* Draw a Treemap to show smoking status: former, current & never. */}
          {dropdownValue === drugTypes[0]
            ? <div>
              <p>The chart here shows the former, current and never smoking status in Wayne County.</p>
              <Treemap config={{
                data: `/api/data?measures=Smoking Status Current,Smoking Status Former,Smoking Status Never&drilldowns=End Year&Geography=${id}`, // MiBRFS - All Years
                height: 250,
                sum: d => d[d.SmokingType],
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

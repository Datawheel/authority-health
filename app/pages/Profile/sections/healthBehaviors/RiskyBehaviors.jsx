import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {Geomap, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatName = name => {
  const nameArr = name.split(" ");
  return `${nameArr[0]} ${nameArr[1]} ${nameArr[2]}`;
};
const formatPercentage = d => `${formatAbbreviate(d)}%`;

class RiskyBehaviors extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Current Smoking Data Value"};
  }

  // Handler function for dropdown onChange.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {
    const {dropdownValue} = this.state;

    const {allTractSmokingDrinkingData, secondHandSmokeAndMonthlyAlcohol} = this.props;

    // Include all the measures from allTractSmokingDrinkingData and secondHandSmokeAndMonthlyAlcohol in the dropdown list.
    const drugTypes = allTractSmokingDrinkingData.source[0].measures.slice();
    secondHandSmokeAndMonthlyAlcohol.source[0].measures.forEach(d => {
      drugTypes.push(d);
    });

    const isSecondHandSmokeOrMonthlyAlcoholSelected = dropdownValue === "Secondhand Smoke Exposure Yes Weighted Percent" || dropdownValue === "Monthly Alcohol Consumption Some Weighted Percent";

    // Find recent year top data for the selceted dropdown value.
    const recentYearSecondHandSmokeAndMonthlyAlcoholData = {};
    nest()
      .key(d => d["End Year"])
      .entries(secondHandSmokeAndMonthlyAlcohol.data)
      .forEach(group => {
        group.key >= secondHandSmokeAndMonthlyAlcohol.data[0]["End Year"] ? Object.assign(recentYearSecondHandSmokeAndMonthlyAlcoholData, group) : {};
      });
    const topSecondHandSmokeAndMonthlyAlcoholData = recentYearSecondHandSmokeAndMonthlyAlcoholData.values[0];

    const allTractSmokingData = allTractSmokingDrinkingData.data.slice(0);
    allTractSmokingData.sort((a, b) => b[dropdownValue] - a[dropdownValue]);
    const topTractSmokingData = allTractSmokingData[0];

    const allTractDrinkingData = allTractSmokingDrinkingData.data.slice(0);
    allTractDrinkingData.sort((a, b) => b[dropdownValue] - a[dropdownValue]);
    const topTractDrinkingData = allTractDrinkingData[0];

    let topTractNum = topTractSmokingData.Tract;
    let year = topTractSmokingData.Year;
    let topTractRate = topTractSmokingData[dropdownValue];

    if (dropdownValue === drugTypes[0]) { // Assign all Smoking data here.
      topTractNum = topTractSmokingData.Tract;
      year = topTractSmokingData.Year;
      topTractRate = topTractSmokingData[dropdownValue];
    }
    else { // Assign all Drinking data here.
      topTractNum = topTractDrinkingData.Tract;
      year = topTractDrinkingData.Year;
      topTractRate = topTractDrinkingData[dropdownValue];
    }

    return (
      <SectionColumns>
        <SectionTitle>Risky Behaviors</SectionTitle>
        <article>
          {/* Create a dropdown for drug types. */}
          <div className="field-container">
            <label>
              <div className="pt-select pt-fill">
                <select onChange={this.handleChange}>
                  {drugTypes.map(item => <option key={item} value={item}>{formatName(item)}</option>)}
                </select>
              </div>
            </label>
          </div>

          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <Stat
              title={"County with highest prevalence"}
              value={topSecondHandSmokeAndMonthlyAlcoholData.County}
              year={topSecondHandSmokeAndMonthlyAlcoholData["End Year"]}
              qualifier={formatPercentage(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue])}
            />
            : <Stat
              title={"Tract with highest prevalence"}
              year={year}
              value={topTractNum}
              qualifier={formatPercentage(topTractRate)}
            />
          }
          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <div>
              <p>In {topSecondHandSmokeAndMonthlyAlcoholData["End Year"]}, {topSecondHandSmokeAndMonthlyAlcoholData.County} had the highest prevalence of {formatName(dropdownValue.toLowerCase())} ({formatAbbreviate(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue])}%).</p>
              <p>The map here shows the {formatName(dropdownValue.toLowerCase())} for Wayne county.</p>
            </div>
            : <div>
              <p>In {year}, {topTractNum} had the highest prevalence of {formatName(dropdownValue.toLowerCase())} ({topTractRate}%) out of all Tracts in Wayne county.</p>
              <p>The map here shows the {formatName(dropdownValue.toLowerCase())} for all tracts in Wayne county.</p>
            </div>
          }

          {/* Draw a Treemap to show smoking status: former, current & never. */}
          {dropdownValue === drugTypes[0]
            ? <div>
              <p>The chart here shows the former, current and never smoking status in Wayne county.</p>
              <Treemap config={{
                data: "/api/data?measures=Smoking Status Current Weighted Percent,Smoking Status Former Weighted Percent,Smoking Status Never Weighted Percent&drilldowns=End Year",
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
                tooltipConfig: {tbody: [["Prevalence", d => formatPercentage(d[d.SmokingType] * 100)]]}
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
        </article>

        {/* Create a Geomap based on the dropdown choice. */}
        {isSecondHandSmokeOrMonthlyAlcoholSelected
          ? <Geomap config={{
            data: secondHandSmokeAndMonthlyAlcohol.data,
            groupBy: "ID County",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.County,
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Risky Behavior: ", `${formatName(dropdownValue)}`], ["Prevalence", d => formatPercentage(d[dropdownValue])]]},
            topojson: "/topojson/county.json",
            topojsonFilter: d => d.id.startsWith("05000US26")
          }}
          />
          : <Geomap config={{
            data: `/api/data?measures=${dropdownValue.replace(/\s/g, " ")}&drilldowns=Tract&Year=latest`,
            groupBy: "ID Tract",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.Tract,
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Risky Behavior: ", `${formatName(dropdownValue)}`], ["Prevalence", d => formatPercentage(d[dropdownValue])]]},
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

RiskyBehaviors.defaultProps = {
  slug: "risky-behaviors"
};

RiskyBehaviors.need = [
  fetchData("allTractSmokingDrinkingData", "/api/data?measures=Current Smoking Data Value,Binge Drinking Data Value&drilldowns=Tract&Year=latest"),
  fetchData("secondHandSmokeAndMonthlyAlcohol", "/api/data?measures=Secondhand Smoke Exposure Yes Weighted Percent,Monthly Alcohol Consumption Some Weighted Percent&drilldowns=End Year,County")
];

const mapStateToProps = state => ({
  allTractSmokingDrinkingData: state.data.allTractSmokingDrinkingData,
  secondHandSmokeAndMonthlyAlcohol: state.data.secondHandSmokeAndMonthlyAlcohol
});

export default connect(mapStateToProps)(RiskyBehaviors);

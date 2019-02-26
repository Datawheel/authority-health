import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {Geomap, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class RiskyBehaviors extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Current Smoking"};
  }

  // Handler function for dropdown onChange.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {
    const {dropdownValue} = this.state;
    const {id} = this.props.meta;

    const {allTractSmokingDrinkingData, secondHandSmokeAndMonthlyAlcohol} = this.props;

    // Include all the measures from allTractSmokingDrinkingData and secondHandSmokeAndMonthlyAlcohol in the dropdown list.
    const drugTypes = allTractSmokingDrinkingData.source[0].measures.slice();
    secondHandSmokeAndMonthlyAlcohol.source[0].measures.forEach(d => {
      drugTypes.push(d);
    });

    const isSecondHandSmokeOrMonthlyAlcoholSelected = dropdownValue === "Secondhand Smoke Exposure" || dropdownValue === "Monthly Alcohol Consumption";

    // Find recent year top data for the selceted dropdown value.
    const recentYearSecondHandSmokeAndMonthlyAlcoholData = {};
    nest()
      .key(d => d["End Year"])
      .entries(secondHandSmokeAndMonthlyAlcohol.data)
      .forEach(group => {
        group.key >= secondHandSmokeAndMonthlyAlcohol.data[0]["End Year"] ? Object.assign(recentYearSecondHandSmokeAndMonthlyAlcoholData, group) : {};
      });
    const topSecondHandSmokeAndMonthlyAlcoholData = recentYearSecondHandSmokeAndMonthlyAlcoholData.values.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    const allTractSmokingData = allTractSmokingDrinkingData.data.slice(0);
    const topTractSmokingData = allTractSmokingData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    const allTractDrinkingData = allTractSmokingDrinkingData.data.slice(0);
    const topTractDrinkingData = allTractDrinkingData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

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
                  {drugTypes.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </label>
          </div>

          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <Stat
              title={"Zip region with highest prevalence"}
              value={topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"]}
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
              <p>In {topSecondHandSmokeAndMonthlyAlcoholData["End Year"]}, {topSecondHandSmokeAndMonthlyAlcoholData["Zip Region"]} had the highest prevalence of {dropdownValue.toLowerCase()} ({formatAbbreviate(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue])}%).</p>
              <p>The map here shows the {dropdownValue.toLowerCase()} for zip regions in Wayne County.</p>
            </div>
            : <div>
              <p>In {year}, {topTractNum} had the highest prevalence of {dropdownValue.toLowerCase()} ({topTractRate}%) out of all Tracts in Wayne County.</p>
              <p>The map here shows the {dropdownValue.toLowerCase()} for all tracts in Wayne County.</p>
            </div>
          }

          {/* Draw a Treemap to show smoking status: former, current & never. */}
          {dropdownValue === drugTypes[0]
            ? <div>
              <p>The chart here shows the former, current and never smoking status in Wayne County.</p>
              <Treemap config={{
                data: `/api/data?measures=Smoking Status Current,Smoking Status Former,Smoking Status Never&drilldowns=End Year&Geography=${id}`,
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
                tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Prevalence", d => formatPercentage(d[d.SmokingType] * 100)], ["County", d => d.Geography]]}
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
            data: secondHandSmokeAndMonthlyAlcohol.data,
            groupBy: "ID Zip Region",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d["Zip Region"],
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Behavior", `${dropdownValue}`], ["Prevalence", d => formatPercentage(d[dropdownValue])]]},
            topojson: "/topojson/zipregions.json",
            topojsonId: d => d.properties.REGION,
            topojsonFilter: () => true
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Behavior", `${dropdownValue}`], ["Prevalence", d => formatPercentage(d[dropdownValue])]]},
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
  fetchData("allTractSmokingDrinkingData", "/api/data?measures=Current Smoking,Binge Drinking&drilldowns=Tract&Year=all"),
  fetchData("secondHandSmokeAndMonthlyAlcohol", "/api/data?measures=Secondhand Smoke Exposure,Monthly Alcohol Consumption&drilldowns=Zip Region&Year=all")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  allTractSmokingDrinkingData: state.data.allTractSmokingDrinkingData,
  secondHandSmokeAndMonthlyAlcohol: state.data.secondHandSmokeAndMonthlyAlcohol
});

export default connect(mapStateToProps)(RiskyBehaviors);

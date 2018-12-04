import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatName = name => {
  const nameArr = name.split(" ");
  return `${nameArr[0]} ${nameArr[1]} ${nameArr[2]}`;
};
const formatPercentage = d => `${formatAbbreviate(d)}%`;

class DrugUse extends SectionColumns {

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
    let year = topTractSmokingData["ID Year"];
    let topTractRate = topTractSmokingData[dropdownValue];

    if (dropdownValue === drugTypes[0]) { // Assign all Smoking data here.
      topTractNum = topTractSmokingData.Tract;
      year = topTractSmokingData["ID Year"];
      topTractRate = topTractSmokingData[dropdownValue];
    }
    else { // Assign all Drinking data here.
      topTractNum = topTractDrinkingData.Tract;
      year = topTractDrinkingData["ID Year"];
      topTractRate = topTractDrinkingData[dropdownValue];
    }

    return (
      <SectionColumns>
        <SectionTitle>Drug Use</SectionTitle>
        <article>
          {/* Create a dropdown for drug types. */}
          <div className="field-container">
            <label>
              Drug use category
              <select onChange={this.handleChange}>
                {drugTypes.map(item => <option key={item} value={item}>{formatName(item)}</option>)}
              </select>
            </label>
          </div>

          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <Stat
              title={"County with highest prevalence"}
              value={topSecondHandSmokeAndMonthlyAlcoholData.County}
              qualifier={`${formatAbbreviate(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue])}%`}
            />
            : <Stat
              title={"Tract with highest prevalence"}
              value={topTractNum}
              qualifier={`${formatAbbreviate(topTractRate)}%`}
            />
          }
          {isSecondHandSmokeOrMonthlyAlcoholSelected
            ? <p>{topSecondHandSmokeAndMonthlyAlcoholData.County} had the highest {formatName(dropdownValue.toLowerCase())} rate of {formatAbbreviate(topSecondHandSmokeAndMonthlyAlcoholData[dropdownValue])}% in the year {year}.</p>
            : <p>{topTractNum} had the highest {formatName(dropdownValue.toLowerCase())} rate of {topTractRate}% in the year {year}.</p>
          }

          {/* Draw a mini bar chart to show smoking status: former, current & never. */}
          {dropdownValue === drugTypes[0]
            ? <BarChart config={{
              data: "/api/data?measures=Smoking%20Status%20Current%20Weighted%20Percent,Smoking%20Status%20Former%20Weighted%20Percent,Smoking%20Status%20Never%20Weighted%20Percent&drilldowns=End%20Year",
              discrete: "y",
              height: 250,
              groupBy: "SmokingType",
              label: d => {
                const wordsArr = d.SmokingType.split(" ");
                return `${wordsArr[0]} ${wordsArr[1]}: ${wordsArr[2]}`;
              },
              legend: false,
              y: "SmokingType",
              x: d => d[d.SmokingType],
              time: "ID End Year",
              xConfig: {
                labelRotation: false,
                tickFormat: d => formatPercentage(d)
              },
              yConfig: {ticks: []},
              shapeConfig: {label: false},
              tooltipConfig: {tbody: [["Value", d => formatPercentage(d[d.SmokingType])]]}
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
            /> : null }
        </article>

        {/* Create a Geomap based on the dropdown choice. */}
        {isSecondHandSmokeOrMonthlyAlcoholSelected
          ? <Geomap config={{
            data: secondHandSmokeAndMonthlyAlcohol.data,
            groupBy: "ID County",
            colorScale: dropdownValue,
            label: d => d.County,
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Value", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/county.json",
            topojsonFilter: d => d.id.startsWith("05000US26")
          }}
          />
          : <Geomap config={{
            data: `/api/data?measures=${dropdownValue.replace(/\s/g, "%20")}&drilldowns=Tract&Year=latest`,
            groupBy: "ID Tract",
            colorScale: dropdownValue,
            label: d => d.Tract,
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d[dropdownValue])]]},
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

DrugUse.defaultProps = {
  slug: "drug-use"
};

DrugUse.need = [
  fetchData("allTractSmokingDrinkingData", "/api/data?measures=Current%20Smoking%20Data%20Value,Binge%20Drinking%20Data%20Value&drilldowns=Tract&Year=latest"),
  fetchData("secondHandSmokeAndMonthlyAlcohol", "/api/data?measures=Secondhand%20Smoke%20Exposure%20Yes%20Weighted%20Percent,Monthly%20Alcohol%20Consumption%20Some%20Weighted%20Percent&drilldowns=End%20Year,County")
];

const mapStateToProps = state => ({
  allTractSmokingDrinkingData: state.data.allTractSmokingDrinkingData,
  secondHandSmokeAndMonthlyAlcohol: state.data.secondHandSmokeAndMonthlyAlcohol
});

export default connect(mapStateToProps)(DrugUse);

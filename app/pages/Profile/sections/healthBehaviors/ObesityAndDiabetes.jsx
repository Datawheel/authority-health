import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class ObesityAndDiabetes extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Obesity Data Value"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {obesityAndDibetesDataValue, obesityPrevalenceBySex, diabetesPrevalenceBySex, BMIWeightedData} = this.props;

    // Include all the measures from obesityAndDibetesDataValue and BMIWeightedData in the dropdown list.
    const {dropdownValue} = this.state;
    const dropdownList = obesityAndDibetesDataValue.source[0].measures.slice();
    BMIWeightedData.source[0].measures.forEach(d => {
      dropdownList.push(d);
    });

    // Check if the selected dropdown value is from the BMIWeightedData.
    const isBMIWeightedDataValueSelected = dropdownValue === "BMI Healthy Weight Weighted Percent" ||
    dropdownValue === "BMI Obese Weighted Percent" ||
    dropdownValue === "BMI Overweight Weighted Percent" ||
    dropdownValue === "BMI Underweight Weighted Percent";

    // Check if the selected dropdown value is Diabetes to change the mini BarChart accordingly.
    const isDiabetesSelected = dropdownValue === "Diabetes Data Value";

    // Find recent year top data for the selceted dropdown value.
    const recentYearWeightedData = {};
    nest()
      .key(d => d["End Year"])
      .entries(BMIWeightedData.data)
      .forEach(group => {
        group.key >= BMIWeightedData.data[0]["End Year"] ? Object.assign(recentYearWeightedData, group) : {};
      });
    const topDropdownWeightedData = recentYearWeightedData.values[0];

    const topDropdownValueTract = obesityAndDibetesDataValue.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    // Find recent year top data for diabetesPrevalenceBySex.
    const recentYearDiabetesPrevalenceBySexData = {};
    nest()
      .key(d => d["End Year"])
      .entries(diabetesPrevalenceBySex)
      .forEach(group => {
        group.key >= diabetesPrevalenceBySex[0].Year ? Object.assign(recentYearDiabetesPrevalenceBySexData, group) : {};
      });
    const topDiabetesMaleData = recentYearDiabetesPrevalenceBySexData.values.filter(d => d.Sex === "Male")[0];
    const topDiabetesFemaleData = recentYearDiabetesPrevalenceBySexData.values.filter(d => d.Sex === "Female")[0];

    // Find recent year top data for diabetesPrevalenceBySex.
    const recentYearObesityPrevalenceBySexData = {};
    nest()
      .key(d => d["End Year"])
      .entries(obesityPrevalenceBySex)
      .forEach(group => {
        group.key >= obesityPrevalenceBySex[0].Year ? Object.assign(recentYearObesityPrevalenceBySexData, group) : {};
      });
    const topObesityMaleData = recentYearObesityPrevalenceBySexData.values.filter(d => d.Sex === "Male")[0];
    const topObesityFemaleData = recentYearObesityPrevalenceBySexData.values.filter(d => d.Sex === "Female")[0];

    const topMaleData = isDiabetesSelected ? topDiabetesMaleData : topObesityMaleData;
    const topFemaleData = isDiabetesSelected ? topDiabetesFemaleData : topObesityFemaleData;
    const healthCondition = isDiabetesSelected ? "Diabetes" : "Obesity";

    return (
      <SectionColumns>
        <SectionTitle>Obesity and Diabetes</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <select onChange={this.handleChange}>
            {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
          </select>

          {/* Show top stats for the dropdown selected. */}
          {isBMIWeightedDataValueSelected
            ? <Stat
              title={`Majority ${dropdownValue} in ${topDropdownWeightedData.Year}`}
              value={`${topDropdownWeightedData.County} ${formatPercentage(topDropdownWeightedData[dropdownValue])}`}
            />
            : <Stat
              title={`Majority ${dropdownValue} in ${topDropdownValueTract.Year}`}
              value={`${topDropdownValueTract.Tract} ${formatPercentage(topDropdownValueTract[dropdownValue])}`}
            />
          }

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          {isBMIWeightedDataValueSelected 
            ? <p>The Geomap here shows {dropdownValue} for Counties in Michigan.</p>
            : <p>The Geomap here shows {dropdownValue} for Tracts in the Wayne county, MI.</p>
          }
          {isBMIWeightedDataValueSelected 
            ? <p>In {topDropdownValueTract.Year}, top {dropdownValue} was {formatPercentage(topDropdownWeightedData[dropdownValue])} in the {topDropdownWeightedData.County}, MI.</p>
            : <p>In {topDropdownValueTract.Year}, top {dropdownValue} was {formatPercentage(topDropdownValueTract[dropdownValue])} in {topDropdownValueTract.Tract}.</p>
          }
          
          {/* Draw a BarChart to show data for Obesity Rate by Sex. */}
          <BarChart config={{
            data: isDiabetesSelected ? diabetesPrevalenceBySex : obesityPrevalenceBySex,
            discrete: "y",
            height: 250,
            legend: false,
            groupBy: "Sex",
            label: d => d.Sex,
            x: "Adj Percent",
            y: "Sex",
            time: "ID Year",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              title: isDiabetesSelected ? "Diabetes Rate" : "Obesity Rate"
            },
            yConfig: {
              ticks: []
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d["Adj Percent"])]]}
          }}
          />

          {/* Show top stats for the Male and Female Diabetes/Obesity data. */}
          <Stat
            title={`Majority Male with ${healthCondition} in ${topMaleData.Year}`}
            value={`${topMaleData.County} ${formatPercentage(topMaleData["Adj Percent"])}`}
          />
          <Stat
            title={`Majority Female with ${healthCondition} in ${topFemaleData.Year}`}
            value={`${topFemaleData.County} ${formatPercentage(topFemaleData["Adj Percent"])}`}
          />

          {/* Write short paragraphs explaining Barchart and top stats for the Diabetes/Obesity data. */}
          <p>The Barchart here shows the {healthCondition} data for male and female in the {topFemaleData.County}.</p>
          <p>In {topMaleData.Year}, top {healthCondition} rate for Male and Female were {formatPercentage(topMaleData["Adj Percent"])} and {formatPercentage(topFemaleData["Adj Percent"])} respectively in the {topMaleData.County}, MI.</p>
          
        </article>

        {/* Geomap to show Obesity and Diabetes data based on the dropdown value. */}
        {isBMIWeightedDataValueSelected
          ? <Geomap config={{
            data: BMIWeightedData.data,
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
            data: obesityAndDibetesDataValue.data,
            groupBy: "ID Tract",
            colorScale: dropdownValue,
            label: d => d.Tract,
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Value", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/tract.json",
            topojsonFilter: d => d.id.startsWith("14000US26163")
          }}
          />
        }
      </SectionColumns>
    );
  }
}

ObesityAndDiabetes.defaultProps = {
  slug: "obesity-and-diabetes"
};

ObesityAndDiabetes.need = [
  fetchData("obesityAndDibetesDataValue", "/api/data?measures=Obesity%20Data%20Value,Diabetes%20Data%20Value&drilldowns=Tract&Year=all"),
  fetchData("BMIWeightedData", "/api/data?measures=BMI%20Healthy%20Weight%20Weighted%20Percent,BMI%20Obese%20Weighted%20Percent,BMI%20Overweight%20Weighted%20Percent,BMI%20Underweight%20Weighted%20Percent&drilldowns=End%20Year,County"),
  fetchData("obesityPrevalenceBySex", "/api/data?measures=Adj%20Percent&drilldowns=Sex&County=<id>&Year=all", d => d.data),
  fetchData("diabetesPrevalenceBySex", "/api/data?measures=Adj%20Percent&drilldowns=Sex&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  obesityAndDibetesDataValue: state.data.obesityAndDibetesDataValue,
  BMIWeightedData: state.data.BMIWeightedData,
  obesityPrevalenceBySex: state.data.obesityPrevalenceBySex,
  diabetesPrevalenceBySex: state.data.diabetesPrevalenceBySex
});

export default connect(mapStateToProps)(ObesityAndDiabetes);


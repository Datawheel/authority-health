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
    this.state = {dropdownValue: "Obesity"};
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
    const isBMIWeightedDataValueSelected = dropdownValue === "BMI Healthy Weight" ||
    dropdownValue === "BMI Obese" ||
    dropdownValue === "BMI Overweight" ||
    dropdownValue === "BMI Underweight";

    // Check if the selected dropdown value is Diabetes to change the mini BarChart accordingly.
    const isDiabetesSelected = dropdownValue === "Diabetes";

    const isHealthyWeightSelected = dropdownValue === "BMI Healthy Weight";

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
      .key(d => d.Year)
      .entries(diabetesPrevalenceBySex)
      .forEach(group => {
        group.key >= diabetesPrevalenceBySex[0].Year ? Object.assign(recentYearDiabetesPrevalenceBySexData, group) : {};
      });
    const topDiabetesMaleData = recentYearDiabetesPrevalenceBySexData.values.filter(d => d.Sex === "Male")[0];
    const topDiabetesFemaleData = recentYearDiabetesPrevalenceBySexData.values.filter(d => d.Sex === "Female")[0];

    // Find recent year top data for obesityPrevalenceBySex.
    const recentYearObesityPrevalenceBySexData = {};
    nest()
      .key(d => d.Year)
      .entries(obesityPrevalenceBySex)
      .forEach(group => {
        group.key >= obesityPrevalenceBySex[0].Year ? Object.assign(recentYearObesityPrevalenceBySexData, group) : {};
      });
    const topObesityMaleData = recentYearObesityPrevalenceBySexData.values.filter(d => d.Sex === "Male")[0];
    const topObesityFemaleData = recentYearObesityPrevalenceBySexData.values.filter(d => d.Sex === "Female")[0];

    const topMaleData = isDiabetesSelected ? topDiabetesMaleData : topObesityMaleData;
    const topFemaleData = isDiabetesSelected ? topDiabetesFemaleData : topObesityFemaleData;

    return (
      <SectionColumns>
        <SectionTitle>Obesity and Diabetes</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {/* Show top stats for the dropdown selected. */}
          {isBMIWeightedDataValueSelected
            ? <Stat
              title={isHealthyWeightSelected ? "Location with highest share" : "Location with highest prevalence"}
              year={topDropdownWeightedData["End Year"]}
              value={topDropdownWeightedData["Zip Region"]}
              qualifier={formatPercentage(topDropdownWeightedData[dropdownValue])}
            />
            : <Stat
              title={"Location with highest prevalence"}
              year={topDropdownValueTract.Year}
              value={topDropdownValueTract.Tract}
              qualifier={formatPercentage(topDropdownValueTract[dropdownValue])}
            />
          }

          {/* Show top stats for the Male and Female Diabetes/Obesity data. */}
          <Stat
            title={"Male prevalence"}
            year={topMaleData.Year}
            value={isDiabetesSelected ? formatPercentage(topMaleData["Age-Adjusted Obesity Prevalence"]) : formatPercentage(topMaleData["Age-Adjusted Obesity Prevalence"])}
          />
          <Stat
            title={"Female prevalence"}
            year={topFemaleData.Year}
            value={isDiabetesSelected ? formatPercentage(topFemaleData["Age-Adjusted Obesity Prevalence"]) : formatPercentage(topFemaleData["Age-Adjusted Obesity Prevalence"])}
          />

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          {isBMIWeightedDataValueSelected
            ? <p>In {topDropdownWeightedData["End Year"]}, {topDropdownWeightedData["Zip Region"]} had the highest prevalence of {dropdownValue.toLowerCase()} ({formatPercentage(topDropdownWeightedData[dropdownValue])}) out of all zip regions in Wayne County.</p>
            : <p>In {topDropdownValueTract.Year}, {topDropdownValueTract.Tract} had the highest prevalence of {dropdownValue.toLowerCase()} ({formatPercentage(topDropdownValueTract[dropdownValue])}) out of all the tracts in Wayne County.</p>
          }

          {/* Write short paragraphs explaining Barchart and top stats for the Diabetes/Obesity data. */}
          <p>In {topMaleData.Year}, rates for male and female residents of {topMaleData.Geography} were {isDiabetesSelected ? formatPercentage(topMaleData["Age-Adjusted Obesity Prevalence"]) : formatPercentage(topMaleData["Age-Adjusted Obesity Prevalence"])} and {isDiabetesSelected ? formatPercentage(topFemaleData["Age-Adjusted Obesity Prevalence"]) : formatPercentage(topFemaleData["Age-Adjusted Obesity Prevalence"])} respectively. { }
          The chart here shows male and female prevalence in {topMaleData.Geography}.</p>

          {isBMIWeightedDataValueSelected
            ? <p>The map here shows the {dropdownValue.toLowerCase()} for all zip regions in Wayne County.</p>
            : <p>The map here shows the {dropdownValue.toLowerCase()} for all tracts in Wayne County.</p>
          }

          {/* Draw a BarChart to show data for Obesity Rate by Sex. */}
          <BarChart config={{
            data: isDiabetesSelected ? diabetesPrevalenceBySex : obesityPrevalenceBySex,
            discrete: "y",
            height: 250,
            legend: false,
            groupBy: "Sex",
            label: d => d.Sex,
            x: isDiabetesSelected ? "Age-Adjusted Obesity Prevalence" : "Age-Adjusted Obesity Prevalence",
            y: "Sex",
            time: "ID Year",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              title: isDiabetesSelected ? "Diabetes Rate" : "Obesity Rate"
            },
            yConfig: {
              ticks: []
            },
            tooltipConfig: isDiabetesSelected ? {tbody: [["Year", d => d.Year], ["Condition", "Diabetes"], ["Share", d => formatPercentage(d["Age-Adjusted Obesity Prevalence"])], ["County", d => d.Geography]]} 
              : {tbody: [["Year", d => d.Year], ["Condition", "Obesity"], ["Prevalence", d => formatPercentage(d["Age-Adjusted Obesity Prevalence"])], ["County", d => d.Geography]]}
          }}
          />
        </article>

        {/* Geomap to show Obesity and Diabetes data based on the dropdown value. */}
        {isBMIWeightedDataValueSelected
          ? <Geomap config={{
            data: BMIWeightedData.data,
            groupBy: "ID Zip Region",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d["Zip Region"],
            height: 400,
            time: "End Year",
            tooltipConfig: isHealthyWeightSelected ? {tbody: [["Year", d => d.Year], ["Condition", `${dropdownValue}`], ["Share", d => `${formatPercentage(d[dropdownValue])}`]]} : {tbody: [["Year", d => d.Year], ["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/zipregions.json",
            topojsonId: d => d.properties.REGION,
            topojsonFilter: () => true
          }}
          />
          : <Geomap config={{
            data: obesityAndDibetesDataValue.data,
            groupBy: "ID Tract",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.Tract,
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue])}`]]},
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
  fetchData("obesityAndDibetesDataValue", "/api/data?measures=Obesity,Diabetes&drilldowns=Tract&Year=all"),
  fetchData("BMIWeightedData", "/api/data?measures=BMI Healthy Weight,BMI Obese,BMI Overweight,BMI Underweight&drilldowns=End Year,Zip Region"),
  fetchData("obesityPrevalenceBySex", "/api/data?measures=Age-Adjusted Obesity Prevalence&drilldowns=Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("diabetesPrevalenceBySex", "/api/data?measures=Age-Adjusted Obesity Prevalence&drilldowns=Sex&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  obesityAndDibetesDataValue: state.data.obesityAndDibetesDataValue,
  BMIWeightedData: state.data.BMIWeightedData,
  obesityPrevalenceBySex: state.data.obesityPrevalenceBySex,
  diabetesPrevalenceBySex: state.data.diabetesPrevalenceBySex
});

export default connect(mapStateToProps)(ObesityAndDiabetes);


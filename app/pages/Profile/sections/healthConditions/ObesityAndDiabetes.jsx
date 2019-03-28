import React from "react";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import ZipRegionDefinition from "components/ZipRegionDefinition";
import CensusTractDefinition from "components/CensusTractDefinition";

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

const formatDropdownName = d => {
  if (d === "Obesity") return `${d} by Census Tract`;
  else if (d === "BMI Obese") return `${d} by Zip Region`;
  return d;
};

class ObesityAndDiabetes extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta,
      dropdownValue: "Diabetes",
      BMIWeightedData: [],
      obesityPrevalenceBySex: [],
      stateLevelObesityPrevalenceBySex: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    const geoId = this.state.meta.id;
    if (dropdownValue === "BMI Healthy Weight" ||
    dropdownValue === "BMI Obese" ||
    dropdownValue === "BMI Overweight" ||
    dropdownValue === "Obesity") {
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=latest`) // MiBRFS - All Years
        .then(resp => {
          axios.get(`/api/data?measures=Age-Adjusted Obesity Prevalence&drilldowns=Sex&Geography=${geoId}&Year=latest`) // CDC Wonder - Obesity Prevalence by Sex
            .then(d => {
              axios.get("/api/data?measures=Age-Adjusted Obesity Prevalence&drilldowns=Sex&State=04000US26&Year=latest") // CDC Wonder - Obesity Prevalence by Sex
                .then(stateData => {
                  this.setState({
                    stateLevelObesityPrevalenceBySex: stateData.data.data,
                    obesityPrevalenceBySex: d.data.data,
                    BMIWeightedData: resp.data.data,
                    dropdownValue
                  });
                });
            });
        });
    }
    else if (dropdownValue === "BMI Underweight") {
      axios.get("/api/data?measures=BMI Underweight&drilldowns=Zip Region&Year=all") // MiBRFS - All Years
        .then(resp => {
          const data = resp.data.data;
          const latestYear = data[0]["End Year"];
          // find top value
          const topRecentYearData = data.filter(d => d["End Year"] === latestYear).sort((a, b) => b["BMI Underweight"] - a["BMI Underweight"]);

          axios.get(`/api/data?measures=Age-Adjusted Obesity Prevalence&drilldowns=Sex&Geography=${geoId}&Year=latest`) // CDC Wonder - Obesity Prevalence by Sex
            .then(d => {
              axios.get("/api/data?measures=Age-Adjusted Obesity Prevalence&drilldowns=Sex&State=04000US26&Year=latest") // CDC Wonder - Obesity Prevalence by Sex (State data)
                .then(stateData => {
                  this.setState({
                    stateLevelObesityPrevalenceBySex: stateData.data.data,
                    obesityPrevalenceBySex: d.data.data,
                    BMIWeightedData: topRecentYearData,
                    dropdownValue
                  });
                });
            });
        });
    }
    else this.setState({dropdownValue});
  }

  render() {

    const {obesityAndDibetesDataValue, diabetesPrevalenceBySex, stateLevelDiabetesPrevalenceBySex} = this.props;

    // Include all the measures from obesityAndDibetesDataValue and BMIWeightedData in the dropdown list.
    const {meta, dropdownValue, obesityPrevalenceBySex, BMIWeightedData, stateLevelObesityPrevalenceBySex} = this.state;
    const dropdownList = ["Diabetes", "Obesity", "BMI Healthy Weight", "BMI Obese", "BMI Overweight", "BMI Underweight"];

    // Check if the selected dropdown value is from the BMIWeightedData.
    const isBMIWeightedDataValueSelected = dropdownValue === "BMI Healthy Weight" ||
    dropdownValue === "BMI Obese" ||
    dropdownValue === "BMI Overweight" ||
    dropdownValue === "BMI Underweight";

    // Check if the selected dropdown value is Diabetes to change the mini BarChart accordingly.
    const isDiabetesSelected = dropdownValue === "Diabetes";

    const isHealthyWeightSelected = dropdownValue === "BMI Healthy Weight";

    // Find recent year top data for the selceted dropdown value.
    const topDropdownWeightedData = BMIWeightedData[0];

    const topDropdownValueTract = obesityAndDibetesDataValue.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    // Find top stats data.
    let stateLevelFemaleDiabetes, stateLevelFemaleObesity, stateLevelMaleDiabetes, stateLevelMaleObesity, topDiabetesFemaleData, topDiabetesMaleData, topObesityFemaleData, topObesityMaleData;
    if (isDiabetesSelected) {
      topDiabetesMaleData = diabetesPrevalenceBySex.filter(d => d.Sex === "Male")[0];
      topDiabetesFemaleData = diabetesPrevalenceBySex.filter(d => d.Sex === "Female")[0];
      stateLevelMaleDiabetes = stateLevelDiabetesPrevalenceBySex.filter(d => d.Sex === "Male")[0];
      stateLevelFemaleDiabetes = stateLevelDiabetesPrevalenceBySex.filter(d => d.Sex === "Female")[0];
    }
    else {
      topObesityMaleData = obesityPrevalenceBySex.filter(d => d.Sex === "Male")[0];
      topObesityFemaleData = obesityPrevalenceBySex.filter(d => d.Sex === "Female")[0];
      stateLevelMaleObesity = stateLevelObesityPrevalenceBySex.filter(d => d.Sex === "Male")[0];
      stateLevelFemaleObesity = stateLevelObesityPrevalenceBySex.filter(d => d.Sex === "Female")[0];
    }

    const topMaleData = isDiabetesSelected ? topDiabetesMaleData : topObesityMaleData;
    const topFemaleData = isDiabetesSelected ? topDiabetesFemaleData : topObesityFemaleData;

    return (
      <SectionColumns>
        <SectionTitle>Obesity and Diabetes</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <label className="pt-label pt-inline" htmlFor="obesity-diabetes-dropdown">
            Show data for
            <div className="pt-select">
              <select id="obesity-diabetes-dropdown" onChange={this.handleChange}>
                {dropdownList.map(item => <option key={item} value={item}>{formatDropdownName(item)}</option>)}
              </select>
            </div>
          </label>

          {/* Show top stats for the dropdown selected. */}
          {isBMIWeightedDataValueSelected
            ? <Stat
              title={isHealthyWeightSelected ? "Location with highest share" : "Location with highest prevalence"}
              year={topDropdownWeightedData["End Year"]}
              value={topDropdownWeightedData["Zip Region"]}
              qualifier={`${formatPercentage(topDropdownWeightedData[dropdownValue], true)} of the population of this zip region`}
            />
            : <Stat
              title={"Location with highest prevalence"}
              year={topDropdownValueTract.Year}
              value={topDropdownValueTract.Tract}
              qualifier={`${formatPercentage(topDropdownValueTract[dropdownValue])} of the population of this census tract`}
            />
          }

          {/* Show top stats for the Male and Female Diabetes/Obesity data. */}
          <Stat
            title={"Male prevalence"}
            year={topMaleData.Year}
            value={isDiabetesSelected ? formatPercentage(topMaleData["Age-Adjusted Diabetes Prevalence"]) : formatPercentage(topMaleData["Age-Adjusted Obesity Prevalence"])}
            qualifier={`of the male population in ${topMaleData.Geography}`}
          />
          <Stat
            title={"Female prevalence"}
            year={topFemaleData.Year}
            value={isDiabetesSelected ? formatPercentage(topFemaleData["Age-Adjusted Diabetes Prevalence"]) : formatPercentage(topFemaleData["Age-Adjusted Obesity Prevalence"])}
            qualifier={`of the female population in ${topFemaleData.Geography}`}
          />

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          {isBMIWeightedDataValueSelected
            ? <p>In {topDropdownWeightedData["End Year"]}, {formatPercentage(topDropdownWeightedData[dropdownValue], true)} of the population of <ZipRegionDefinition text="zip region" /> {topDropdownWeightedData["Zip Region"]} had {dropdownValue.toLowerCase()}, the highest {isHealthyWeightSelected ? "share" : "prevalence"} out of all zip regions in Wayne County.</p>
            : <p>In {topDropdownValueTract.Year}, {formatPercentage(topDropdownValueTract[dropdownValue])} of the population of <CensusTractDefinition text={topDropdownValueTract.Tract} /> had {dropdownValue.toLowerCase()}, the highest prevalence out of all tracts in Detroit, Livonia, Dearborn and Westland.</p>
          }

          {/* Write short paragraphs explaining Barchart and top stats for the Diabetes/Obesity data. */}
          <p>In {topMaleData.Year}, {isDiabetesSelected ? formatPercentage(topMaleData["Age-Adjusted Diabetes Prevalence"]) : formatPercentage(topMaleData["Age-Adjusted Obesity Prevalence"])} of the male {}
          and {isDiabetesSelected ? formatPercentage(topFemaleData["Age-Adjusted Diabetes Prevalence"]) : formatPercentage(topFemaleData["Age-Adjusted Obesity Prevalence"])} of the female population in {}
            {topMaleData.Geography} {isDiabetesSelected ? "had diabetes" : "were obese"}, compared to {isDiabetesSelected ? formatPercentage(stateLevelMaleDiabetes["Age-Adjusted Diabetes Prevalence"]) : formatPercentage(stateLevelMaleObesity["Age-Adjusted Obesity Prevalence"])} of the male {}
            and {isDiabetesSelected ? formatPercentage(stateLevelFemaleDiabetes["Age-Adjusted Diabetes Prevalence"]) : formatPercentage(stateLevelFemaleObesity["Age-Adjusted Obesity Prevalence"])} of the female population in Michigan.</p>

          {/* Draw a BarChart to show data for Obesity Rate by Sex. */}
          <BarChart config={{
            data: isDiabetesSelected ? `/api/data?measures=Age-Adjusted Diabetes Prevalence&drilldowns=Sex&Geography=${meta.id}&Year=all` : `/api/data?measures=Age-Adjusted Obesity Prevalence&drilldowns=Sex&Geography=${meta.id}&Year=all`,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: "Sex",
            label: d => d.Sex,
            x: isDiabetesSelected ? "Age-Adjusted Diabetes Prevalence" : "Age-Adjusted Obesity Prevalence",
            y: "Sex",
            time: "ID Year",
            title: `${isDiabetesSelected ? "Diabetes" : "Obesity"} in Wayne County`,
            xConfig: {
              tickFormat: d => formatPercentage(d),
              title: isDiabetesSelected ? "Diabetes Rate" : "Obesity Rate"
            },
            yConfig: {
              barConfig: {
                stroke: "transparent"
              },
              ticks: []
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", isDiabetesSelected ? "Diabetes" : "Obesity"],
              ["Share", d => isDiabetesSelected ? formatPercentage(d["Age-Adjusted Diabetes Prevalence"]) : formatPercentage(d["Age-Adjusted Obesity Prevalence"])], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => resp.data}
          />
          <Contact slug={this.props.slug} />
        </article>

        {/* <div className="disclaimer">{isBMIWeightedDataValueSelected ? "data is shown at the zip region level" : "data is shown at the census tract level"}</div> */}
        {/* Geomap to show Obesity and Diabetes data based on the dropdown value. */}
        {isBMIWeightedDataValueSelected
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
            tooltipConfig: isHealthyWeightSelected ? {tbody: [["Year", d => d.Year],
              ["Condition", `${dropdownValue}`], ["Share", d => `${formatPercentage(d[dropdownValue], true)}`]]} : {tbody: [["Year", d => d.Year], ["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue], true)}`]]},
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
            time: "Year",
            title: `${dropdownValue} for Census Tracts within Detroit, Livonia, Dearborn and Westland`,
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", `${dropdownValue}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue])}`]]},
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

ObesityAndDiabetes.defaultProps = {
  slug: "obesity-and-diabetes"
};

ObesityAndDiabetes.need = [
  fetchData("obesityAndDibetesDataValue", "/api/data?measures=Obesity,Diabetes&drilldowns=Tract&Year=latest", d => d.data), // 500 Cities
  fetchData("diabetesPrevalenceBySex", "/api/data?measures=Age-Adjusted Diabetes Prevalence&drilldowns=Sex&Geography=<id>&Year=latest", d => d.data), // CDC Wonder - Diabetes Prevalence by Sex
  fetchData("stateLevelDiabetesPrevalenceBySex", "/api/data?measures=Age-Adjusted Diabetes Prevalence&drilldowns=Sex&State=04000US26&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  obesityAndDibetesDataValue: state.data.obesityAndDibetesDataValue,
  diabetesPrevalenceBySex: state.data.diabetesPrevalenceBySex,
  stateLevelDiabetesPrevalenceBySex: state.data.stateLevelDiabetesPrevalenceBySex
});

export default connect(mapStateToProps)(ObesityAndDiabetes);


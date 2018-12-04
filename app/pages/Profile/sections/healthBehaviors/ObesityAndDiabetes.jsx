import React from "react";
import {connect} from "react-redux";
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

    const {obesityAndDibetesDataValue, obesityPrevalenceBySex, BMIWeightedData} = this.props;
    console.log("BMIWeightedData: ", BMIWeightedData);

    const {dropdownValue} = this.state;
    const dropdownList = obesityAndDibetesDataValue.source[0].measures.slice();
    BMIWeightedData.source[0].measures.forEach(d => {
      dropdownList.push(d);
    });

    const topDropdownValueTract = obesityAndDibetesDataValue.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Obesity and Diabetes</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <select onChange={this.handleChange}>
            {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
          </select>

          <Stat
            title={`Majority ${dropdownValue} in ${topDropdownValueTract.Year}`}
            value={`${topDropdownValueTract.Tract} ${formatPercentage(topDropdownValueTract[dropdownValue])}`}
          />

          <p>The Geomap here shows {dropdownValue} for Tracts in the Wayne county, MI.</p>
          <p>In {topDropdownValueTract.Year}, top {dropdownValue} was {formatPercentage(topDropdownValueTract[dropdownValue])} in {topDropdownValueTract.Tract}.</p>
          
          {/* Draw a BarChart to show data for Obesity Rate by Sex. */}
          <BarChart config={{
            data: obesityPrevalenceBySex,
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
              title: "Obesity Rate"
            },
            yConfig: {
              ticks: []
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d["Adj Percent"])]]}
          }}
          />
        </article>

        {/* Geomap to show Obesity and Diabetes data based on the dropdown value for all tracts in the Wayne County. */}
        <Geomap config={{
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
      </SectionColumns>
    );
  }
}

ObesityAndDiabetes.defaultProps = {
  slug: "obesity-and-diabetes"
};

ObesityAndDiabetes.need = [
  fetchData("obesityAndDibetesDataValue", "/api/data?measures=Obesity%20Data%20Value,Diabetes%20Data%20Value&drilldowns=Tract&Year=all"),
  fetchData("obesityPrevalenceBySex", "/api/data?measures=Adj%20Percent&drilldowns=Sex&County=<id>&Year=all", d => d.data),
  fetchData("BMIWeightedData", "/api/data?measures=BMI%20Healthy%20Weight%20Weighted%20Percent,BMI%20Obese%20Weighted%20Percent,BMI%20Overweight%20Weighted%20Percent,BMI%20Underweight%20Weighted%20Percent&drilldowns=End%20Year,County")
];

const mapStateToProps = state => ({
  obesityAndDibetesDataValue: state.data.obesityAndDibetesDataValue,
  obesityPrevalenceBySex: state.data.obesityPrevalenceBySex,
  BMIWeightedData: state.data.BMIWeightedData
});

export default connect(mapStateToProps)(ObesityAndDiabetes);


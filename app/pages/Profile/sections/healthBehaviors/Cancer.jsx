import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Cancer extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Brain"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});
  
  render() {

    const {cancerOccuranceRate, cancerByGender, cancerByRaceAndEthnicity} = this.props;
    console.log("cancerOccuranceRate: ", cancerOccuranceRate);
    console.log("cancerByGender: ", cancerByGender);
    console.log("cancerByRaceAndEthnicity: ", cancerByRaceAndEthnicity);

    const recentYearCancerByGender = {};
    nest()
      .key(d => d.Year)
      .entries(cancerByGender)
      .forEach(group => {
        const total = sum(group.values, d => d.Count);
        group.values.forEach(d => d.share = d.Count / total * 100);
        group.key >= cancerByGender[0].Year ? Object.assign(recentYearCancerByGender, group) : {};
      });

    const recentYearCancerByRaceAndEthnicity = {};
    nest()
      .key(d => d.Year)
      .entries(cancerByRaceAndEthnicity)
      .forEach(group => {
        const total = sum(group.values, d => d.Count);
        group.values.forEach(d => d.share = d.Count / total * 100);
        group.key >= cancerByGender[0].Year ? Object.assign(recentYearCancerByRaceAndEthnicity, group) : {};
      });

    return (
      <SectionColumns>
        <SectionTitle>Cancer</SectionTitle>
        <article>

          {/* Draw a BarChart to show Cancer by Sex for selected cancer type. */}
          <BarChart config={{
            data: cancerByGender,
            discrete: "y",
            height: 250,
            legend: false,
            groupBy: ["Cancer Site", "Sex"],
            stacked: true,
            label: d => d.Sex === "M" ? "Male" : "Female",
            x: "share",
            y: "Cancer Site",
            time: "Year",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              labelRotation: false
            },
            yConfig: {
              tickFormat: d => d,
              labelRotation: false
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />
          
          {/* Draw a BarChart to show Cancer by Race and Ethnicity for selected cancer type. */}
          <BarChart config={{
            data: cancerByRaceAndEthnicity,
            discrete: "y",
            height: 250,
            legend: false,
            groupBy: ["Cancer Site", "Ethnicity", "Race"],
            stacked: true,
            label: d => `${d.Ethnicity} ${d.Race}`,
            x: "share",
            y: "Cancer Site",
            time: "Year",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              labelRotation: false
            },
            yConfig: {tickFormat: d => d},
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />
        </article>

        <LinePlot config={{
          data: cancerOccuranceRate,
          discrete: "x",
          height: 400,
          groupBy: "Cancer Site",
          legend: false,
          x: "Year",
          y: "Age-Adjusted Rate",
          xConfig: {
            title: "Year",
            labelRotation: false
          },
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Occurance"
          },
          confidence: [d => d["Age-Adjusted Rate Lower 95 Percent Confidence Interval"], d => d["Age-Adjusted Rate Upper 95 Percent Confidence Interval"]],
          confidenceConfig: {
            fillOpacity: 0.2
          },
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d["Age-Adjusted Rate"])]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Cancer.defaultProps = {
  slug: "cancer"
};

Cancer.need = [
  fetchData("cancerOccuranceRate", "/api/data?measures=Age-Adjusted%20Rate,Age-Adjusted%20Rate%20Lower%2095%20Percent%20Confidence%20Interval,Age-Adjusted%20Rate%20Upper%2095%20Percent%20Confidence%20Interval&drilldowns=MSA&Year=all&Cancer%20Site=Brain", d => d.data),
  fetchData("cancerByGender", "/api/data?measures=Count&drilldowns=MSA,Sex&Year=all&Cancer%20Site=Brain", d => d.data),
  fetchData("cancerByRaceAndEthnicity", "/api/data?measures=Count&drilldowns=MSA,Race,Ethnicity&Year=all&Cancer%20Site=Brain", d => d.data)
];

const mapStateToProps = state => ({
  cancerOccuranceRate: state.data.cancerOccuranceRate,
  cancerByGender: state.data.cancerByGender,
  cancerByRaceAndEthnicity: state.data.cancerByRaceAndEthnicity
});

export default connect(mapStateToProps)(Cancer);

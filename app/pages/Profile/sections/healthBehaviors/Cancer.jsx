import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Cancer extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "All Invasive Cancer Sites Combined"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});
  
  render() {

    const {cancerOccuranceRate, cancerByGender, cancerByRaceAndEthnicity, getSortedCancerTypes} = this.props;

    const {dropdownValue} = this.state;
    // const dropdownList = ["Acute Lymphocytic Leukemia", "Acute Myeloid Leukemia", "Aleukemic, Subleukemic and NOS", "All Invasive Cancer Sites Combined", "Anus, Anal Canal and Anorectum", "Appendix", "Ascending Colon", "Bones and Joints", "Brain", "Brain and Other Nervous System", "Cecum", "Cervix Uteri", "Chronic Lymphocytic Leukemia", "Chronic Myeloid Leukemia", "Colon and Rectum", "Colon excluding Rectum", "Corpus Uteri", "Descending Colon", "Digestive System", "Endocrine System", "Esophagus", "Eye and Orbit", "Female Breast", "Female Breast, In Situ", "Female Genital System", "Floor of Mouth", "Gallbladder", "Gum and Other Mouth", "Hepatic Flexure", "Hodgkin - Nodal", "Hodgkin Lymphoma", "Hypopharynx", "Intrahepatic Bile Duct", "Kaposi Sarcoma", "Kidney and Renal Pelvis", "Larynx", "Leukemias", "Lip", "Liver"];

    // Filter data based on the dropdown Value.
    const filteredOccuranceRateData = cancerOccuranceRate.filter(d => d["Cancer Site"] === dropdownValue);
    const filteredGenderData = cancerByGender.filter(d => d["Cancer Site"] === dropdownValue);
    const filteredRaceAndEthnicityData = cancerByRaceAndEthnicity.filter(d => d["Cancer Site"] === dropdownValue);

    console.log("filteredGenderData: ", filteredGenderData);
    const dropdownList = [];
    nest()
      .key(d => d["Cancer Site"])
      .entries(getSortedCancerTypes)
      .forEach(group => dropdownList.push(group.key));

    const recentYearCancerByGender = {};
    nest()
      .key(d => d.Year)
      .entries(filteredGenderData)
      .forEach(group => {
        const total = sum(group.values, d => d.Count);
        group.values.forEach(d => d.share = d.Count / total * 100);
        group.key >= filteredGenderData[0].Year ? Object.assign(recentYearCancerByGender, group) : {};
      });
    const topFemaleCancerData = recentYearCancerByGender.values[0];
    const topMaleCancerData = recentYearCancerByGender.values[1];

    const recentYearCancerByRaceAndEthnicity = {};
    nest()
      .key(d => d.Year)
      .entries(filteredRaceAndEthnicityData)
      .forEach(group => {
        const total = sum(group.values, d => d.Count);
        group.values.forEach(d => d.share = d.Count / total * 100);
        group.key >= filteredRaceAndEthnicityData[0].Year ? Object.assign(recentYearCancerByRaceAndEthnicity, group) : {};
      });
    recentYearCancerByRaceAndEthnicity.values.sort((a, b) => b.share - a.share);
    const topCancerByRaceAndEthnicity = recentYearCancerByRaceAndEthnicity.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Cancer</SectionTitle>
        <article>
          {/* Create a dropdown for sheltered and unsheltered choices. */}
          <select onChange={this.handleChange}>
            {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <Stat
            title={`Top Female ${dropdownValue} in ${topFemaleCancerData.Year}`}
            value={`${formatPercentage(topFemaleCancerData.share)}`}
          />
          <Stat
            title={`Top Male ${dropdownValue} in ${topMaleCancerData.Year}`}
            value={`${formatPercentage(topMaleCancerData.share)}`}
          />
          <Stat
            title={`Top Race & Ethnicity Cancer in ${topCancerByRaceAndEthnicity.Year}`}
            value={`${topCancerByRaceAndEthnicity.Ethnicity} ${topCancerByRaceAndEthnicity.Race} ${formatPercentage(topCancerByRaceAndEthnicity.share)}`}
          />

          {/* Draw a BarChart to show Cancer by Sex for selected cancer type. */}
          <BarChart config={{
            data: filteredGenderData,
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
              tickFormat: d => d
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />
          
          {/* Draw a BarChart to show Cancer by Race and Ethnicity for selected cancer type. */}
          <BarChart config={{
            data: filteredRaceAndEthnicityData,
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
          data: filteredOccuranceRateData,
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
  fetchData("cancerOccuranceRate", "/api/data?measures=Age-Adjusted%20Rate,Age-Adjusted%20Rate%20Lower%2095%20Percent%20Confidence%20Interval,Age-Adjusted%20Rate%20Upper%2095%20Percent%20Confidence%20Interval&drilldowns=Cancer%20Site&Year=all", d => d.data),
  fetchData("cancerByGender", "/api/data?measures=Count&drilldowns=Cancer%20Site,Sex&Year=all", d => d.data),
  fetchData("cancerByRaceAndEthnicity", "/api/data?measures=Count&drilldowns=Cancer%20Site,Race,Ethnicity&Year=all", d => d.data),
  fetchData("getSortedCancerTypes", "/api/data?measures=Count&drilldowns=Cancer%20Site&Year=all&order=Count&sort=desc", d => d.data)
];

const mapStateToProps = state => ({
  cancerOccuranceRate: state.data.cancerOccuranceRate,
  cancerByGender: state.data.cancerByGender,
  cancerByRaceAndEthnicity: state.data.cancerByRaceAndEthnicity,
  getSortedCancerTypes: state.data.getSortedCancerTypes
});

export default connect(mapStateToProps)(Cancer);

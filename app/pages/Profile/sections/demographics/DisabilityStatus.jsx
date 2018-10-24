import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class DisabilityStatus extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Disability Status"};
  }

// Handler function for dropdown onChange.
handleChange = event => this.setState({dropdownValue: event.target.value});

render() {
  const {dropdownValue} = this.state;
  const dropdownList = ["Disability Status", "No Health Insurance Coverage", "With Health Insurance Coverage", "With Private Health Insurance Coverage", "With Public Health Insurance Coverage"];

  const {disabilityStatus, healthInsuranceStatus, healthInsuranceType} = this.props;

  // Read and transform Disability Status data into desired format.
  const recentYearDisabilityStatus = {};
  nest()
    .key(d => d.Year)
    .entries(disabilityStatus)
    .forEach(group => {
      nest()
        .key(d => d["ID Place"])
        .entries(group.values)
        .forEach(place => {
          nest()
            .key(d => d["ID Age"])
            .entries(place.values)
            .forEach(ageType => {
              const total = sum(ageType.values, d => d.Population);
              ageType.values.forEach(d => {
                if (d["ID Disability Status"] === 0) d.share = d.Population / total * 100;
              });
            });
        });
      group.key >= disabilityStatus[0].Year ? Object.assign(recentYearDisabilityStatus, group) : {};
    });
  let data = disabilityStatus.filter(d => d["ID Disability Status"] === 0);

  // Find top Disability Status Data for the most recent year.
  recentYearDisabilityStatus.values.sort((a, b) => b.share - a.share);
  let topData = recentYearDisabilityStatus.values[0];

  // Read and transform Health Insurance Status data into desired format.
  const recentYearHealthInsuranceStatus = {};
  nest()
    .key(d => d.Year)
    .entries(healthInsuranceStatus)
    .forEach(group => {
      nest()
        .key(d => d["ID Place"])
        .entries(group.values)
        .forEach(place => {
          nest()
            .key(d => d["ID Age"])
            .entries(place.values)
            .forEach(ageType => {
              const total = sum(ageType.values, d => d.Population);
              ageType.values.forEach(d => d.share = d.Population / total * 100);
            });
        });
      group.key >= healthInsuranceStatus[0].Year ? Object.assign(recentYearHealthInsuranceStatus, group) : {};
    });
  // Filter data for each Health Insurance Status.
  const noInsuranceData = healthInsuranceStatus.filter(d => d["ID Health Insurance coverage:status"] === 1);
  const withInsuranceData = healthInsuranceStatus.filter(d => d["ID Health Insurance coverage:status"] === 0);

  // Read and transform Health Insurance Type data into desired format.
  const recentYearHealthInsuranceType = {};
  nest()
    .key(d => d.Year)
    .entries(healthInsuranceType)
    .forEach(group => {
      nest()
        .key(d => d["ID Place"])
        .entries(group.values)
        .forEach(place => {
          nest()
            .key(d => d["ID Age"])
            .entries(place.values)
            .forEach(ageType => {
              const total = sum(ageType.values, d => d.Population);
              ageType.values.forEach(d => d.share = d.Population / total * 100);
            });
        });
      group.key >= healthInsuranceType[0].Year ? Object.assign(recentYearHealthInsuranceType, group) : {};
    });
  // Filter data for each health insurance type.
  const privateInsuranceData = healthInsuranceType.filter(d => d["ID Health Insurance coverage:type"] === 0);
  const publicInsuranceData = healthInsuranceType.filter(d => d["ID Health Insurance coverage:type"] === 1);

  // Set data for No Health Insurance Coverage.
  if (dropdownValue === dropdownList[1]) {
    data = noInsuranceData;
    // Find top With Health Insurance data for the most recent year.
    const noInsuranceRecentData = recentYearHealthInsuranceStatus.values.filter(d => d["ID Health Insurance coverage:status"] === 1);
    noInsuranceRecentData.sort((a, b) => b.share - a.share);
    topData = noInsuranceRecentData[0];
  }
  // Set data for With Health Insurance Coverage.
  else if (dropdownValue === dropdownList[2]) {
    data = withInsuranceData;
    // Find top With Health Insurance data for the most recent year.
    const withInsuranceRecentData = recentYearHealthInsuranceStatus.values.filter(d => d["ID Health Insurance coverage:status"] === 0);
    withInsuranceRecentData.sort((a, b) => b.share - a.share);
    topData = withInsuranceRecentData[0];
  }
  // Set data for Private Health Insurance Coverage.
  else if (dropdownValue === dropdownList[3]) {
    data = privateInsuranceData;
    // Find top Private Health Insurance data for the most recent year.
    const privateHealthInsuranceRecentData = recentYearHealthInsuranceType.values.filter(d => d["ID Health Insurance coverage:type"] === 0);
    privateHealthInsuranceRecentData.sort((a, b) => b.share - a.share);
    topData = privateHealthInsuranceRecentData[0];
  }
  // Set data for Public Health Insurance Coverage.
  else if (dropdownValue === dropdownList[4]) {
    data = publicInsuranceData;
    // Find top Public Health Insurance data for the most recent year.
    const publicHealthInsuranceRecentData = recentYearHealthInsuranceType.values.filter(d => d["ID Health Insurance coverage:type"] === 1);
    publicHealthInsuranceRecentData.sort((a, b) => b.share - a.share);
    topData = publicHealthInsuranceRecentData[0];
  }

  return (
    <SectionColumns>
      <SectionTitle>Disability Status</SectionTitle>
      <article>
        {/* Create a dropdown list. */}
        <select onChange={this.handleChange}>
          {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <Stat 
          title={`Majority age group in ${topData.Year}`}
          value={`${topData.Age} ${formatPopulation(topData.share)}`}
        />
        <p>In {topData.Year}, the majority age group with disability was {topData.Age} with {formatPopulation(topData.share)} in the {topData.County} county.</p>
        <p>The Bar Chart here shows the percentage of disabled population in the {topData.County} county.</p>
      </article>
      <BarChart config={{
        data,
        discrete: "x",
        height: 400,
        groupBy: "Age",
        legend: false,
        x: d => d.Age,
        y: "share",
        time: "ID Year",
        xConfig: {
          labelRotation: false,
          tickFormat: d => rangeFormatter(d)
        },
        yConfig: {tickFormat: d => formatPopulation(d)},
        xSort: (a, b) => a["ID Age"] - b["ID Age"],
        shapeConfig: {label: false},
        tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
      }}
      />
    </SectionColumns>
  );
}
}

DisabilityStatus.defaultProps = {
  slug: "disability-status"
};

DisabilityStatus.need = [
  fetchData("disabilityStatus", "/api/data?measures=Population&drilldowns=Disability%20Status,Age&County=05000US26163&Year=all", d => d.data),
  fetchData("healthInsuranceStatus", "/api/data?measures=Population&drilldowns=Health%20Insurance%20coverage%3Astatus,Age&County=05000US26163&Year=all", d => d.data),
  fetchData("healthInsuranceType", "/api/data?measures=Population&drilldowns=Health%20Insurance%20coverage%3Atype,Age&County=05000US26163&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  disabilityStatus: state.data.disabilityStatus,
  healthInsuranceStatus: state.data.healthInsuranceStatus,
  healthInsuranceType: state.data.healthInsuranceType
});

export default connect(mapStateToProps)(DisabilityStatus);

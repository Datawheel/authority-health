import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Veterans extends SectionColumns {

  render() {

    const {veteransEmploymentStatus, veteransPovertyStatus, veteransDisabilityStatus} = this.props;
    console.log("veteransEmploymentStatus: ", veteransEmploymentStatus);

    // Get data for Veteran's Employment status.
    const recentYearVeteransByEmploymentStatus = {};
    nest()
      .key(d => d.Year)
      .entries(veteransEmploymentStatus)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= veteransEmploymentStatus[0].Year ? Object.assign(recentYearVeteransByEmploymentStatus, group) : {};
      });
    recentYearVeteransByEmploymentStatus.values.sort((a, b) => b.share - a.share);
    const topEmploymentStatus = recentYearVeteransByEmploymentStatus.values[0];

    console.log("veteransPovertyStatus: ", veteransPovertyStatus);
    // Get data for Veterans Poverty status.
    const recentYearVeteransPovertyStatus = {};
    nest()
      .key(d => d.Year)
      .entries(veteransPovertyStatus)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= veteransPovertyStatus[0].Year ? Object.assign(recentYearVeteransPovertyStatus, group) : {};
      });
    recentYearVeteransPovertyStatus.values.sort((a, b) => b.share - a.share);
    const topPovertyStatus = recentYearVeteransPovertyStatus.values[0];

    console.log("veteransDisabilityStatus: ", veteransDisabilityStatus);
    // Get data for Veterans Poverty status.
    const recentYearVeteransDisabilityStatus = {};
    nest()
      .key(d => d.Year)
      .entries(veteransDisabilityStatus)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= veteransDisabilityStatus[0].Year ? Object.assign(recentYearVeteransDisabilityStatus, group) : {};
      });
    recentYearVeteransDisabilityStatus.values.sort((a, b) => b.share - a.share);
    const topDisabilityStatus = recentYearVeteransDisabilityStatus.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Veterans</SectionTitle>
        <article>
          <Stat 
            title={`Majority Employment Status in ${topEmploymentStatus.Year}`}
            value={`${topEmploymentStatus["Employment Status"]} ${formatPercentage(topEmploymentStatus.share)}`}
          />
          <Stat 
            title={`Majority Poverty Status in ${topPovertyStatus.Year}`}
            value={`${topPovertyStatus["Poverty Status"]} ${formatPercentage(topPovertyStatus.share)}`}
          />
          <Stat 
            title={`Majority Disability Status in ${topDisabilityStatus.Year}`}
            value={`${topDisabilityStatus["Disability Status"]} ${formatPercentage(topDisabilityStatus.share)}`}
          />

          <LinePlot config={{
            data: veteransPovertyStatus,
            discrete: "x",
            height: 150,
            groupBy: "Poverty Status",
            legend: false,
            baseline: 0,
            x: "Year",
            xConfig: {
              title: "Year",
              labelRotation: false
            },
            y: "share",
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Poverty Status"
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />

          <LinePlot config={{
            data: veteransDisabilityStatus,
            discrete: "x",
            height: 150,
            groupBy: "Disability Status",
            legend: false,
            baseline: 0,
            x: "Year",
            xConfig: {
              title: "Year",
              labelRotation: false
            },
            y: "share",
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Disability Status"
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />
        </article>

        {/* Draw a BarChart to show data for Veterans by their Employement Status. */}
        <BarChart config={{
          data: veteransEmploymentStatus,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Employment Status",
          x: "Employment Status",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Employment Status"] - b["ID Employment Status"],
          xConfig: {
            labelRotation: false,
            title: "Employment Status"
          },
          yConfig: {
            ticks: [],
            title: "Percentage of Veterans",
            tickFormat: d => formatPercentage(d)
          },
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Veterans.defaultProps = {
  slug: "veterans"
};

Veterans.need = [
  fetchData("veteransEmploymentStatus", "/api/data?measures=Population&drilldowns=Employment%20Status&County=<id>&Year=all", d => d.data),
  fetchData("veteransPovertyStatus", "/api/data?measures=Population&drilldowns=Poverty%20Status&County=<id>&Year=all", d => d.data),
  fetchData("veteransDisabilityStatus", "/api/data?measures=Population&drilldowns=Disability%20Status&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  veteransEmploymentStatus: state.data.veteransEmploymentStatus,
  veteransPovertyStatus: state.data.veteransPovertyStatus,
  veteransDisabilityStatus: state.data.veteransDisabilityStatus
});

export default connect(mapStateToProps)(Veterans);

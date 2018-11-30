import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Veterans extends SectionColumns {

  render() {

    const {veteransEmploymentStatus, veteransPovertyStatus, veteransDisabilityStatus, periodOfService} = this.props;

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
    // Get stats for Veterans in Poverty.
    const recentYearVeteransInPoverty = recentYearVeteransPovertyStatus.values[0];

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
    // Get stats for Veterans With Disability.
    const recentYearVeteransWithDisability = recentYearVeteransDisabilityStatus.values[1];

    // Get data for Veterns Period of Service.
    console.log("periodOfService: ", periodOfService);
    const recentYearPeriodOfService = {};
    nest()
      .key(d => d.Year)
      .entries(periodOfService)
      .forEach(group => {
        const total = sum(group.values, d => d.Veterans);
        group.values.forEach(d => d.share = d.Veterans / total * 100);
        group.key >= veteransEmploymentStatus[0].Year ? Object.assign(recentYearPeriodOfService, group) : {};
      });
    recentYearPeriodOfService.values.sort((a, b) => b.share - a.share);
    const topPeriodOfService = recentYearPeriodOfService.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Veterans</SectionTitle>
        <article>
          <Stat 
            title={`Majority Employment Status in ${topEmploymentStatus.Year}`}
            value={`${topEmploymentStatus["Employment Status"]} ${formatPercentage(topEmploymentStatus.share)}`}
          />
          <Stat 
            title={`Veterans in Poverty in ${recentYearVeteransInPoverty.Year}`}
            value={`${formatPercentage(recentYearVeteransInPoverty.share)}`}
          />
          <Stat 
            title={`Veterans With Disability in ${recentYearVeteransWithDisability.Year}`}
            value={`${formatPercentage(recentYearVeteransWithDisability.share)}`}
          />
          <Stat 
            title={`Top Period of Service in ${topPeriodOfService.Year}`}
            value={`${topPeriodOfService["Period of Service"]} ${formatPercentage(topPeriodOfService.share)}`}
          />

          {/* Draw a BarChart for Veterans Period of Service. */}
          <BarChart config={{
            data: periodOfService,
            discrete: "x",
            height: 200,
            groupBy: "Period of Service",
            legend: false,
            x: d => d["Period of Service"],
            y: "share",
            time: "ID Year",
            xSort: (a, b) => a["ID Period of Service"] - b["ID Period of Service"],
            xConfig: {
              labelRotation: false
            },
            yConfig: {tickFormat: d => formatPercentage(d)},
            shapeConfig: {label: false},
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />
        </article>

        {/* Draw a LinePlot to show data for Veterans by their Employement Status. */}
        <LinePlot config={{
          data: veteransEmploymentStatus,
          discrete: "x",
          height: 400,
          groupBy: "Employment Status",
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
            title: "Employment Status"
          },
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
  fetchData("veteransDisabilityStatus", "/api/data?measures=Population&drilldowns=Disability%20Status&County=<id>&Year=all", d => d.data),
  fetchData("periodOfService", "https://katahdin.datausa.io/api/data?measures=Veterans&drilldowns=Period%20of%20Service&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  veteransEmploymentStatus: state.data.veteransEmploymentStatus,
  veteransPovertyStatus: state.data.veteransPovertyStatus,
  veteransDisabilityStatus: state.data.veteransDisabilityStatus,
  periodOfService: state.data.periodOfService
});

export default connect(mapStateToProps)(Veterans);

import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
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
    const recentYearUnemployedVeterans = recentYearVeteransByEmploymentStatus.values.filter(d => d["Employment Status"] === "Unemployed");
    const topEmploymentStatus = recentYearUnemployedVeterans[0];

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
    const recentYearPeriodOfService = {};
    nest()
      .key(d => d.Year)
      .entries(periodOfService)
      .forEach(group => {
        const total = sum(group.values, d => d.Veterans);
        group.values.forEach(d => d.share = d.Veterans / total * 100);
        group.key >= veteransEmploymentStatus[0].Year ? Object.assign(recentYearPeriodOfService, group) : {};
      });
    const filteredPeriodOfService = periodOfService.filter(d => d["Period of Service"] !== "Other");
    recentYearPeriodOfService.values.sort((a, b) => b.share - a.share);
    const topPeriodOfService = recentYearPeriodOfService.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Veterans</SectionTitle>
        <article>
          <Stat
            title={"Unemployed"}
            year={topEmploymentStatus.Year}
            value={formatPercentage(topEmploymentStatus.share)}
          />
          <Stat
            title={"Impoverished"}
            year={recentYearVeteransInPoverty.Year}
            value={formatPercentage(recentYearVeteransInPoverty.share)}
          />
          <Stat
            title={"Disabled"}
            year={recentYearVeteransWithDisability.Year}
            value={formatPercentage(recentYearVeteransWithDisability.share)}
          />
          <Stat
            title={"Most common period of service"}
            year={topPeriodOfService.Year}
            value={topPeriodOfService["Period of Service"]}
            qualifier={formatPercentage(topPeriodOfService.share)}
          />

          <p>In {topPeriodOfService.Year}, the most common period of service by {topPeriodOfService.Geography} veterans was served in {topPeriodOfService["Period of Service"]} ({formatPercentage(topPeriodOfService.share)}).</p>
          <p>The unemployed veterans population was {formatPercentage(topEmploymentStatus.share)}, while the impoverished population was {formatPercentage(recentYearVeteransInPoverty.share)} and the disabled veterans population was {formatPercentage(recentYearVeteransWithDisability.share)}</p>
          <p>The chart here shows the period of service by veterans.</p>
        </article>

        {/* Draw a BarChart for Veterans Period of Service. */}
        <BarChart config={{
          data: filteredPeriodOfService,
          discrete: "x",
          height: 400,
          groupBy: "Period of Service",
          legend: false,
          x: d => d["Period of Service"],
          y: "share",
          time: "Year",
          xSort: (a, b) => a["ID Period of Service"] - b["ID Period of Service"],
          xConfig: {
            labelRotation: false,
            title: "Period of Service"
          },
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Share"
          },
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["Location", d => d.Geography]]}
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
  fetchData("veteransEmploymentStatus", "/api/data?measures=Population&drilldowns=Employment Status&Geography=<id>&Year=all", d => d.data),
  fetchData("veteransPovertyStatus", "/api/data?measures=Population&drilldowns=Poverty Status&Geography=<id>&Year=all", d => d.data),
  fetchData("veteransDisabilityStatus", "/api/data?measures=Population&drilldowns=Disability Status&Geography=<id>&Year=all", d => d.data),
  fetchData("periodOfService", "https://niagara.datausa.io/api/data?measures=Veterans&drilldowns=Period of Service&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  veteransEmploymentStatus: state.data.veteransEmploymentStatus,
  veteransPovertyStatus: state.data.veteransPovertyStatus,
  veteransDisabilityStatus: state.data.veteransDisabilityStatus,
  periodOfService: state.data.periodOfService
});

export default connect(mapStateToProps)(Veterans);

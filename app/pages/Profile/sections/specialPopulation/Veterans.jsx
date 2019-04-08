import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatPeriodOfService = periodOfService => {
  nest()
    .key(d => d.Year)
    .entries(periodOfService)
    .forEach(group => {
      const total = sum(group.values, d => d.Veterans);
      group.values.forEach(d => total !== 0 ? d.share = d.Veterans / total * 100 : d.share = 0);
    });
  const filteredPeriodOfService = periodOfService.filter(d => d["Period of Service"] !== "Other");
  const topPeriodOfService = filteredPeriodOfService.sort((a, b) => b.share - a.share)[0];
  return [filteredPeriodOfService, topPeriodOfService];
};

class Veterans extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {meta, veteransEmploymentStatus, veteransPovertyStatus, veteransDisabilityStatus, periodOfService} = this.props;

    const veteransEmploymentStatusAvailable = veteransEmploymentStatus.length !== 0;
    const veteransPovertyStatusAvailable = veteransPovertyStatus.length !== 0;
    const veteransDisabilityStatusAvailable = veteransDisabilityStatus.length !== 0;
    const periodOfServiceAvailable = periodOfService.length !== 0;

    // Get top data for Veteran's Employment status.
    let topEmploymentStatus;
    if (veteransEmploymentStatusAvailable) {
      nest()
        .key(d => d.Year)
        .entries(veteransEmploymentStatus)
        .forEach(group => {
          const total = sum(group.values, d => d["Veteran Population"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Veteran Population"] / total * 100 : d.share = 0);
        });
      topEmploymentStatus = veteransEmploymentStatus.filter(d => d["Employment Status"] === "Unemployed")[0];
    }

    // Get data for Veterans Poverty status.
    if (veteransPovertyStatusAvailable) {
      nest()
        .key(d => d.Year)
        .entries(veteransPovertyStatus)
        .forEach(group => {
          const total = sum(group.values, d => d["Veteran Population"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Veteran Population"] / total * 100 : d.share = 0);
        });
    }

    // Get data for Veterans Poverty status.
    if (veteransDisabilityStatusAvailable) {
      nest()
        .key(d => d.Year)
        .entries(veteransDisabilityStatus)
        .forEach(group => {
          const total = sum(group.values, d => d["Veteran Population"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Veteran Population"] / total * 100 : d.share = 0);
        });
    }

    // Get data for Veterns Period of Service.
    let topPeriodOfService;
    if (periodOfServiceAvailable) {
      topPeriodOfService = formatPeriodOfService(periodOfService)[1];
    }

    return (
      <SectionColumns>
        <SectionTitle>Veterans</SectionTitle>
        <article>
          <Stat
            title={"Unemployed"}
            year={veteransEmploymentStatusAvailable ? topEmploymentStatus.Year : ""}
            value={veteransEmploymentStatusAvailable ? formatPercentage(topEmploymentStatus.share) : "N/A"}
          />
          <Stat
            title={"Impoverished"}
            year={veteransPovertyStatusAvailable ? veteransPovertyStatus[0].Year : ""}
            value={veteransPovertyStatusAvailable ? formatPercentage(veteransPovertyStatus[0].share) : "N/A"}
          />
          <Stat
            title={"Disabled"}
            year={veteransDisabilityStatusAvailable ? veteransDisabilityStatus[0].Year : ""}
            value={veteransDisabilityStatusAvailable ? formatPercentage(veteransDisabilityStatus[0].share) : "N/A"}
          />
          <Stat
            title={"Most common period of service"}
            year={periodOfServiceAvailable ? topPeriodOfService.Year : ""}
            value={periodOfServiceAvailable ? topPeriodOfService["Period of Service"] : "N/A"}
            qualifier={periodOfServiceAvailable ? `(${formatPercentage(topPeriodOfService.share)})` : ""}
          />

          {periodOfServiceAvailable ? <p>In {topPeriodOfService.Year}, the most common period of service for veterans in {topPeriodOfService.Geography} was {topPeriodOfService["Period of Service"]} ({formatPercentage(topPeriodOfService.share)}).</p> : ""}
          <p>In {topEmploymentStatus.Year}, the unemployed veterans population of {topEmploymentStatus.Geography} was {veteransEmploymentStatusAvailable ? formatPercentage(topEmploymentStatus.share) : "N/A"}, while the impoverished population was {veteransPovertyStatusAvailable ? formatPercentage(veteransPovertyStatus[0].share) : ""} and the disabled veterans population was {veteransDisabilityStatusAvailable ? formatPercentage(veteransDisabilityStatus[0].share) : "N/A"}</p>
          {periodOfServiceAvailable ? <p>The chart here shows the percentages of veterans that served in each period of service.</p> : ""}
          
          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        {/* Draw a BarChart for Veterans Period of Service. */}
        {periodOfServiceAvailable
          ? <BarChart config={{
            data: `https://acs.datausa.io/api/data?measures=Veterans&drilldowns=Period of Service&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 400,
            groupBy: "Period of Service",
            legend: false,
            x: d => d["Period of Service"],
            y: "share",
            time: "Year",
            xSort: (a, b) => b["ID Period of Service"] - a["ID Period of Service"],
            xConfig: {
              labelRotation: false,
              title: "Period of Service"
            },
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Share"
            },
            shapeConfig: {label: false},
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return formatPeriodOfService(resp.data)[0];
          }}
          /> : <div></div>}
      </SectionColumns>
    );
  }
}

Veterans.defaultProps = {
  slug: "veterans"
};

Veterans.need = [
  fetchData("veteransEmploymentStatus", "/api/data?measures=Veteran Population&drilldowns=Employment Status&Geography=<id>&Year=latest", d => d.data),
  fetchData("veteransPovertyStatus", "/api/data?measures=Veteran Population&drilldowns=Poverty Status&Geography=<id>&Year=latest", d => d.data),
  fetchData("veteransDisabilityStatus", "/api/data?measures=Veteran Population&drilldowns=Disability Status&Geography=<id>&Year=latest", d => d.data),
  fetchData("periodOfService", "https://acs.datausa.io/api/data?measures=Veterans&drilldowns=Period of Service&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  veteransEmploymentStatus: state.data.veteransEmploymentStatus,
  veteransPovertyStatus: state.data.veteransPovertyStatus,
  veteransDisabilityStatus: state.data.veteransDisabilityStatus,
  periodOfService: state.data.periodOfService
});

export default connect(mapStateToProps)(Veterans);

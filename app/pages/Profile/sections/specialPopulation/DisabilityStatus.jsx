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
import rangeFormatter from "utils/rangeFormatter";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class DisabilityStatus extends SectionColumns {

  render() {

    const {meta, healthCoverageType, disabilityStatus} = this.props;

    const healthCoverageTypeAvailable = healthCoverageType.length !== 0;
    const disabilityStatusAvailable = disabilityStatus.length !== 0;

    // Get top stat for disabled population.
    const recentYearDisabilityStatus = {};
    let topDisabilityStatus;
    if (disabilityStatusAvailable) {
      nest()
        .key(d => d.Year)
        .entries(disabilityStatus)
        .forEach(group => {
          const total = sum(group.values, d => d["Population in Disability"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Population in Disability"] / total * 100 : d.share = 0);
          group.key >= disabilityStatus[0].Year ? Object.assign(recentYearDisabilityStatus, group) : {};
        });
      const filteredRecentYearDisabilityStatus = recentYearDisabilityStatus.values.filter(d => d["ID Disability Status"] === 0);
      topDisabilityStatus = filteredRecentYearDisabilityStatus.sort((a, b) => b.share - a.share)[0];
    }

    // Read and transform Health Coverage type data into desired format.
    let filteredHealthCoverageType;
    if (healthCoverageTypeAvailable) {
      nest()
        .key(d => d.Year)
        .entries(healthCoverageType)
        .forEach(group => {
          const total = sum(group.values, d => d["Population in Disability"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Population in Disability"] / total * 100 : d.share = 0);
        });
      // Filter data for only disabled population.
      filteredHealthCoverageType = healthCoverageType.filter(d => d["Disability Status"] !== "No Disability");
    }

    return (
      <SectionColumns>
        <SectionTitle>Disability Status</SectionTitle>
        <article>
          {/* Show stats for the top data. */}
          <Stat
            title="Largest age group with a disibility"
            year={disabilityStatusAvailable ? topDisabilityStatus.Year : ""}
            value={disabilityStatusAvailable ? rangeFormatter(topDisabilityStatus.Age) : "N/A"}
            qualifier={disabilityStatusAvailable ? formatPopulation(topDisabilityStatus.share) : ""}
          />
          {/* Write short paragraph describing stats and barchart. */}
          {disabilityStatusAvailable ? <p>In {topDisabilityStatus.Year}, the most common disabled age group was {rangeFormatter(topDisabilityStatus.Age)} years making up {formatPopulation(topDisabilityStatus.share)} of all disabled citizens in {topDisabilityStatus.Geography}.</p> : ""}
          {healthCoverageTypeAvailable ? <p>The chart here shows the health coverage breakdown of the disabled population in {filteredHealthCoverageType[0].Geography}.</p> : ""}
          <Contact slug={this.props.slug} />
        </article>

        {/* Show barchart for each age group type with public, private and no health insurance coverage*/}
        {healthCoverageTypeAvailable
          ? <BarChart config={{
            data: filteredHealthCoverageType,
            discrete: "y",
            height: 400,
            stacked: true,
            groupBy: ["Coverage Type"],
            y: "Age",
            x: "share",
            time: "Year",
            yConfig: {
              tickFormat: d => rangeFormatter(d),
              title: "Age group"
            },
            xConfig: {
              tickFormat: d => formatPopulation(d)
            },
            ySort: (a, b) => a["ID Age"] - b["ID Age"],
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          /> : <div></div>}
      </SectionColumns>
    );
  }
}

DisabilityStatus.defaultProps = {
  slug: "disability-status"
};

DisabilityStatus.need = [
  fetchData("healthCoverageType", "/api/data?measures=Population in Disability&drilldowns=Coverage Status,Coverage Type,Disability Status,Age&Geography=<id>&Year=all", d => d.data),
  fetchData("disabilityStatus", "/api/data?measures=Population in Disability&drilldowns=Disability Status,Age&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  healthCoverageType: state.data.healthCoverageType,
  disabilityStatus: state.data.disabilityStatus
});

export default connect(mapStateToProps)(DisabilityStatus);

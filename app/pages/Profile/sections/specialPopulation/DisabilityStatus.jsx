import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class DisabilityStatus extends SectionColumns {

  render() {

    const {healthCoverageType} = this.props;

    // Read and transform Health Insurance Status data into desired format.
    const recentYearHealthCoverageType = {};
    nest()
      .key(d => d.Year)
      .entries(healthCoverageType)
      .forEach(group => {
        nest()
          .key(d => d["ID Age"])
          .entries(group.values)
          .forEach(ageType => {
            const total = sum(ageType.values, d => d.Population);
            ageType.values.forEach(d => d.share = d.Population / total * 100);
          });
        group.key >= healthCoverageType[0].Year ? Object.assign(recentYearHealthCoverageType, group) : {};
      });

    // Show barchart for only disabled population.
    const filteredHealthCoverageType = healthCoverageType.filter(d => d["Disability Status"] !== "No Disability");

    // Show top stat for disabled population.
    const sortedRecentYearData = recentYearHealthCoverageType.values.filter(d => d["Disability Status"] !== "No Disability").sort((a, b) => b.share - a.share);
    const topRecentYearData = sortedRecentYearData[0];

    return (
      <SectionColumns>
        <SectionTitle>Disability Status</SectionTitle>
        <article>
          {/* Show stats for the top data. */}
          <Stat
            title="Largest age group with a disibility"
            year={topRecentYearData.Year}
            value={rangeFormatter(topRecentYearData.Age)}
            qualifier={formatPopulation(topRecentYearData.share)}
          />
          {/* Write short paragraph describing stats and barchart. */}
          <p>In {topRecentYearData.Year}, the majority age group with disability was {rangeFormatter(topRecentYearData.Age)} years with {formatPopulation(topRecentYearData.share)} in the {topRecentYearData.County} county.</p>
          <p>The Barchart here shows the percentage of disabled population with public, private and no health insurance in the {topRecentYearData.County} county.</p>
        </article>

        {/* Show barchart for each age group type with public, private and no health insurance coverage*/}
        <BarChart config={{
          data: filteredHealthCoverageType,
          discrete: "y",
          height: 400,
          stacked: true,
          groupBy: ["Health Insurance coverage:type"],
          label: d => `${d["Health Insurance coverage:type"]}`,
          y: d => d.Age,
          x: "share",
          time: "ID Year",
          yConfig: {
            tickFormat: d => rangeFormatter(d),
            title: "Age group"
          },
          xConfig: {
            tickFormat: d => formatPopulation(d),
            title: "Share"
          },
          ySort: (a, b) => a["ID Age"] - b["ID Age"],
          shapeConfig: {
            label: false
          },
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
  fetchData("healthCoverageType", "/api/data?measures=Population&drilldowns=Health%20Insurance%20coverage%3Astatus,Health%20Insurance%20coverage%3Atype,Disability%20Status,Age&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  healthCoverageType: state.data.healthCoverageType
});

export default connect(mapStateToProps)(DisabilityStatus);

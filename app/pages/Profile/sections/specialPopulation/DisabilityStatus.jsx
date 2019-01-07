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

    const {healthCoverageType, disabilityData} = this.props;

    // Get top stat for disabled population.
    const recentYearDisabilityData = {};
    nest()
      .key(d => d.Year)
      .entries(disabilityData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= disabilityData[0].Year ? Object.assign(recentYearDisabilityData, group) : {};
      });
    const filteredRecentYearDisabilityData = recentYearDisabilityData.values.filter(d => d["ID Disability Status"] === 0);
    filteredRecentYearDisabilityData.sort((a, b) => b.share - a.share);
    const topDisabilityData = filteredRecentYearDisabilityData[0];

    // Read and transform Health Insurance Status data into desired format.
    nest()
      .key(d => d.Year)
      .entries(healthCoverageType)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
      });

    // Show barchart for only disabled population.
    const filteredHealthCoverageType = healthCoverageType.filter(d => d["Disability Status"] !== "No Disability");

    return (
      <SectionColumns>
        <SectionTitle>Disability Status</SectionTitle>
        <article>
          {/* Show stats for the top data. */}
          <Stat
            title="Largest age group with a disibility"
            year={topDisabilityData.Year}
            value={rangeFormatter(topDisabilityData.Age)}
            qualifier={formatPopulation(topDisabilityData.share)}
          />
          {/* Write short paragraph describing stats and barchart. */}
          <p>In {topDisabilityData.Year}, the most common disabled age group was {rangeFormatter(topDisabilityData.Age)} years making up {formatPopulation(topDisabilityData.share)} of all disabled citizens in {topDisabilityData.Geography} County.</p>
          <p>The chart here shows the health coverage breakdown of the disabled population in {topDisabilityData.Geography} County.</p>
        </article>

        {/* Show barchart for each age group type with public, private and no health insurance coverage*/}
        <BarChart config={{
          data: filteredHealthCoverageType,
          discrete: "y",
          height: 400,
          stacked: true,
          groupBy: ["Health Insurance coverage:type"],
          label: d => `${d["Health Insurance coverage:type"]}`,
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
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPopulation(d.share)]]}
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
  fetchData("healthCoverageType", "/api/data?measures=Population&drilldowns=Health Insurance coverage:status,Health Insurance coverage:type,Disability Status,Age&Geography=<id>&Year=all", d => d.data),
  fetchData("disabilityData", "/api/data?measures=Population&drilldowns=Disability Status,Age&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  healthCoverageType: state.data.healthCoverageType,
  disabilityData: state.data.disabilityData
});

export default connect(mapStateToProps)(DisabilityStatus);

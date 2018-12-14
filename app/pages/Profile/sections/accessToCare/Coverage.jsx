import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import rangeFormatter from "../../../../utils/rangeFormatter";
import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Coverage extends SectionColumns {

  render() {
    const {coverageData} = this.props;

    const recentYearCoverageData = {};
    nest()
      .key(d => d.Year)
      .entries(coverageData)
      .forEach(group => {
        nest()
          .key(d => d["ID Age"])
          .entries(group.values)
          .forEach(ageGroup => {
            const total = sum(ageGroup.values, d => d.Population);
            ageGroup.values.forEach(d => d.share = d.Population / total * 100);
          });
        group.key >= coverageData[0].Year ? Object.assign(recentYearCoverageData, group) : {};
      });

    const filteredRecentYearData = recentYearCoverageData.values.filter(d => d["ID Health Insurance Coverage Status"] === 0);
    const femaleCoverageData = filteredRecentYearData.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share);
    const topFemaleAgeGroup = rangeFormatter(femaleCoverageData[0].Age);
    const topFemaleShare = formatPercentage(femaleCoverageData[0].share);

    const maleCoverageData = filteredRecentYearData.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share);
    const topMaleAgeGroup = rangeFormatter(maleCoverageData[0].Age);
    const ageGroupYear = maleCoverageData[0].Year;
    const topMaleShare = formatPercentage(maleCoverageData[0].share);

    return (
      <SectionColumns>
        <SectionTitle>Coverage</SectionTitle>
        <article>
          <Stat
            title="Male majority with Coverage"
            year={ageGroupYear}
            value={topMaleAgeGroup}
            qualifier={topMaleShare}
          />
          <Stat
            title="Female majority with Coverage"
            year={ageGroupYear}
            value={topFemaleAgeGroup}
            qualifier={topFemaleShare}
          />
          <p>In {ageGroupYear}, the age groups most likely to have health care coverage in {maleCoverageData[0].Geography} are {topMaleAgeGroup} and {topFemaleAgeGroup} years, for men and women respectively.</p>
          <p>The BarChart here shows the male and female age groups with and without Health Insurance Coverage.</p>
        </article>

        <BarChart config={{
          data: coverageData,
          discrete: "x",
          height: 400,
          stacked: true,
          label: d => `${d.Sex} ${d["Health Insurance Coverage Status"]}`,
          groupBy: d => `${d["Health Insurance Coverage Status"]} ${d.Sex}`,
          x: d => d.Age,
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Age"] - b["ID Age"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d)
          },
          yConfig: {tickFormat: d => formatPercentage(d)},
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Coverage.defaultProps = {
  slug: "coverage"
};

Coverage.need = [
  fetchData("coverageData", "/api/data?measures=Population&drilldowns=Health Insurance Coverage Status,Sex,Age&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  coverageData: state.data.coverageData
});

export default connect(mapStateToProps)(Coverage);

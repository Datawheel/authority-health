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
            title="Most covered male group"
            year={ageGroupYear}
            value={topMaleAgeGroup}
            qualifier={topMaleShare}
          />
          <Stat
            title="Most covered female group"
            year={ageGroupYear}
            value={topFemaleAgeGroup}
            qualifier={topFemaleShare}
          />
          <p>In {ageGroupYear}, the age groups most likely to have health care coverage in {maleCoverageData[0].Geography} County are {topMaleAgeGroup} and {topFemaleAgeGroup} years, for men and women respectively.</p>
          <p>The following chart shows the male and female age groups with health insurance coverage.</p>
        </article>

        <BarChart config={{
          data: filteredRecentYearData,
          discrete: "x",
          height: 400,
          groupBy: "Sex",
          x: "Age",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Age"] - b["ID Age"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d),
            title: "Population with Coverage"
          },
          yConfig: {tickFormat: d => formatPercentage(d)},
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPercentage(d.share)]]}
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

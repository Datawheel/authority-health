import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import rangeFormatter from "../../../../utils/rangeFormatter";
import Stat from "../../components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class Coverage extends SectionColumns {

  render() {
    const {coverageData} = this.props;
    console.log("coverageData: ", coverageData);

    const recentYearCoverageData = {};
    nest()
      .key(d => d.Year)
      .entries(coverageData)
      .forEach(group => {
        console.log("group: ", group);
        nest()
          .key(d => d["ID Age"])
          .entries(group.values)
          .forEach(ageGroup => {
            console.log("ageGroup: ", ageGroup);
            const total = sum(ageGroup.values, d => d.Population);
            ageGroup.values.forEach(d => d.share = d.Population / total * 100);
          });
        group.key >= coverageData[0].Year ? Object.assign(recentYearCoverageData, group) : {};
      });
    // const data = coverageData.filter(d => d["ID Health Insurance Coverage Status"] === 0);

    const filteredRecentYearData = recentYearCoverageData.values.filter(d => d["ID Health Insurance Coverage Status"] === 0);
    const femaleCoverageData = filteredRecentYearData.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share);
    const topFemaleAgeGroup = rangeFormatter(femaleCoverageData[0].Age);

    const maleCoverageData = filteredRecentYearData.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share);
    const topMaleAgeGroup = rangeFormatter(maleCoverageData[0].Age);
    const ageGroupYear = maleCoverageData[0].Year;

    return (
      <SectionColumns>
        <SectionTitle>Coverage</SectionTitle>
        <article>
          <Stat 
            title={`Male majority with Coverage in ${ageGroupYear}`}
            value={topMaleAgeGroup}
          />
          <Stat 
            title={`Female majority with Coverage in ${ageGroupYear}`}
            value={topFemaleAgeGroup}
          />
          <p>In {ageGroupYear}, the age groups most likely to have health care coverage in the {maleCoverageData[0].County} county are {topMaleAgeGroup} and {topFemaleAgeGroup} years, for men and women respectively.</p>
          <p>The BarChart here shows the male and female age groups with and without Health Insurance Coverage.</p>
        </article>

        <BarChart config={{
          data: coverageData,
          discrete: "x",
          height: 400,
          stacked: true,
          label: d => `${d.Sex} ${d["Health Insurance Coverage Status"]}`,
          groupBy: ["Health Insurance Coverage Status", "Sex"],
          x: d => d.Age,
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Age"] - b["ID Age"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d)
          },
          yConfig: {tickFormat: d => formatPopulation(d)},
          shapeConfig: {
            opacity: d => d.Sex === "Female" ? 0.5 : 1
          },
          tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
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
  fetchData("coverageData", "/api/data?measures=Population&drilldowns=Health%20Insurance%20Coverage%20Status,Sex,Age&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  coverageData: state.data.coverageData
});

export default connect(mapStateToProps)(Coverage);

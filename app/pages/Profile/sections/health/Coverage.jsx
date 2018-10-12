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

    const data = coverageData.data.filter(d => d["ID Health Insurance Coverage Status"] === 0);
    const recentYearCoverageData = {};
    nest()
      .key(d => d.Year)
      .entries(data)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= coverageData.data[0].Year ? Object.assign(recentYearCoverageData, group) : {};
      });

    const femaleCoverageData = recentYearCoverageData.values.filter(d => d.Sex === "Female").sort((a, b) => b.Population - a.Population);
    const topFemaleAgeGroup = rangeFormatter(femaleCoverageData[0].Age);

    const maleCoverageData = recentYearCoverageData.values.filter(d => d.Sex === "Male").sort((a, b) => b.Population - a.Population);
    const topMaleAgeGroup = rangeFormatter(maleCoverageData[0].Age);
    const ageGroupYear = maleCoverageData.Year;

    return (
      <SectionColumns>
        <SectionTitle>Coverage</SectionTitle>
        <article>
          <Stat 
            title={`Male majority in ${ageGroupYear}`}
            value={topMaleAgeGroup}
          />
          <Stat 
            title={`Female majority in ${ageGroupYear}`}
            value={topFemaleAgeGroup}
          />
          <p>In {ageGroupYear} the age groups most likely to have health care coverage in the {maleCoverageData[0].County} county are {topMaleAgeGroup} and {topFemaleAgeGroup}, for men and women respectively.</p>
        </article>

        <BarChart config={{
          data,
          discrete: "x",
          height: 400,
          stacked: true,
          groupBy: "Sex",
          x: d => d.Age,
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Age"] - b["ID Age"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d)
          },
          yConfig: {tickFormat: d => formatPopulation(d)},
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d.Population)]]}
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
  fetchData("coverageData", "/api/data?measures=Population&drilldowns=Health%20Insurance%20Coverage%20Status,Sex,Age&County=<id>&Year=all")
];

const mapStateToProps = state => ({
  coverageData: state.data.coverageData
});

export default connect(mapStateToProps)(Coverage);

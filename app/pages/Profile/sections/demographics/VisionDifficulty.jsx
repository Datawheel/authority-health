import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import rangeFormatter from "../../../../utils/rangeFormatter";
import Stat from "../../components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class VisionDifficulty extends SectionColumns {

  render() {
    const {visionDifficulty} = this.props;

    const recentYearVisionDifficultyData = {};
    nest()
      .key(d => d.Year)
      .entries(visionDifficulty)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= visionDifficulty[0].Year ? Object.assign(recentYearVisionDifficultyData, group) : {};
      });
    // nest()
    //   .key(d => d.Year)
    //   .entries(visionDifficulty)
    //   .forEach(group => {
    //     nest()
    //       .key(d => d.Age)
    //       .entries(group)
    //       .forEach(ageGroup => {
    //         nest()
    //           .key(d => d.Sex)
    //           .entries(ageGroup)
    //           .forEach(gender => {
    //             console.log("group: ", gender);
    //             const total = sum(gender.values, d => d.Population);
    //             gender.values.forEach(d => d.share = d.Population / total * 100);
    //           });
    //       });
    //     group.key >= visionDifficulty[0].Year ? Object.assign(recentYearVisionDifficultyData, group) : {};
    //   });
    // console.log("visionDifficulty: ", visionDifficulty);
    const data = visionDifficulty.filter(d => d["ID Vision Disability Status"] === 0);

    const filteredRecentYearData = recentYearVisionDifficultyData.values.filter(d => d["ID Vision Disability Status"] === 0);
    const femaleVisionDifficultyData = filteredRecentYearData.filter(d => d.Sex === "Female").sort((a, b) => b.Population - a.Population);
    const topFemaleAgeGroup = rangeFormatter(femaleVisionDifficultyData[0].Age);

    const maleVisionDifficultyCoverageData = filteredRecentYearData.filter(d => d.Sex === "Male").sort((a, b) => b.Population - a.Population);
    const topMaleAgeGroup = rangeFormatter(maleVisionDifficultyCoverageData[0].Age);
    const ageGroupYear = maleVisionDifficultyCoverageData[0].Year;

    return (
      <SectionColumns>
        <SectionTitle>Vision Difficulty</SectionTitle>
        <article>
          <Stat 
            title={`Male majority in ${ageGroupYear}`}
            value={topMaleAgeGroup}
          />
          <Stat 
            title={`Female majority in ${ageGroupYear}`}
            value={topFemaleAgeGroup}
          />
          <p>In {ageGroupYear}, the age groups most likely to have difficulty in seeing in the {maleVisionDifficultyCoverageData[0].County} county are {topMaleAgeGroup} and {topFemaleAgeGroup} years, for men and women respectively.</p>
          <p>The BarChart here shows the male and female age group percentage with difficulty in seeing in the {maleVisionDifficultyCoverageData[0].County} county.</p>
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
          tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

VisionDifficulty.defaultProps = {
  slug: "vision-difficulty"
};

VisionDifficulty.need = [
  fetchData("visionDifficulty", "/api/data?measures=Population&drilldowns=Vision%20Disability%20Status,Age,Sex&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  visionDifficulty: state.data.visionDifficulty
});

export default connect(mapStateToProps)(VisionDifficulty);

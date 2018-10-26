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

class HearingAndVisionDifficulty extends SectionColumns {

  render() {
    const {hearingDifficulty, visionDifficulty} = this.props;
    console.log("hearingDifficulty: ", hearingDifficulty);
    console.log("visionDifficulty: ", visionDifficulty);

    const visionAndHearingData = [];

    const recentYearVisionDifficultyData = {};
    nest()
      .key(d => d.Year)
      .entries(visionDifficulty)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => {
          if (d["ID Vision Disability Status"] === 0) {
            d.share = d.Population / total * 100;
            d.disabilityType = "visionDifficulty";
            visionAndHearingData.push(d);
          }
        });
        group.key >= visionDifficulty[0].Year ? Object.assign(recentYearVisionDifficultyData, group) : {};
      });
    const filteredRecentVisionDifficulty = recentYearVisionDifficultyData.values.filter(d => d["ID Vision Disability Status"] === 0);

    // Find Top Female Vision disability Data
    const femaleMajorityVisionDifficulty = filteredRecentVisionDifficulty.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share);
    const topFemaleVisionDifficultyData = femaleMajorityVisionDifficulty[0];

    // Find Top Female Vision disability Data
    const maleMajorityVisionDifficulty = filteredRecentVisionDifficulty.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share);
    const topMaleVisionDifficultyData = maleMajorityVisionDifficulty[0];

    const recentYearHearingDifficultyData = {};
    nest()
      .key(d => d.Year)
      .entries(hearingDifficulty)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => {
          if (d["ID Hearing Disability Status"] === 0) {
            d.share = d.Population / total * 100;
            d.disabilityType = "hearingDifficulty";
            visionAndHearingData.push(d);
          }
        });
        group.key >= hearingDifficulty[0].Year ? Object.assign(recentYearHearingDifficultyData, group) : {};
      });
    const filteredRecentHearingDifficulty = recentYearHearingDifficultyData.values.filter(d => d["ID Hearing Disability Status"] === 0);

    // Find Top Female Vision disability Data
    const femaleMajorityHearingDifficulty = filteredRecentHearingDifficulty.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share);
    const topFemaleHearingDifficultyData = femaleMajorityHearingDifficulty[0];

    // Find Top Female Vision disability Data
    const maleMajorityHearingDifficulty = filteredRecentHearingDifficulty.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share);
    const topMaleHearingDifficultyData = maleMajorityHearingDifficulty[0];

    return (
      <SectionColumns>
        <SectionTitle>Hearing Difficulty</SectionTitle>
        <article>
          <Stat 
            title={`Male majority Vision Difficulty in ${topMaleVisionDifficultyData.Year}`}
            value={`${rangeFormatter(topMaleVisionDifficultyData.Age)} ${formatPopulation(topMaleVisionDifficultyData.share)}`}
          />  
          <Stat 
            title={`Female majority Vision Difficulty in ${topFemaleVisionDifficultyData.Year}`}
            value={`${rangeFormatter(topFemaleVisionDifficultyData.Age)} ${formatPopulation(topFemaleVisionDifficultyData.share)}`}
          />
          <Stat 
            title={`Male majority Hearing Difficulty in ${topMaleHearingDifficultyData.Year}`}
            value={`${rangeFormatter(topMaleHearingDifficultyData.Age)} ${formatPopulation(topMaleHearingDifficultyData.share)}`}
          />
          <Stat 
            title={`Female majority Hearing Difficulty in ${topFemaleHearingDifficultyData.Year}`}
            value={`${rangeFormatter(topFemaleHearingDifficultyData.Age)} ${formatPopulation(topFemaleHearingDifficultyData.share)}`}
          />
          {/* <p>In {ageGroupYear}, the age groups most likely to have difficulty in hearing in the {maleHearingDifficultyCoverageData[0].County} county are {topMaleAgeGroup} and {topFemaleAgeGroup} years, for men and women respectively.</p>
          <p>The BarChart here shows the male and female age group percentage with difficulty in hearing in the {maleHearingDifficultyCoverageData[0].County} county.</p> */}
        </article>

        <BarChart config={{
          data: visionAndHearingData,
          discrete: "x",
          height: 400,
          stacked: true,
          groupBy: ["disabilityType", "Sex"],
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

HearingAndVisionDifficulty.defaultProps = {
  slug: "hearing-difficulty"
};

HearingAndVisionDifficulty.need = [
  fetchData("hearingDifficulty", "/api/data?measures=Population&drilldowns=Hearing%20Disability%20Status,Age,Sex&County=<id>&Year=all", d => d.data),
  fetchData("visionDifficulty", "/api/data?measures=Population&drilldowns=Vision%20Disability%20Status,Age,Sex&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  hearingDifficulty: state.data.hearingDifficulty,
  visionDifficulty: state.data.visionDifficulty
});

export default connect(mapStateToProps)(HearingAndVisionDifficulty);

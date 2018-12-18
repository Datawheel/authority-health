import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import rangeFormatter from "../../../../utils/rangeFormatter";
import Stat from "../../../../components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class HearingAndAuditoryDisabilities extends SectionColumns {

  render() {
    const {hearingDifficulty, visionDifficulty} = this.props;
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
        <SectionTitle>Vision & Auditory Disabilities</SectionTitle>
        <article>

          <h3>Vision Difficulty</h3>
          <Stat
            title="Male majority"
            year={topMaleVisionDifficultyData.Year}
            value={rangeFormatter(topMaleVisionDifficultyData.Age)}
            qualifier={formatPopulation(topMaleVisionDifficultyData.share)}
            theme="terra-cotta-dark"
          />
          <Stat
            title="Female majority"
            year={topFemaleVisionDifficultyData.Year}
            value={rangeFormatter(topFemaleVisionDifficultyData.Age)}
            qualifier={formatPopulation(topFemaleVisionDifficultyData.share)}
          />

          <h3>Hearing Difficulty</h3>
          <Stat
            title="Male majority "
            year={topMaleHearingDifficultyData.Year}
            value={rangeFormatter(topMaleHearingDifficultyData.Age)}
            qualifier={formatPopulation(topMaleHearingDifficultyData.share)}
            theme="terra-cotta-dark"
          />
          <Stat
            title="Female majority"
            year={topFemaleHearingDifficultyData.Year}
            value={rangeFormatter(topFemaleHearingDifficultyData.Age)}
            qualifier={formatPopulation(topFemaleHearingDifficultyData.share)}
          />

          <p>In {topMaleVisionDifficultyData.Year}, the age groups most likely to have difficulty in seeing in {topMaleVisionDifficultyData.Geography} County are {rangeFormatter(topMaleVisionDifficultyData.Age)} years and {rangeFormatter(topFemaleVisionDifficultyData.Age)} years for men and women respectively. In comparison, the age groups most likely to have difficulty in hearing are {rangeFormatter(topMaleHearingDifficultyData.Age)} years and {rangeFormatter(topFemaleHearingDifficultyData.Age)} years for men and women respectively.</p>
          <p>The chart here shows the share of each male and female age group with difficulty in hearing and seeing in {topMaleVisionDifficultyData.Geography} County.</p>
        </article>

        <BarChart config={{
          data: visionAndHearingData,
          discrete: "x",
          height: 400,
          stacked: true,
          // label: d => `${d.Sex} with ${d.disabilityType}`,
          label: d => d.disabilityType instanceof Array ? d.Sex : d.disabilityType,
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

HearingAndAuditoryDisabilities.defaultProps = {
  slug: "hearing-and-auditory-disabilities"
};

HearingAndAuditoryDisabilities.need = [
  fetchData("hearingDifficulty", "/api/data?measures=Population&drilldowns=Hearing Disability Status,Age,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("visionDifficulty", "/api/data?measures=Population&drilldowns=Vision Disability Status,Age,Sex&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  hearingDifficulty: state.data.hearingDifficulty,
  visionDifficulty: state.data.visionDifficulty
});

export default connect(mapStateToProps)(HearingAndAuditoryDisabilities);

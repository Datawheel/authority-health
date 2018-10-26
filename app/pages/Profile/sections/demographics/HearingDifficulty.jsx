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

class HearingDifficulty extends SectionColumns {

  render() {
    const {hearingDifficulty} = this.props;
    console.log("hearingDifficulty: ", hearingDifficulty);

    const recentYearHearingDifficultyData = {};
    nest()
      .key(d => d.Year)
      .entries(hearingDifficulty)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= hearingDifficulty[0].Year ? Object.assign(recentYearHearingDifficultyData, group) : {};
      });

    const data = hearingDifficulty.filter(d => d["ID Hearing Disability Status"] === 0);

    const filteredRecentYearData = recentYearHearingDifficultyData.values.filter(d => d["ID Hearing Disability Status"] === 0);
    const femaleHearingDifficultyData = filteredRecentYearData.filter(d => d.Sex === "Female").sort((a, b) => b.Population - a.Population);
    const topFemaleAgeGroup = rangeFormatter(femaleHearingDifficultyData[0].Age);

    const maleHearingDifficultyCoverageData = filteredRecentYearData.filter(d => d.Sex === "Male").sort((a, b) => b.Population - a.Population);
    const topMaleAgeGroup = rangeFormatter(maleHearingDifficultyCoverageData[0].Age);
    const ageGroupYear = maleHearingDifficultyCoverageData[0].Year;

    return (
      <SectionColumns>
        <SectionTitle>Hearing Difficulty</SectionTitle>
        <article>
          <Stat 
            title={`Male majority in ${ageGroupYear}`}
            value={topMaleAgeGroup}
          />
          <Stat 
            title={`Female majority in ${ageGroupYear}`}
            value={topFemaleAgeGroup}
          />
          <p>In {ageGroupYear}, the age groups most likely to have difficulty in hearing in the {maleHearingDifficultyCoverageData[0].County} county are {topMaleAgeGroup} and {topFemaleAgeGroup} years, for men and women respectively.</p>
          <p>The BarChart here shows the male and female age group percentage with difficulty in hearing in the {maleHearingDifficultyCoverageData[0].County} county.</p>
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

HearingDifficulty.defaultProps = {
  slug: "hearing-difficulty"
};

HearingDifficulty.need = [
  fetchData("hearingDifficulty", "/api/data?measures=Population&drilldowns=Hearing%20Disability%20Status,Age,Sex&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  hearingDifficulty: state.data.hearingDifficulty
});

export default connect(mapStateToProps)(HearingDifficulty);

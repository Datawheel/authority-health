import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import rangeFormatter from "utils/rangeFormatter";
import Stat from "components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;
const formatDisabilityName = d => d === "visionDifficulty" ? "Vision Difficulty" : "Hearing Difficulty";

class VisionAndAuditoryDisabilities extends SectionColumns {

  render() {
    const {meta, hearingDifficulty, visionDifficulty} = this.props;

    const hearingDifficultyDataAvailable = hearingDifficulty.length !== 0;
    const visionDifficultyDataAvailable = visionDifficulty.length !== 0;

    const visionAndHearingData = [];

    const recentYearVisionDifficultyData = {};
    let topFemaleVisionDifficultyData, topMaleVisionDifficultyData;
    if (visionDifficultyDataAvailable) {
      nest()
        .key(d => d.Year)
        .entries(visionDifficulty)
        .forEach(group => {
          const total = sum(group.values, d => d["Vision Disabilities"]);
          group.values.forEach(d => {
            if (d["ID Vision Disability Status"] === 0) {
              total !== 0 ? d.share = d["Vision Disabilities"] / total * 100 : d.share = 0;
              d.disabilityType = "visionDifficulty";
              visionAndHearingData.push(d);
            }
          });
          group.key >= visionDifficulty[0].Year ? Object.assign(recentYearVisionDifficultyData, group) : {};
        });
      const filteredRecentVisionDifficulty = recentYearVisionDifficultyData.values.filter(d => d["ID Vision Disability Status"] === 0);
      // Find Top Female Vision disability Data
      topFemaleVisionDifficultyData = filteredRecentVisionDifficulty.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share)[0];
      // Find Top Female Vision disability Data
      topMaleVisionDifficultyData = filteredRecentVisionDifficulty.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share)[0];
    }

    const recentYearHearingDifficultyData = {};
    let topFemaleHearingDifficultyData, topMaleHearingDifficultyData;
    if (hearingDifficultyDataAvailable) {
      nest()
        .key(d => d.Year)
        .entries(hearingDifficulty)
        .forEach(group => {
          const total = sum(group.values, d => d["Hearing Disabilities"]);
          group.values.forEach(d => {
            if (d["ID Hearing Disability Status"] === 0) {
              total !== 0 ? d.share = d["Hearing Disabilities"] / total * 100 : d.share = 0;
              d.disabilityType = "hearingDifficulty";
              visionAndHearingData.push(d);
            }
          });
          group.key >= hearingDifficulty[0].Year ? Object.assign(recentYearHearingDifficultyData, group) : {};
        });
      const filteredRecentHearingDifficulty = recentYearHearingDifficultyData.values.filter(d => d["ID Hearing Disability Status"] === 0);
      // Find Top Female Vision disability Data
      topFemaleHearingDifficultyData = filteredRecentHearingDifficulty.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share)[0];
      // Find Top Female Vision disability Data
      topMaleHearingDifficultyData = filteredRecentHearingDifficulty.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share)[0];
    }

    return (
      <SectionColumns>
        <SectionTitle>Vision & Auditory Disabilities</SectionTitle>
        <article>

          <h3>Vision Difficulty</h3>
          <Stat
            title="Male majority"
            year={visionDifficultyDataAvailable ? topMaleVisionDifficultyData.Year : visionDifficultyDataAvailable}
            value={visionDifficultyDataAvailable ? rangeFormatter(topMaleVisionDifficultyData.Age) : "N/A"}
            qualifier={visionDifficultyDataAvailable ? formatPopulation(topMaleVisionDifficultyData.share) : ""}
            theme="terra-cotta-dark"
          />
          <Stat
            title="Female majority"
            year={visionDifficultyDataAvailable ? topFemaleVisionDifficultyData.Year : ""}
            value={visionDifficultyDataAvailable ? rangeFormatter(topFemaleVisionDifficultyData.Age) : "N/A"}
            qualifier={visionDifficultyDataAvailable ? formatPopulation(topFemaleVisionDifficultyData.share) : ""}
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
            year={hearingDifficultyDataAvailable ? topFemaleHearingDifficultyData.Year : ""}
            value={hearingDifficultyDataAvailable ? rangeFormatter(topFemaleHearingDifficultyData.Age) : "N/A"}
            qualifier={hearingDifficultyDataAvailable ? formatPopulation(topFemaleHearingDifficultyData.share) : ""}
          />

          <p>
            {visionDifficultyDataAvailable ? <span>In {topMaleVisionDifficultyData.Year}, the age groups most likely to have difficulty in seeing in { }
              {topMaleVisionDifficultyData.Geography} are {rangeFormatter(topMaleVisionDifficultyData.Age)} years and {rangeFormatter(topFemaleVisionDifficultyData.Age)} { }
            years for men and women respectively.</span> : ""} In comparison, the age groups most likely to have difficulty in hearing are  { }
            {hearingDifficultyDataAvailable ? rangeFormatter(topMaleHearingDifficultyData.Age) : "N/A"} years and  { }
            {hearingDifficultyDataAvailable ? rangeFormatter(topFemaleHearingDifficultyData.Age) : ""} years for men and women respectively.
          </p>
          <p>The chart here shows the share of each male and female age group with difficulty in hearing and seeing {visionDifficultyDataAvailable ? ` in ${topMaleVisionDifficultyData.Geography}` : "N/A"}.</p>
          <Contact slug={this.props.slug} />
        </article>

        {hearingDifficultyDataAvailable || topMaleVisionDifficultyData
          ? <BarChart config={{
            data: visionAndHearingData,
            discrete: "x",
            height: 400,
            stacked: true,
            label: d => d.disabilityType instanceof Array ? d.Sex : formatDisabilityName(d.disabilityType),
            groupBy: ["disabilityType", "Sex"],
            x: d => d.Age,
            y: "share",
            time: "Year",
            xSort: (a, b) => a["ID Age"] - b["ID Age"],
            xConfig: {
              labelRotation: false,
              tickFormat: d => rangeFormatter(d),
              title: "Age distribution"
            },
            yConfig: {tickFormat: d => formatPopulation(d)},
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Gender", d => d.Sex], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          /> : <div></div>}
      </SectionColumns>
    );
  }
}

VisionAndAuditoryDisabilities.defaultProps = {
  slug: "vision-and-auditory-disabilities"
};

VisionAndAuditoryDisabilities.need = [
  // both hearing and vision difficulty data are from different cubes. We need to combine these data for chart. Hence, all Year data is fetched in need.
  fetchData("hearingDifficulty", "/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Age,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("visionDifficulty", "/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Age,Sex&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  hearingDifficulty: state.data.hearingDifficulty,
  visionDifficulty: state.data.visionDifficulty
});

export default connect(mapStateToProps)(VisionAndAuditoryDisabilities);

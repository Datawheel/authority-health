import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import rangeFormatter from "utils/rangeFormatter";
import Stat from "components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

const formatVisionDifficultyData = visionDifficulty => {
  nest()
    .key(d => d.Year)
    .entries(visionDifficulty)
    .forEach(group => {
      const total = sum(group.values, d => d["Vision Disabilities"]);
      group.values.forEach(d => {
        total !== 0 ? d.share = d["Vision Disabilities"] / total * 100 : d.share = 0;
      });
    });
  const filteredVisionDifficulty = visionDifficulty.filter(d => d["ID Vision Disability Status"] === 0);
  const topFemaleVisionDifficultyData = filteredVisionDifficulty.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share)[0];
  const topMaleVisionDifficultyData = filteredVisionDifficulty.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share)[0];
  return [filteredVisionDifficulty, topFemaleVisionDifficultyData, topMaleVisionDifficultyData];
};

const formatHearingDifficultyData = hearingDifficulty => {
  nest()
    .key(d => d.Year)
    .entries(hearingDifficulty)
    .forEach(group => {
      const total = sum(group.values, d => d["Hearing Disabilities"]);
      group.values.forEach(d => {
        total !== 0 ? d.share = d["Hearing Disabilities"] / total * 100 : d.share = 0;
      });
    });
  const filteredHearingDifficulty = hearingDifficulty.filter(d => d["ID Hearing Disability Status"] === 0);
  const topFemaleHearingDifficultyData = filteredHearingDifficulty.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share)[0];
  const topMaleHearingDifficultyData = filteredHearingDifficulty.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share)[0];
  return [filteredHearingDifficulty, topFemaleHearingDifficultyData, topMaleHearingDifficultyData];
};

class VisionAndAuditoryDisabilities extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta,
      dropdownValue: "Vision Difficulty",
      hearingDifficulty: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    if (dropdownValue === "Hearing Difficulty") {
      axios.get(`/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Age,Sex&Geography=${this.state.meta.id}&Year=latest`)
        .then(resp => {
          this.setState({
            hearingDifficulty: resp.data.data,
            dropdownValue
          });
        });
    }
    else this.setState({dropdownValue});
  }

  render() {
    const {dropdownValue, hearingDifficulty} = this.state;
    const {meta, visionDifficulty} = this.props;

    const dropdownList = ["Vision Difficulty", "Hearing Difficulty"];

    const isVisionDifficultySelected = dropdownValue === "Vision Difficulty";
    const hearingDifficultyDataAvailable = hearingDifficulty.length !== 0;
    const visionDifficultyDataAvailable = visionDifficulty.length !== 0;

    let topFemaleVisionDifficultyData, topMaleVisionDifficultyData;
    if (isVisionDifficultySelected && visionDifficultyDataAvailable) {
      const topVisionDifficulty = formatVisionDifficultyData(visionDifficulty);
      topFemaleVisionDifficultyData = topVisionDifficulty[1];
      topMaleVisionDifficultyData = topVisionDifficulty[2];
    }

    let topFemaleHearingDifficultyData, topMaleHearingDifficultyData;
    if (!isVisionDifficultySelected && hearingDifficultyDataAvailable) {
      const topHearingDifficulty = formatHearingDifficultyData(hearingDifficulty);
      topFemaleHearingDifficultyData = topHearingDifficulty[1];
      topMaleHearingDifficultyData = topHearingDifficulty[2];
    }

    return (
      <SectionColumns>
        <SectionTitle>Vision & Auditory Disabilities</SectionTitle>
        <article>
          {/* Create a dropdown for total immigrants and immigrants in poverty choices. */}
          <label className="pt-label pt-inline" htmlFor="health-center-dropdown">
            Show data for
            <div className="pt-select">
              <select id="health-center-dropdown" onChange={this.handleChange}>
                {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </label>

          {isVisionDifficultySelected 
            ? <div>
              <Stat
                title="Male majority age group"
                year={visionDifficultyDataAvailable ? topMaleVisionDifficultyData.Year : "N/A"}
                value={visionDifficultyDataAvailable ? rangeFormatter(topMaleVisionDifficultyData.Age) : "N/A"}
                qualifier={visionDifficultyDataAvailable ? `${formatPopulation(topMaleVisionDifficultyData.share)} of the male population in ${topMaleVisionDifficultyData.Geography}` : ""}
              />
              <Stat
                title="Female majority age group"
                year={visionDifficultyDataAvailable ? topFemaleVisionDifficultyData.Year : ""}
                value={visionDifficultyDataAvailable ? rangeFormatter(topFemaleVisionDifficultyData.Age) : "N/A"}
                qualifier={visionDifficultyDataAvailable ? `${formatPopulation(topFemaleVisionDifficultyData.share)} of the female population in ${topFemaleVisionDifficultyData.Geography}` : ""}
              />
            </div>
            : <div>
              <Stat
                title="Male majority age group"
                year={hearingDifficultyDataAvailable ? topMaleHearingDifficultyData.Year : ""}
                value={hearingDifficultyDataAvailable ? rangeFormatter(topMaleHearingDifficultyData.Age) : "N/A"}
                qualifier={hearingDifficultyDataAvailable ? `${formatPopulation(topMaleHearingDifficultyData.share)} of the male population in ${topMaleHearingDifficultyData.Geography}` : ""}
              />
              <Stat
                title="Female majority age group"
                year={hearingDifficultyDataAvailable ? topFemaleHearingDifficultyData.Year : ""}
                value={hearingDifficultyDataAvailable ? rangeFormatter(topFemaleHearingDifficultyData.Age) : "N/A"}
                qualifier={hearingDifficultyDataAvailable ? `${formatPopulation(topFemaleHearingDifficultyData.share)} of the female population in ${topFemaleHearingDifficultyData.Geography}` : ""}
              />
            </div>
          }

          {isVisionDifficultySelected 
            ? <p>
              {visionDifficultyDataAvailable ? <span>In {topMaleVisionDifficultyData.Year}, the age groups most likely to have difficulty in seeing in { }
                {topMaleVisionDifficultyData.Geography} were {rangeFormatter(topMaleVisionDifficultyData.Age)} years for men and {rangeFormatter(topFemaleVisionDifficultyData.Age)} { }
            years for women.</span> : ""}
            </p>
            : <p>
              {hearingDifficultyDataAvailable ? <span>In {topMaleHearingDifficultyData.Year}, the age groups most likely to have difficulty in hearing in { }
                {topMaleHearingDifficultyData.Geography} were {rangeFormatter(topMaleHearingDifficultyData.Age)} years for men and {rangeFormatter(topFemaleHearingDifficultyData.Age)} { }
           years for women.</span> : ""}
            </p>}
          {isVisionDifficultySelected 
            ? <p>The chart here shows the share of each male and female age group with difficulty in seeing {visionDifficultyDataAvailable ? ` in ${topMaleVisionDifficultyData.Geography}` : ""}.</p>
            : <p>The chart here shows the share of each male and female age group with difficulty in hearing {hearingDifficultyDataAvailable ? ` in ${topMaleHearingDifficultyData.Geography}` : ""}.</p>
          }
          <Contact slug={this.props.slug} />
        </article>

        {isVisionDifficultySelected && visionDifficultyDataAvailable
          ? <BarChart config={{
            data: `/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Age,Sex&Geography=${meta.id}&Year=all`,
            discrete: "x",
            groupBy: "Sex",
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", "Vision Difficulty"], ["Age", d => d.Age], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => formatVisionDifficultyData(resp.data)[0]}
          /> 
          : <div></div>}

        {!isVisionDifficultySelected && hearingDifficultyDataAvailable
          ? <BarChart config={{
            data: `/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Age,Sex&Geography=${meta.id}&Year=all`,
            discrete: "x",
            groupBy: "Sex",
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", "Hearing Difficulty"], ["Age", d => d.Age], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => formatHearingDifficultyData(resp.data)[0]}
          /> 
          : <div></div>}
      </SectionColumns>
    );
  }
}

VisionAndAuditoryDisabilities.defaultProps = {
  slug: "vision-and-auditory-disabilities"
};

VisionAndAuditoryDisabilities.need = [
  // both hearing and vision difficulty data are from different cubes. We need to combine these data for Stats. Hence, all Year data is fetched in need.
  fetchData("visionDifficulty", "/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Age,Sex&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  visionDifficulty: state.data.visionDifficulty
});

export default connect(mapStateToProps)(VisionAndAuditoryDisabilities);

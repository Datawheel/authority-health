import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import rangeFormatter from "utils/rangeFormatter";
import Stat from "components/Stat";
import places from "utils/places";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatData = (data, disability = "Vision") => {
  nest()
    .key(d => d.Year)
    .entries(data)
    .forEach(group => {
      const total = sum(group.values, d => d[`${disability} Disabilities`]);
      group.values.forEach(d => {
        total !== 0 ? d.share = d[`${disability} Disabilities`] / total * 100 : d.share = 0;
      });
    });
  const filteredData = data.filter(d => d[`ID ${disability} Disability Status`] === 0);
  const topFemaleData = filteredData.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share)[0];
  const topMaleData = filteredData.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share)[0];
  return [filteredData, topFemaleData, topMaleData];
};

const formatGeomapData = (data, disability = "Vision") => {
  nest()
    .key(d => d.Year)
    .entries(data)
    .forEach(group => {
      const total = sum(group.values, d => d[`${disability} Disabilities`]);
      group.values.forEach(d => {
        total !== 0 ? d.share = d[`${disability} Disabilities`] / total * 100 : d.share = 0;
      });
    });
  const filteredHearingDifficulty = data.filter(d => d[`ID ${disability} Disability Status`] === 0);
  return filteredHearingDifficulty;
};

const getGeomapDataURL = (meta, disability = "Vision") => {
  if (meta.level === "county") return `/api/data?measures=${disability} Disabilities&drilldowns=${disability} Disability Status,Place&Year=all`;
  if (meta.level === "place") return `/api/data?measures=${disability} Disabilities&drilldowns=${disability} Disability Status,Tract&Geography=${meta.id}:children&Year=all`;
  if (meta.level === "zip") return `/api/data?measures=${disability} Disabilities&drilldowns=${disability} Disability Status,Tract&Geography=${meta.id}:children&Year=all`;
  return `/api/data?measures=${disability} Disabilities&drilldowns=${disability} Disability Status,Tract&Year=all`;
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
    const {meta, dropdownValue, hearingDifficulty} = this.state;
    const {visionDifficulty} = this.props;

    const dropdownList = ["Vision Difficulty", "Hearing Difficulty"];

    const isVisionDifficultySelected = dropdownValue === "Vision Difficulty";
    const hearingDifficultyDataAvailable = hearingDifficulty.length !== 0;
    const visionDifficultyDataAvailable = visionDifficulty.length !== 0;

    let topFemaleVisionDifficultyData, topMaleVisionDifficultyData;
    if (isVisionDifficultySelected && visionDifficultyDataAvailable) {
      const topVisionDifficulty = formatData(visionDifficulty, "Vision");
      topFemaleVisionDifficultyData = topVisionDifficulty[1];
      topMaleVisionDifficultyData = topVisionDifficulty[2];
    }

    let topFemaleHearingDifficultyData, topMaleHearingDifficultyData;
    if (!isVisionDifficultySelected && hearingDifficultyDataAvailable) {
      const topHearingDifficulty = formatData(hearingDifficulty, "Hearing");
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
                qualifier={visionDifficultyDataAvailable ? `${formatPercentage(topMaleVisionDifficultyData.share)} of the population in ${topMaleVisionDifficultyData.Geography}` : ""}
              />
              <Stat
                title="Female majority age group"
                year={visionDifficultyDataAvailable ? topFemaleVisionDifficultyData.Year : ""}
                value={visionDifficultyDataAvailable ? rangeFormatter(topFemaleVisionDifficultyData.Age) : "N/A"}
                qualifier={visionDifficultyDataAvailable ? `${formatPercentage(topFemaleVisionDifficultyData.share)} of the population in ${topFemaleVisionDifficultyData.Geography}` : ""}
              />
            </div>
            : <div>
              <Stat
                title="Male majority age group"
                year={hearingDifficultyDataAvailable ? topMaleHearingDifficultyData.Year : ""}
                value={hearingDifficultyDataAvailable ? rangeFormatter(topMaleHearingDifficultyData.Age) : "N/A"}
                qualifier={hearingDifficultyDataAvailable ? `${formatPercentage(topMaleHearingDifficultyData.share)} of the population in ${topMaleHearingDifficultyData.Geography}` : ""}
              />
              <Stat
                title="Female majority age group"
                year={hearingDifficultyDataAvailable ? topFemaleHearingDifficultyData.Year : ""}
                value={hearingDifficultyDataAvailable ? rangeFormatter(topFemaleHearingDifficultyData.Age) : "N/A"}
                qualifier={hearingDifficultyDataAvailable ? `${formatPercentage(topFemaleHearingDifficultyData.share)} of the population in ${topFemaleHearingDifficultyData.Geography}` : ""}
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
          {isVisionDifficultySelected && visionDifficultyDataAvailable
            ? <BarChart config={{
              data: `/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Age,Sex&Geography=${meta.id}&Year=all`,
              height: 250,
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
              yConfig: {tickFormat: d => formatPercentage(d)},
              shapeConfig: {
                label: false
              },
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", "Vision Difficulty"], ["Age", d => d.Age], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => formatData(resp.data, "Vision")[0]}
            /> 
            : <div></div>}

          {!isVisionDifficultySelected && hearingDifficultyDataAvailable
            ? <BarChart config={{
              data: `/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Age,Sex&Geography=${meta.id}&Year=latest`,
              height: 250,
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
              yConfig: {tickFormat: d => formatPercentage(d)},
              shapeConfig: {
                label: false
              },
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", "Hearing Difficulty"], ["Age", d => d.Age], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => formatData(resp.data, "Hearing")[0]}
            /> 
            : <div></div>}
          <Contact slug={this.props.slug} />
        </article>

        
        <Geomap config={{
          // data: isVisionDifficultySelected ? "/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Place&Year=all" : "/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Place&Year=all",
          data: `/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Tract&Geography=${meta.id}:children&Year=all`,
          groupBy: "ID Place",
          colorScale: "share",
          colorScaleConfig: {axisConfig: {tickFormat: d => formatPercentage(d)}},
          title: `Population With ${isVisionDifficultySelected ? "Vision" : "Hearing"} Difficulty for Places in Wayne County`,
          time: "Year",
          // label: d => d.Place,
          label: d => d.Tract,
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Population", dropdownValue], ["Share", d => formatPercentage(d.share)]]},
          // topojson: "/topojson/place.json",
          topojson: "/topojson/tract.json",
          topojsonId: d => d.id,
          topojsonFilter: d => d.id.startsWith("14000US26163")
          // topojsonFilter: d => places.includes(d.id)
        }}
        dataFormat={resp => {
          console.log(resp.data);
          return isVisionDifficultySelected ? formatGeomapData(resp.data, "Vision") : formatGeomapData(resp.data, "Hearing"); 
        }}
        />
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

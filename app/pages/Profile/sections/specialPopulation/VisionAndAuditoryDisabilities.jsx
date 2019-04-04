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
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatTractName = (tractName, cityName) => cityName === undefined ? tractName : `${tractName}, ${cityName}`;

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
  const filteredHearingDisability = data.filter(d => d[`ID ${disability} Disability Status`] === 0);
  return filteredHearingDisability;
};

class VisionAndAuditoryDisabilities extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta,
      dropdownValue: "Vision Disability",
      hearingDisability: [],
      sources: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    if (dropdownValue === "Hearing Disability") {
      axios.get(`/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Age,Sex&Geography=${this.state.meta.id}&Year=latest`)
        .then(resp => {
          this.setState({
            hearingDisability: resp.data.data,
            dropdownValue
          });
        });
    }
    else this.setState({dropdownValue});
  }

  render() {
    const {meta, dropdownValue, hearingDisability} = this.state;
    const {childrenTractIds, visionDisability} = this.props;
    const {tractToPlace} = this.props.topStats;

    const dropdownList = ["Vision Disability", "Hearing Disability"];

    const isVisionDisabilitySelected = dropdownValue === "Vision Disability";
    const hearingDisabilityDataAvailable = hearingDisability.length !== 0;
    const visionDisabilityDataAvailable = visionDisability.length !== 0;

    let topFemaleVisionDisabilityData, topMaleVisionDisabilityData;
    if (isVisionDisabilitySelected && visionDisabilityDataAvailable) {
      const topVisionDisability = formatData(visionDisability, "Vision");
      topFemaleVisionDisabilityData = topVisionDisability[1];
      topMaleVisionDisabilityData = topVisionDisability[2];
    }

    let topFemaleHearingDisabilityData, topMaleHearingDisabilityData;
    if (!isVisionDisabilitySelected && hearingDisabilityDataAvailable) {
      const topHearingDisability = formatData(hearingDisability, "Hearing");
      topFemaleHearingDisabilityData = topHearingDisability[1];
      topMaleHearingDisabilityData = topHearingDisability[2];
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

          {isVisionDisabilitySelected 
            ? <div>
              <Stat
                title="Male majority age group"
                year={visionDisabilityDataAvailable ? topMaleVisionDisabilityData.Year : "N/A"}
                value={visionDisabilityDataAvailable ? rangeFormatter(topMaleVisionDisabilityData.Age) : "N/A"}
                qualifier={visionDisabilityDataAvailable ? `${formatPercentage(topMaleVisionDisabilityData.share)} of the population in ${topMaleVisionDisabilityData.Geography}` : ""}
              />
              <Stat
                title="Female majority age group"
                year={visionDisabilityDataAvailable ? topFemaleVisionDisabilityData.Year : ""}
                value={visionDisabilityDataAvailable ? rangeFormatter(topFemaleVisionDisabilityData.Age) : "N/A"}
                qualifier={visionDisabilityDataAvailable ? `${formatPercentage(topFemaleVisionDisabilityData.share)} of the population in ${topFemaleVisionDisabilityData.Geography}` : ""}
              />
            </div>
            : <div>
              <Stat
                title="Male majority age group"
                year={hearingDisabilityDataAvailable ? topMaleHearingDisabilityData.Year : ""}
                value={hearingDisabilityDataAvailable ? rangeFormatter(topMaleHearingDisabilityData.Age) : "N/A"}
                qualifier={hearingDisabilityDataAvailable ? `${formatPercentage(topMaleHearingDisabilityData.share)} of the population in ${topMaleHearingDisabilityData.Geography}` : ""}
              />
              <Stat
                title="Female majority age group"
                year={hearingDisabilityDataAvailable ? topFemaleHearingDisabilityData.Year : ""}
                value={hearingDisabilityDataAvailable ? rangeFormatter(topFemaleHearingDisabilityData.Age) : "N/A"}
                qualifier={hearingDisabilityDataAvailable ? `${formatPercentage(topFemaleHearingDisabilityData.share)} of the population in ${topFemaleHearingDisabilityData.Geography}` : ""}
              />
            </div>
          }

          {isVisionDisabilitySelected 
            ? <p>
              {visionDisabilityDataAvailable ? <span>In {topMaleVisionDisabilityData.Year}, the age groups most likely to have vision disability in { }
                {topMaleVisionDisabilityData.Geography} were {rangeFormatter(topMaleVisionDisabilityData.Age)} years for men and {rangeFormatter(topFemaleVisionDisabilityData.Age)} { }
            years for women.</span> : ""}
            </p>
            : <p>
              {hearingDisabilityDataAvailable ? <span>In {topMaleHearingDisabilityData.Year}, the age groups most likely to have hearing disability in { }
                {topMaleHearingDisabilityData.Geography} were {rangeFormatter(topMaleHearingDisabilityData.Age)} years for men and {rangeFormatter(topFemaleHearingDisabilityData.Age)} { }
           years for women.</span> : ""}
            </p>}

          {isVisionDisabilitySelected && visionDisabilityDataAvailable
            ? <BarChart config={{
              data: `/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Age,Sex&Geography=${meta.id}&Year=all`,
              height: 250,
              discrete: "x",
              groupBy: "Sex",
              x: d => d.Age,
              y: "share",
              time: "Year",
              title: d => `${dropdownValue} by Age and Gender in ${d[0].Geography}`,
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
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", "Vision Disability"], ["Age", d => d.Age], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatData(resp.data, "Vision")[0];
            }}
            /> 
            : <div></div>}

          {!isVisionDisabilitySelected && hearingDisabilityDataAvailable
            ? <BarChart config={{
              data: `/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Age,Sex&Geography=${meta.id}&Year=latest`,
              height: 250,
              discrete: "x",
              groupBy: "Sex",
              x: d => d.Age,
              y: "share",
              time: "Year",
              title: d => `${dropdownValue} by Age and Gender in ${d[0].Geography}`,
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
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", "Hearing Disability"], ["Age", d => d.Age], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatData(resp.data, "Hearing")[0];
            }}
            /> 
            : <div></div>}
          <Contact slug={this.props.slug} />
          <SourceGroup sources={this.state.sources} />
        </article>

        {meta.level === "county"
          ? <Geomap config={{
            data: isVisionDisabilitySelected ? "/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Place&Year=all" : "/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Place&Year=all",
            groupBy: "ID Place",
            colorScale: "share",
            colorScaleConfig: {axisConfig: {tickFormat: d => formatPercentage(d)}},
            title: `${dropdownValue} Population by Places in Wayne County`,
            time: "Year",
            label: d => d.Place,
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", dropdownValue], ["Share", d => formatPercentage(d.share)]]},
            topojson: "/topojson/place.json",
            topojsonId: d => d.id,
            topojsonFilter: d => places.includes(d.id)
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return isVisionDisabilitySelected ? formatGeomapData(resp.data, "Vision") : formatGeomapData(resp.data, "Hearing");
          }}
          />
          : <div></div>}

        {meta.level === "place" || meta.level === "zip"
          ? <Geomap config={{
            data: isVisionDisabilitySelected ? "/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status&Geography=05000US26163:tracts&Year=all" : "/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status&Geography=05000US26163:tracts&Year=all",
            groupBy: "ID Geography",
            label: d => `${d.Geography}, ${meta.name}`,
            colorScale: "share",
            colorScaleConfig: {axisConfig: {tickFormat: d => formatPercentage(d)}},
            title: `${dropdownValue} Population by Tracts in ${meta.name}`,
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", dropdownValue], ["Share", d => formatPercentage(d.share)]]},
            topojson: "/topojson/tract.json",
            topojsonId: d => d.id,
            topojsonFilter: d => childrenTractIds.includes(d.id)
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return isVisionDisabilitySelected ? formatGeomapData(resp.data, "Vision") : formatGeomapData(resp.data, "Hearing");
          }}
          />
          : <div></div>}

        {/* Geomap to show Property Values for all tracts in the Wayne County. */}
        {meta.level === "tract" 
          ? <Geomap config={{
            data: isVisionDisabilitySelected ? "/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status&Geography=05000US26163:tracts&Year=all" : "/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status&Geography=05000US26163:tracts&Year=all",
            groupBy: "ID Geography",
            label: d => formatTractName(d.Geography, tractToPlace[d["ID Geography"]]),
            title: `${dropdownValue} Population by Tracts in Wayne County`,
            colorScale: "share",
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", dropdownValue], ["Share", d => formatPercentage(d.share)]]},
            topojson: "/topojson/tract.json",
            topojsonId: d => d.id,
            topojsonFilter: d => d.id.startsWith("14000US26163")
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return isVisionDisabilitySelected ? formatGeomapData(resp.data, "Vision") : formatGeomapData(resp.data, "Hearing");
          }}
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
  fetchData("childrenTractIds", "/api/geo/children/<id>/?level=Tract"),
  fetchData("visionDisability", "/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Age,Sex&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  childrenTractIds: state.data.childrenTractIds,
  visionDisability: state.data.visionDisability
});

export default connect(mapStateToProps)(VisionAndAuditoryDisabilities);

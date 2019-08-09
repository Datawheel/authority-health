import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import axios from "axios";
import {color} from "d3-color";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import styles from "style.yml";

import Contact from "components/Contact";
import rangeFormatter from "utils/rangeFormatter";
import Stat from "components/Stat";
import StatGroup from "components/StatGroup";
import places from "utils/places";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import CensusTractDefinition from "components/CensusTractDefinition";
import Glossary from "components/Glossary";
import Options from "components/Options";

const definitions = [
  {term: "Vision Disability", definition: "In the American Housing Survey, a person with a vision disability is blind or has serious difficulty reading or driving due to a visual impairment even when wearing glasses."},
  {term: "Hearing Disability", definition: "In the American Housing Survey, a person with a hearing disability is deaf or has a hearing impairment that makes it very difficult to hear conversations, televisions, or radio broadcasts."}
];

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatTopojsonFilter = (d, meta, childrenTractIds) => {
  if (meta.level === "county") return places.includes(d.id);
  else if (meta.level === "tract") return d.id.startsWith("14000US26163");
  else return childrenTractIds.includes(d.id);
};

const formatTractName = (tractName, cityName) => cityName === undefined ? tractName : `${tractName}, ${cityName}`;
const formatGeomapLabel = (d, meta, tractToPlace) => {
  if (meta.level === "county") return d.Place;
  if (meta.level === "tract") return formatTractName(d.Geography, tractToPlace[d["ID Geography"]]);
  else return `${d.Geography}, ${meta.name}`;
};

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

const formatGeomapData = (data, meta, childrenTractIds, disability = "Vision") => {
  let filteredChildrenGeography = [];
  if (meta.level === "tract") {
    filteredChildrenGeography = data;
  }
  else if (meta.level === "county") {
    data.forEach(d => {
      if (places.includes(d["ID Place"])) filteredChildrenGeography.push(d);
    });
  }
  else {
    data.forEach(d => {
      if (childrenTractIds.includes(d["ID Geography"])) filteredChildrenGeography.push(d);
    });
  }
  nest()
    .key(d => d.Year)
    .entries(filteredChildrenGeography)
    .forEach(group => {
      const total = sum(group.values, d => d[`${disability} Disabilities`]);
      group.values.forEach(d => {
        total !== 0 ? d.share = d[`${disability} Disabilities`] / total * 100 : d.share = 0;
      });
    });
  const filteredHearingDisability = filteredChildrenGeography.filter(d => d[`ID ${disability} Disability Status`] === 0);
  const topRecentYearData = filteredHearingDisability.sort((a, b) => b.share - a.share)[0];
  return [filteredHearingDisability, topRecentYearData];
};

const getGeomapTitle = (meta, disability) => {
  if (meta.level === "county" || meta.level === "tract") return `Location with the highest ${disability} disability in Wayne County`;
  else return `Location with the highest ${disability} disability in ${meta.name}`;
};

const getGeomapQualifier = (data, meta) => {
  if (meta.level === "county") return `${formatPercentage(data.share)} of the population in this city`;
  return `${formatPercentage(data.share)} of the population in this census tract`;
};

class VisionAndAuditoryDisabilities extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta,
      dropdownValue: "Vision Disability",
      hearingDisability: [],
      hearingDisabilityForChildrenGeography: [],
      sources: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    const {meta} = this.state;
    if (dropdownValue === "Hearing Disability") {
      axios.get(`/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Age,Sex&Geography=${meta.id}&Year=latest`)
        .then(resp => {
          axios.get(`/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status&Geography=${meta.id}:children&Year=latest`)
            .then(d => {
              this.setState({
                hearingDisability: resp.data.data,
                hearingDisabilityForChildrenGeography: d.data.data,
                dropdownValue
              });
            });
        });
    }
    else this.setState({dropdownValue});
  }

  render() {
    const {meta, dropdownValue, hearingDisability, hearingDisabilityForChildrenGeography} = this.state;
    const {childrenTractIds, visionDisability, visionDisabilityForChildrenGeography} = this.props;
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

    const topChildrenGeographyStats = isVisionDisabilitySelected
      ? formatGeomapData(visionDisabilityForChildrenGeography, meta, childrenTractIds, "Vision")[1]
      : formatGeomapData(hearingDisabilityForChildrenGeography, meta, childrenTractIds, "Hearing")[1];

    return (
      <SectionColumns>
        <SectionTitle>Vision and Auditory Disabilities</SectionTitle>
        <article>
          {/* Create a dropdown for total immigrants and immigrants in poverty choices. */}
          <label className="pt-label pt-inline" htmlFor="health-center-dropdown">
            Show data for
            <select id="health-center-dropdown" onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          {isVisionDisabilitySelected
            ? <div className="article-inner-container">
              <StatGroup
                title={"Most common age groups with vision disability by gender"}
                year={visionDisabilityDataAvailable ? topMaleVisionDisabilityData.Year : ""}
                stats={[
                  {
                    title: "Female",
                    year: visionDisabilityDataAvailable ? topFemaleVisionDisabilityData.Year : "",
                    value: visionDisabilityDataAvailable && topFemaleVisionDisabilityData.share !== 0 ? rangeFormatter(topFemaleVisionDisabilityData.Age) : "N/A",
                    qualifier: visionDisabilityDataAvailable ? `${formatPercentage(topFemaleVisionDisabilityData.share)} of the population in ${topFemaleVisionDisabilityData.Geography}` : ""
                  },
                  {
                    title: "Male",
                    year: visionDisabilityDataAvailable ? topMaleVisionDisabilityData.Year : "N/A",
                    value: visionDisabilityDataAvailable && topMaleVisionDisabilityData.share !== 0 ? rangeFormatter(topMaleVisionDisabilityData.Age) : "N/A",
                    qualifier: visionDisabilityDataAvailable ? `${formatPercentage(topMaleVisionDisabilityData.share)} of the population in ${topMaleVisionDisabilityData.Geography}` : "",
                    color: "terra-cotta"
                  }
                ]}
              />
              <Stat
                title={getGeomapTitle(meta, "Vision")}
                year={topChildrenGeographyStats.Year}
                value={meta.level === "place" || meta.level === "tract" ? <CensusTractDefinition text={formatGeomapLabel(topChildrenGeographyStats, meta, tractToPlace)} /> : formatGeomapLabel(topChildrenGeographyStats, meta, tractToPlace)}
                qualifier={getGeomapQualifier(topChildrenGeographyStats, meta)}
              />
            </div>
            : <div className="article-inner-container">
              <StatGroup
                title={"Most common age groups with hearing disability by gender"}
                year={hearingDisabilityDataAvailable ? topMaleHearingDisabilityData.Year : ""}
                stats={[
                  {
                    title: "Female",
                    year: hearingDisabilityDataAvailable ? topFemaleHearingDisabilityData.Year : "",
                    value: hearingDisabilityDataAvailable && topFemaleHearingDisabilityData.share !== 0 ? rangeFormatter(topFemaleHearingDisabilityData.Age) : "N/A",
                    qualifier: hearingDisabilityDataAvailable ? `${formatPercentage(topFemaleHearingDisabilityData.share)} of the population in ${topFemaleHearingDisabilityData.Geography}` : ""
                  },
                  {
                    title: "Male",
                    year: hearingDisabilityDataAvailable ? topMaleHearingDisabilityData.Year : "",
                    value: hearingDisabilityDataAvailable && topMaleHearingDisabilityData.share !== 0 ? rangeFormatter(topMaleHearingDisabilityData.Age) : "N/A",
                    qualifier: hearingDisabilityDataAvailable ? `${formatPercentage(topMaleHearingDisabilityData.share)} of the population in ${topMaleHearingDisabilityData.Geography}` : "",
                    color: "terra-cotta"
                  }
                ]}
              />
              <Stat
                title={getGeomapTitle(meta, "Hearing")}
                year={topChildrenGeographyStats.Year}
                value={meta.level === "place" || meta.level === "tract" ? <CensusTractDefinition text={formatGeomapLabel(topChildrenGeographyStats, meta, tractToPlace)} /> : formatGeomapLabel(topChildrenGeographyStats, meta, tractToPlace)}
                qualifier={getGeomapQualifier(topChildrenGeographyStats, meta)}
              />
            </div>
          }

          {isVisionDisabilitySelected
            ? <p>
              {visionDisabilityDataAvailable ? <span>In {topMaleVisionDisabilityData.Year}, the age groups most likely to have a vision disability in { }
                {topMaleVisionDisabilityData.Geography} were {topFemaleVisionDisabilityData.share !== 0 ? rangeFormatter(topFemaleVisionDisabilityData.Age) : "N/A"} years for women and {topMaleVisionDisabilityData.share !== 0 ? rangeFormatter(topMaleVisionDisabilityData.Age) : "N/A"} { }
            years for men.</span> : ""}
            </p>
            : <p>
              {hearingDisabilityDataAvailable ? <span>In {topMaleHearingDisabilityData.Year}, the age groups most likely to have a hearing disability in { }
                {topMaleHearingDisabilityData.Geography} were {topFemaleHearingDisabilityData.share !== 0 ? rangeFormatter(topFemaleHearingDisabilityData.Age) : "N/A"} years for women and {topMaleHearingDisabilityData.share !== 0 ? rangeFormatter(topMaleHearingDisabilityData.Age) : "N/A"} { }
           years for men.</span> : ""}
            </p>}

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />

          <div className="viz">
            {isVisionDisabilitySelected && visionDisabilityDataAvailable &&
          <Options
            component={this}
            componentKey="viz1"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Age,Sex&Geography=${meta.id}&Year=all` }
            title= {"Chart of Vision Disability by Age and Gender"} />
            }
            {isVisionDisabilitySelected && visionDisabilityDataAvailable &&
            <BarChart ref={comp => this.viz1 = comp } config={{
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
            />}

            {!isVisionDisabilitySelected && hearingDisabilityDataAvailable &&
              <Options
                component={this}
                componentKey="viz2"
                dataFormat={resp => resp.data}
                slug={this.props.slug}
                data={ `/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Age,Sex&Geography=${meta.id}&Year=all` }
                title= {"Chart of Hearing Disability by Age and Gender"} />
            }
            {!isVisionDisabilitySelected && hearingDisabilityDataAvailable &&
            <BarChart ref={comp => this.viz2 = comp } config={{
              data: `/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status,Age,Sex&Geography=${meta.id}&Year=all`,
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
            /> }
          </div>
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz3"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ isVisionDisabilitySelected ? `/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status&Geography=${meta.id}:children&Year=all` : `/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status&Geography=${meta.id}:children&Year=all` }
            title= {`Map of ${dropdownValue}`} />

          <Geomap ref={comp => this.viz3 = comp } config={{
            data: isVisionDisabilitySelected ? `/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status&Geography=${meta.id}:children&Year=all` : `/api/data?measures=Hearing Disabilities&drilldowns=Hearing Disability Status&Geography=${meta.id}:children&Year=all`,
            groupBy: meta.level === "county" ? "ID Place" : "ID Geography",
            colorScale: "share",
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)},
              color: [
                styles["terra-cotta-white"],
                styles["danger-light"],
                styles["terra-cotta-medium"],
                styles["danger-dark"]
              ]
            },
            shapeConfig: {
              Path: {
                stroke(d, i) {
                  if (meta.level === "tract" && (d["ID Geography"] === meta.id || d.id === meta.id)) return styles["terra-cotta-dark"];
                  const c = typeof this._shapeConfig.Path.fill === "function" ? this._shapeConfig.Path.fill(d, i) : this._shapeConfig.Path.fill;
                  return color(c).darker();
                },
                strokeWidth: d => meta.level === "tract" && (d["ID Geography"] === meta.id || d.id === meta.id) ? 2 : 1
              }
            },
            title: `${dropdownValue} Population by ${meta.level === "county" ? "Places" : "Census Tracts"} in ${meta.level === "county" || meta.level === "tract" ? "Wayne County" : meta.name}`,
            time: "Year",
            label: d => formatGeomapLabel(d, meta, tractToPlace),
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Disability", dropdownValue], ["Share", d => formatPercentage(d.share)]]},
            topojson: meta.level === "county" ? "/topojson/place.json" : "/topojson/tract.json",
            topojsonFilter: d => formatTopojsonFilter(d, meta, childrenTractIds)
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return isVisionDisabilitySelected ? formatGeomapData(resp.data, meta, childrenTractIds, "Vision")[0] : formatGeomapData(resp.data, meta, childrenTractIds, "Hearing")[0];
          }}
          topojsonFormat={resp => {
            if (meta.level === "tract") {
              resp.objects.tracts.geometries.sort((a, b) => a.id === meta.id ? 1 : b.id === meta.id ? -1 : 0);
            }
            return resp;
          }}
          />
        </div>
      </SectionColumns>
    );
  }
}

VisionAndAuditoryDisabilities.defaultProps = {
  slug: "vision-and-auditory-disabilities"
};

VisionAndAuditoryDisabilities.need = [
  fetchData("visionDisability", "/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status,Age,Sex&Geography=<id>&Year=latest", d => d.data),
  fetchData("visionDisabilityForChildrenGeography", "/api/data?measures=Vision Disabilities&drilldowns=Vision Disability Status&Geography=<id>:children&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  childrenTractIds: state.data.childrenTractIds,
  visionDisability: state.data.visionDisability,
  visionDisabilityForChildrenGeography: state.data.visionDisabilityForChildrenGeography
});

export default connect(mapStateToProps)(VisionAndAuditoryDisabilities);

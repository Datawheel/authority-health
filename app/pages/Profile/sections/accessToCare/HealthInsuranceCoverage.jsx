import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import rangeFormatter from "utils/rangeFormatter";
import places from "utils/places";
import Stat from "components/Stat";
import StatGroup from "components/StatGroup";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

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

// Find share of coverage for each gender with in age group
const formatCoverageData = coverageData => {
  nest()
    .key(d => d.Year)
    .entries(coverageData)
    .forEach(group => {
      nest()
        .key(d => d["ID Age"])
        .entries(group.values)
        .forEach(ageGroup => {
          const total = sum(ageGroup.values, d => d["Population by Insurance Coverage"]);
          ageGroup.values.forEach(d => total !== 0 ? d.share = d["Population by Insurance Coverage"] / total * 100 : d.share = 0);
        });
    });
  const filteredRecentYearData = coverageData.filter(d => d["ID Health Insurance Coverage Status"] === 0);
  return filteredRecentYearData;
};

const findOverallCoverage = data => {
  const total = data[0]["Population by Insurance Coverage"] + data[1]["Population by Insurance Coverage"];
  const filteredData = data.filter(d => d["Health Insurance Coverage Status"] === "With Health Insurance Coverage")[0];
  filteredData.share = filteredData["Population by Insurance Coverage"] / total * 100;
  return filteredData;
};

const formatGeomapCoverageData = (data, meta, childrenTractIds) => {
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
      const total = sum(group.values, d => d["Population by Insurance Coverage"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Population by Insurance Coverage"] / total * 100 : d.share = 0);
    });
  const filteredWithCoverageData = filteredChildrenGeography.filter(d => d["ID Health Insurance Coverage Status"] === 0);
  const topRecentYearData = filteredChildrenGeography.sort((a, b) => b.share - a.share)[0];
  return [filteredWithCoverageData, topRecentYearData];
};

const getGeomapTitle = meta => {
  if (meta.level === "county") return "Most covered population within places in Wayne County";
  else if (meta.level === "tract") return "Most covered population within census tracts in Wayne County";
  else return `Most covered population within tracts in ${meta.name}`;
};

const getGeomapQualifier = (data, meta) => {
  if (meta.level === "county") return `${formatPercentage(data.share)} of the population in this city`;
  return `${formatPercentage(data.share)} of the population in this census tract`;
};

class HealthInsuranceCoverage extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      sources: []
    };
  }

  render() {
    const {
      meta,
      childrenTractIds,
      coverageData,
      nationOverallCoverage,
      stateOverallCoverage,
      wayneCountyOverallCoverage,
      currentLevelOverallCoverage,
      coverageDataForChildrenGeography
    } = this.props;

    const {tractToPlace} = this.props.topStats;
    const coverageDataAvailable = coverageData.data.length !== 0;

    const nationCoverage = findOverallCoverage(nationOverallCoverage);
    const stateCoverage = findOverallCoverage(stateOverallCoverage);
    const countyCoverage = findOverallCoverage(wayneCountyOverallCoverage);
    let currentLevelCoverage;
    if (meta.level !== "county") {
      currentLevelCoverage = findOverallCoverage(currentLevelOverallCoverage);
    }

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isCoverageDataAvailableForCurrentGeography = coverageData.source[0].substitutions.length === 0;

    // Find top stats data.
    let ageGroupYear, geoId, geography, maleCoverageData, topFemaleAgeGroup, topFemaleShare, topMaleAgeGroup, topMaleShare;
    if (coverageDataAvailable) {
      const recentYearCoverageData = formatCoverageData(coverageData.data);
      const femaleCoverageData = recentYearCoverageData.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share);
      topFemaleAgeGroup = rangeFormatter(femaleCoverageData[0].Age);
      topFemaleShare = formatPercentage(femaleCoverageData[0].share);

      maleCoverageData = recentYearCoverageData.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share);
      topMaleAgeGroup = rangeFormatter(maleCoverageData[0].Age);
      ageGroupYear = maleCoverageData[0].Year;
      topMaleShare = formatPercentage(maleCoverageData[0].share);
      geoId = maleCoverageData[0]["ID Geography"];
      geography = femaleCoverageData[0].Geography;
    }

    const topRecentYearChildrenGeographyData = formatGeomapCoverageData(coverageDataForChildrenGeography, meta, childrenTractIds)[1];

    if (coverageDataAvailable) {
      return (
        <SectionColumns>
          <SectionTitle>Health Insurance Coverage</SectionTitle>
          <article>
            <div>
              <StatGroup
                title={"most covered age group by gender"}
                year={ageGroupYear}
                stats={[
                  {
                    title: "Female",
                    year: ageGroupYear,
                    value: topFemaleAgeGroup,
                    qualifier: `${topFemaleShare} of the population in ${geography} within this age group`
                  },
                  {
                    title: "Male",
                    year: ageGroupYear,
                    value: topMaleAgeGroup,
                    qualifier: `${topMaleShare} of the population in ${geography} within this age group`,
                    color: "terra-cotta"
                  }
                ]}
              />
              <Stat
                title={getGeomapTitle(meta)}
                year={topRecentYearChildrenGeographyData.Year}
                value={formatGeomapLabel(topRecentYearChildrenGeographyData, meta, tractToPlace)}
                qualifier={getGeomapQualifier(topRecentYearChildrenGeographyData, meta)}
              />
            </div>

            {meta.level !== "county"
              ? <p>In {nationCoverage.Year}, {formatPercentage(currentLevelCoverage.share)} of the population in {currentLevelCoverage.Geography} had health coverage, compared to {formatPercentage(countyCoverage.share)} in Wayne County, {formatPercentage(stateCoverage.share)} in Michigan and {formatPercentage(nationCoverage.share)} in the United States.</p>
              : <p>In {nationCoverage.Year}, {formatPercentage(countyCoverage.share)} of the population in Wayne County had health coverage, compared to {formatPercentage(stateCoverage.share)} in Michigan and {formatPercentage(nationCoverage.share)} in the United States.</p>
            }
            <p>The age groups for men and women most likely to have health care coverage in {maleCoverageData[0].Geography} were {topMaleAgeGroup} years for men and {topFemaleAgeGroup} years for women.</p>

            {!isCoverageDataAvailableForCurrentGeography &&
              <Disclaimer>Data is shown for {coverageData.data[0].Geography}</Disclaimer>
            }
            <SourceGroup sources={this.state.sources} />
            <Contact slug={this.props.slug} />

            <div className="viz">
              <Options
                component={this}
                componentKey="viz1"
                dataFormat={resp => resp.data}
                slug={this.props.slug}
                data={ `/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status,Sex,Age&Geography=${geoId}&Year=all` }
                title="Chart of Health Insurance Coverage" />
              <BarChart ref={comp => this.viz1 = comp} config={{
                data: `/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status,Sex,Age&Geography=${geoId}&Year=all`,
                discrete: "x",
                height: 250,
                groupBy: "Sex",
                x: "Age",
                y: "share",
                time: "ID Year",
                title: d => `Health Insurance Coverage by Age and Gender in ${d[0].Geography}`,
                xSort: (a, b) => a["ID Age"] - b["ID Age"],
                xConfig: {
                  labelRotation: false,
                  tickFormat: d => rangeFormatter(d)
                },
                yConfig: {tickFormat: d => formatPercentage(d)},
                shapeConfig: {
                  label: false
                },
                tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
              }}
              dataFormat={resp => {
                this.setState({sources: updateSource(resp.source, this.state.sources)});
                return formatCoverageData(resp.data);
              }}
              />
            </div>
          </article>

          <div className="viz u-text-right">
            <Options
              component={this}
              componentKey="viz2"
              dataFormat={resp => resp.data}
              slug={this.props.slug}
              data={ `/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status&Geography=${meta.id}:children&Year=all` }
              title="Map of Health Insurance Coverage" />

            <Geomap ref={comp => this.viz2 = comp } config={{
              data: `/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status&Geography=${meta.id}:children&Year=all`,
              groupBy: meta.level === "county" ? "ID Place" : "ID Geography",
              colorScale: "share",
              title: `Health Insurance Coverage for ${meta.level === "county" ? "Places" : "Census Tracts"} in ${meta.level === "county" || meta.level === "tract" ? "Wayne County" : meta.name}`,
              colorScaleConfig: {axisConfig: {tickFormat: d => formatPercentage(d)}},
              time: "Year",
              label: d => formatGeomapLabel(d, meta, tractToPlace),
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)]]},
              topojson: meta.level === "county" ? "/topojson/place.json" : "/topojson/tract.json",
              topojsonFilter: d => formatTopojsonFilter(d, meta, childrenTractIds)
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatGeomapCoverageData(resp.data, meta, childrenTractIds)[0];
            }}
            />
          </div>
        </SectionColumns>
      );
    }
    else return null;
  }
}

HealthInsuranceCoverage.defaultProps = {
  slug: "health-insurance-coverage"
};

HealthInsuranceCoverage.need = [
  fetchData("coverageData", "/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status,Sex,Age&Geography=<id>&Year=latest"),
  fetchData("nationOverallCoverage", "/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status&Nation=01000US&Year=latest", d => d.data),
  fetchData("stateOverallCoverage", "/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status&State=04000US26&Year=latest", d => d.data),
  fetchData("wayneCountyOverallCoverage", "/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status&Geography=05000US26163&Year=latest", d => d.data),
  fetchData("coverageDataForChildrenGeography", "/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status&Geography=<id>:children&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  childrenTractIds: state.data.childrenTractIds,
  coverageData: state.data.coverageData,
  nationOverallCoverage: state.data.nationOverallCoverage,
  stateOverallCoverage: state.data.stateOverallCoverage,
  wayneCountyOverallCoverage: state.data.wayneCountyOverallCoverage,
  currentLevelOverallCoverage: state.data.currentLevelOverallCoverage,
  coverageDataForChildrenGeography: state.data.coverageDataForChildrenGeography
});

export default connect(mapStateToProps)(HealthInsuranceCoverage);

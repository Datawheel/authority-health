import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import rangeFormatter from "utils/rangeFormatter";
import places from "utils/places";
import Stat from "components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

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

class HealthInsuranceCoverage extends SectionColumns {

  render() {
    const {meta, coverageData, nationOverallCoverage, stateOverallCoverage, wayneCountyOverallCoverage, currentLevelOverallCoverage} = this.props;

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
    let ageGroupYear, geoId, maleCoverageData, topFemaleAgeGroup, topFemaleShare, topMaleAgeGroup, topMaleShare;
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
    }

    if (coverageDataAvailable) {
      return (
        <SectionColumns>
          <SectionTitle>Health Insurance Coverage</SectionTitle>
          <article>
            {isCoverageDataAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">data is shown for {coverageData.data[0].Geography}</div>}
            <div>
              <Stat
                title="Most covered male group"
                year={ageGroupYear}
                value={topMaleAgeGroup}
                qualifier={`${topMaleShare} of the population within this age group`}
              />
              <Stat
                title="Most covered female group"
                year={ageGroupYear}
                value={topFemaleAgeGroup}
                qualifier={`${topFemaleShare} of the population within this age group`}
              />
            </div>

            <p>In {nationCoverage.Year}, {formatPercentage(nationCoverage.share)} of the population in United States had health coverage, compared to {formatPercentage(stateCoverage.share)} in Michigan{meta.level !== "county" ? "," : " and"} {formatPercentage(countyCoverage.share)} in Wayne County{meta.level !== "county" ? <span> and {formatPercentage(currentLevelCoverage.share)} in {currentLevelCoverage.Geography}.</span> : "."}</p>
            <p>In {ageGroupYear}, the age groups most likely to have health care coverage in {maleCoverageData[0].Geography} were {topMaleAgeGroup} years for men and {topFemaleAgeGroup} years for women.</p>

            <BarChart config={{
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
            dataFormat={resp => formatCoverageData(resp.data)}
            />
            <Contact slug={this.props.slug} />
          </article>

          <Geomap config={{
            data: "/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status,Place&Geography=05000US26163:children&Year=all",
            groupBy: "ID Place",
            colorScale: "share",
            title: "Health Insurance Coverage for Places in Wayne County",
            colorScaleConfig: {axisConfig: {tickFormat: d => formatPercentage(d)}},
            time: "Year",
            label: d => d.Place,
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)]]},
            topojson: "/topojson/place.json",
            topojsonFilter: d => places.includes(d.id)
          }}
          dataFormat={resp => {
            nest()
              .key(d => d.Year)
              .entries(resp.data)
              .forEach(group => {
                const total = sum(group.values, d => d["Population by Insurance Coverage"]);
                group.values.forEach(d => total !== 0 ? d.share = d["Population by Insurance Coverage"] / total * 100 : d.share = 0);
              });
            return resp.data.filter(d => d["ID Health Insurance Coverage Status"] === 0);
          }}
          />
        </SectionColumns>
      );
    }
    else return <div></div>;
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
  fetchData("currentLevelOverallCoverage", "/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  coverageData: state.data.coverageData,
  nationOverallCoverage: state.data.nationOverallCoverage,
  stateOverallCoverage: state.data.stateOverallCoverage,
  wayneCountyOverallCoverage: state.data.wayneCountyOverallCoverage,
  currentLevelOverallCoverage: state.data.currentLevelOverallCoverage
});

export default connect(mapStateToProps)(HealthInsuranceCoverage);

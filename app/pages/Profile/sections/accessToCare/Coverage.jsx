import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import rangeFormatter from "../../../../utils/rangeFormatter";
import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

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
  return coverageData;
};

class Coverage extends SectionColumns {

  render() {
    const {meta, coverageData} = this.props;

    const coverageDataAvailable = coverageData.data.length !== 0;

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isCoverageDataAvailableForCurrentGeography = coverageData.source[0].substitutions.length === 0;

    // Find top stats data.
    let ageGroupYear, geoId, maleCoverageData, topFemaleAgeGroup, topFemaleShare, topMaleAgeGroup, topMaleShare;
    if (coverageDataAvailable) {
      const recentYearCoverageData = formatCoverageData(coverageData.data);
      const filteredRecentYearData = recentYearCoverageData.filter(d => d["ID Health Insurance Coverage Status"] === 0);
      const femaleCoverageData = filteredRecentYearData.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share);
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
          <SectionTitle>Coverage</SectionTitle>
          <article>
            {isCoverageDataAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">Showing data for {coverageData.data[0].Geography}.</div>}
            <div>
              <Stat
                title="Most covered male group"
                year={ageGroupYear}
                value={topMaleAgeGroup}
                qualifier={topMaleShare}
              />
              <Stat
                title="Most covered female group"
                year={ageGroupYear}
                value={topFemaleAgeGroup}
                qualifier={topFemaleShare}
              />
            </div>
          
            <p>In {ageGroupYear}, the age groups most likely to have health care coverage in {maleCoverageData[0].Geography} are {topMaleAgeGroup} and {topFemaleAgeGroup} years, for men and women respectively.</p>
            <p>The following chart shows the male and female age groups with health insurance coverage in {maleCoverageData[0].Geography}.</p>
          </article>

          <BarChart config={{
            data: `/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status,Sex,Age&Geography=${geoId}&Year=all`,
            discrete: "x",
            height: 400,
            groupBy: "Sex",
            x: "Age",
            y: "share",
            time: "ID Year",
            xSort: (a, b) => a["ID Age"] - b["ID Age"],
            xConfig: {
              labelRotation: false,
              tickFormat: d => rangeFormatter(d),
              title: "Population with Coverage"
            },
            yConfig: {tickFormat: d => formatPercentage(d)},
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => formatCoverageData(resp.data)}
          />
        </SectionColumns>
      );
    }
    else return <div></div>;
  }
}

Coverage.defaultProps = {
  slug: "coverage"
};

Coverage.need = [
  fetchData("coverageData", "/api/data?measures=Population by Insurance Coverage&drilldowns=Health Insurance Coverage Status,Sex,Age&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  coverageData: state.data.coverageData
});

export default connect(mapStateToProps)(Coverage);

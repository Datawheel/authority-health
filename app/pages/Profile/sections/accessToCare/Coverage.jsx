import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import rangeFormatter from "../../../../utils/rangeFormatter";
import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatCoverageData = coverageData => {
  const recentYearCoverageData = {};
  nest()
    .key(d => d.Year)
    .entries(coverageData)
    .forEach(group => {
      nest()
        .key(d => d["ID Age"])
        .entries(group.values)
        .forEach(ageGroup => {
          const total = sum(ageGroup.values, d => d.Population);
          ageGroup.values.forEach(d => d.share = d.Population / total * 100);
        });
      group.key >= coverageData[0].Year ? Object.assign(recentYearCoverageData, group) : {};
    });
  return [coverageData, recentYearCoverageData];
};

class Coverage extends SectionColumns {

  render() {
    const {coverageData} = this.props;
    const isCoverageDataUnavailable = coverageData.length === 0;

    let ageGroupYear, maleCoverageData, topFemaleAgeGroup, topFemaleShare, topMaleAgeGroup, topMaleShare;
    if (!isCoverageDataUnavailable) {
      const recentYearCoverageData = formatCoverageData(coverageData)[1].values;
      const filteredRecentYearData = recentYearCoverageData.filter(d => d["ID Health Insurance Coverage Status"] === 0);
      const femaleCoverageData = filteredRecentYearData.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share);
      topFemaleAgeGroup = rangeFormatter(femaleCoverageData[0].Age);
      topFemaleShare = formatPercentage(femaleCoverageData[0].share);
  
      maleCoverageData = recentYearCoverageData.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share);
      topMaleAgeGroup = rangeFormatter(maleCoverageData[0].Age);
      ageGroupYear = maleCoverageData[0].Year;
      topMaleShare = formatPercentage(maleCoverageData[0].share);
    }

    return (
      <SectionColumns>
        <SectionTitle>Coverage</SectionTitle>
        <article>
          {isCoverageDataUnavailable ? <div className="disclaimer">Data available only at the place and county level.</div> : <div></div>}
          {isCoverageDataUnavailable 
            ? <div>
              <Stat
                title="Most covered male group"
                year=""
                value="N/A"
              />
              <Stat
                title="Most covered female group"
                year=""
                value="N/A"
              />
            </div>
            : <div>
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
          }
          {isCoverageDataUnavailable 
            ? <p></p>
            : <p>In {ageGroupYear}, the age groups most likely to have health care coverage in {maleCoverageData[0].Geography} County are {topMaleAgeGroup} and {topFemaleAgeGroup} years, for men and women respectively.</p>
          }
          <p>The following chart shows the male and female age groups with health insurance coverage.</p>
        </article>

        <BarChart config={{
          data: isCoverageDataUnavailable ? "/api/data?measures=Population&drilldowns=Health Insurance Coverage Status,Sex,Age&Geography=05000US26163&Year=all" : "/api/data?measures=Population&drilldowns=Health Insurance Coverage Status,Sex,Age&Geography=<id>&Year=all",
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
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPercentage(d.share)]]}
        }}
        dataFormat={resp => formatCoverageData(resp.data)[0]}
        />
      </SectionColumns>
    );
  }
}

Coverage.defaultProps = {
  slug: "coverage"
};

Coverage.need = [
  fetchData("coverageData", "/api/data?measures=Population&drilldowns=Health Insurance Coverage Status,Sex,Age&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  coverageData: state.data.coverageData
});

export default connect(mapStateToProps)(Coverage);

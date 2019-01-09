import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class HouseholdIncomeFromPublicAssistance extends SectionColumns {

  render() {

    const {publicAssistanceData, householdSnapData} = this.props;

    // Format data for publicAssistanceData
    const recentYearPublicAssistanceData = {};
    nest()
      .key(d => d.Year)
      .entries(publicAssistanceData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= publicAssistanceData[0].Year ? Object.assign(recentYearPublicAssistanceData, group) : {};
      });

    // Find top recent year data for publicAssistanceData
    const filteredData = recentYearPublicAssistanceData.values.filter(d => d["ID Public Assistance or Snap"] === 0).sort((a, b) => b.share - a.share);
    const topPublicAssistanceData = filteredData[0];

    // Find share for eacd data in householdSnapData.
    const recentYearHouseholdSnapData = {};
    nest()
      .key(d => d.Year)
      .entries(householdSnapData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= householdSnapData[0].Year ? Object.assign(recentYearHouseholdSnapData, group) : {};
      });
    const filterSnapRecievedData = householdSnapData.filter(d => d["ID Snap Receipt"] === 0);

    // Get top stats for householdSnapData.
    const filteredTopRecentYearHouseholdSnapData = recentYearHouseholdSnapData.values.filter(d => d["ID Snap Receipt"] === 0);
    const topRecentYearHouseholdSnapData = filteredTopRecentYearHouseholdSnapData.sort((a, b) => b.share - a.share)[0];
    let totalTopHouseoldShare = 0;
    filteredTopRecentYearHouseholdSnapData.forEach(d => {
      if (d["Number of workers"] === topRecentYearHouseholdSnapData["Number of workers"]) totalTopHouseoldShare += d.share;
    });

    return (
      <SectionColumns>
        <SectionTitle>Household Income From Public Assistance</SectionTitle>
        <article>
          <Stat
            title={`Population ${topPublicAssistanceData["Public Assistance or Snap"]}`}
            year={topPublicAssistanceData.Year}
            value={`${formatPercentage(topPublicAssistanceData.share)}`}
          />
          <Stat
            title={"most common number of workers per household"}
            year={topRecentYearHouseholdSnapData.Year}
            value={topRecentYearHouseholdSnapData["Number of workers"]}
            qualifier={formatPercentage(totalTopHouseoldShare)}
          />

          <p>In {topPublicAssistanceData.Year}, {formatPercentage(topPublicAssistanceData.share)} of all population in {topPublicAssistanceData.Geography} got public assistance or food stamps in cash. The most common number of workers per household  on public assistance is {topRecentYearHouseholdSnapData["Number of workers"].toLowerCase()} ({formatPercentage(totalTopHouseoldShare)}).</p>
          <p>The following chart shows the number of workers per household on public assistance.</p>
        </article>

        <BarChart config={{
          data: filterSnapRecievedData,
          discrete: "x",
          height: 400,
          stacked: true,
          legend: false,
          label: d => `${d["Family type"]}`,
          groupBy: d => `${d["Family type"]}`,
          x: d => d["Number of workers"],
          y: "share",
          time: "Year",
          xSort: (a, b) => a["ID Number of workers"] - b["ID Number of workers"],
          xConfig: {labelRotation: false},
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Share"
          },
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Workers", d => d["Number of workers"]], ["Share", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

HouseholdIncomeFromPublicAssistance.defaultProps = {
  slug: "household-income-from-public-assistance"
};

HouseholdIncomeFromPublicAssistance.need = [
  fetchData("publicAssistanceData", "/api/data?measures=Population&drilldowns=Public Assistance or Snap&Geography=<id>&Year=all", d => d.data),
  fetchData("householdSnapData", "/api/data?measures=Population&drilldowns=Snap Receipt,Family type,Number of workers&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  publicAssistanceData: state.data.publicAssistanceData,
  householdSnapData: state.data.householdSnapData
});

export default connect(mapStateToProps)(HouseholdIncomeFromPublicAssistance);

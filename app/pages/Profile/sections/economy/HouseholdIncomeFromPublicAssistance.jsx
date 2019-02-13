import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatPublicAssistanceData = publicAssistanceData => {
  // Format data for publicAssistanceData
  nest()
    .key(d => d.Year)
    .entries(publicAssistanceData)
    .forEach(group => {
      const total = sum(group.values, d => d["Food-Stamp Population"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Food-Stamp Population"] / total * 100 : d.share = 0);
    });
  // Find top recent year data for publicAssistanceData
  const latestYear = publicAssistanceData[0].Year;
  const recentYearPublicAssistanceData = publicAssistanceData.filter(d => d.Year === latestYear);
  const topPublicAssistanceData = recentYearPublicAssistanceData.filter(d => d["ID Public Assistance or Snap"] === 0).sort((a, b) => b.share - a.share)[0];
  return [publicAssistanceData, topPublicAssistanceData];
};

const formatHouseholdSnapData = householdSnapData => {
  // Find share for each data in householdSnapData.
  const recentYearHouseholdSnapData = {};
  nest()
    .key(d => d.Year)
    .entries(householdSnapData)
    .forEach(group => {
      const total = sum(group.values, d => d["SNAP Receipts"]);
      group.values.forEach(d => total !== 0 ? d.share = d["SNAP Receipts"] / total * 100 : d.share = 0);
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
  return [filterSnapRecievedData, topRecentYearHouseholdSnapData, totalTopHouseoldShare];
};

class HouseholdIncomeFromPublicAssistance extends SectionColumns {

  render() {

    const {meta, publicAssistanceData, householdSnapData} = this.props;

    const publicAssistanceDataAvailable = publicAssistanceData.length !== 0;
    const householdSnapDataAvailable = householdSnapData.length !== 0;

    // Format data for publicAssistanceData
    let topPublicAssistanceData;
    if (publicAssistanceDataAvailable) {
      topPublicAssistanceData = formatPublicAssistanceData(publicAssistanceData)[1];
    }

    // Find share for each data in householdSnapData.
    let topRecentYearHouseholdSnapData, totalTopHouseoldShare = 0;
    if (householdSnapDataAvailable) {
      topRecentYearHouseholdSnapData = formatHouseholdSnapData(householdSnapData)[1];
      totalTopHouseoldShare = formatHouseholdSnapData(householdSnapData)[2];
    }
    
    return (
      <SectionColumns>
        <SectionTitle>Household Income From Public Assistance</SectionTitle>
        <article>
          <Stat
            title={"Population With Cash Public Assistance Or Food Stamps/SNAP"}
            year={publicAssistanceDataAvailable ? topPublicAssistanceData.Year : ""}
            value={publicAssistanceDataAvailable ? `${formatPercentage(topPublicAssistanceData.share)}` : "N/A"}
          />
          <Stat
            title={"most common number of workers per household"}
            year={householdSnapDataAvailable ? topRecentYearHouseholdSnapData.Year : ""}
            value={householdSnapDataAvailable ? topRecentYearHouseholdSnapData["Number of workers"] : "N/A"}
            qualifier={householdSnapDataAvailable ? formatPercentage(totalTopHouseoldShare) : ""}
          />
          <p>
            {publicAssistanceDataAvailable ? <span>In {topPublicAssistanceData.Year}, {formatPercentage(topPublicAssistanceData.share)} of all population in {topPublicAssistanceData.Geography} got public assistance or food stamps in cash. </span> : ""}
            {householdSnapDataAvailable ? <span>The most common number of workers per household  on public assistance is {topRecentYearHouseholdSnapData["Number of workers"].toLowerCase()} ({formatPercentage(totalTopHouseoldShare)}).</span> : ""}
          </p>
          {householdSnapDataAvailable ? <p>The following chart shows the number of workers per household on public assistance.</p> : ""}
        </article>

        {householdSnapDataAvailable 
          ? <BarChart config={{
            data: `/api/data?measures=SNAP Receipts&drilldowns=Snap Receipt,Family type,Number of workers&Geography=${meta.id}&Year=all`,
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Workers", d => d["Number of workers"]], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => formatHouseholdSnapData(resp.data)[0]}
          /> : <div></div>}
      </SectionColumns>
    );
  }
}

HouseholdIncomeFromPublicAssistance.defaultProps = {
  slug: "household-income-from-public-assistance"
};

HouseholdIncomeFromPublicAssistance.need = [
  fetchData("publicAssistanceData", "/api/data?measures=Food-Stamp Population&drilldowns=Public Assistance or Snap&Geography=<id>&Year=latest", d => d.data),
  fetchData("householdSnapData", "/api/data?measures=SNAP Receipts&drilldowns=Snap Receipt,Family type,Number of workers&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  publicAssistanceData: state.data.publicAssistanceData,
  householdSnapData: state.data.householdSnapData
});

export default connect(mapStateToProps)(HouseholdIncomeFromPublicAssistance);

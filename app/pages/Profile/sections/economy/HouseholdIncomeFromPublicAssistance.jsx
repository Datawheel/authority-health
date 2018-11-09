import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

const formatName = d => {
  const nameArr = d.split(" ");
  return `${nameArr[0]} ${nameArr[1]}`;
};
const formatPercentage = d => `${formatAbbreviate(d)}%`;

class HouseholdIncomeFromPublicAssistance extends SectionColumns {

  render() {

    const {publicAssistanceData, householdSnapData} = this.props;
    console.log("householdSnapData: ", householdSnapData);

    // Format data for publicAssistanceData.
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

    // Format data for publicAssistanceData.
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
    console.log("filterSnapRecievedData: ", filterSnapRecievedData);

    // Find top recent year data for publicAssistanceData
    // const filteredData = recentYearHouseholdSnapData.values.filter(d => d["ID Public Assistance or Snap"] === 0).sort((a, b) => b.share - a.share);
    // const topPublicAssistanceData = filteredData[0];

    return (
      <SectionColumns>
        <SectionTitle>Household Income From Public Assistance</SectionTitle>
        <article>
          <Stat 
            title={`Population ${topPublicAssistanceData["Public Assistance or Snap"]} in ${topPublicAssistanceData.Year}`}
            value={`${formatPercentage(topPublicAssistanceData.share)}`}
          />
          {/* Draw a Barchart for Population With Cash and No Cash Public Assistance. */}
          <BarChart config={{
            data: publicAssistanceData,
            discrete: "y",
            height: 250,
            legend: false,
            label: d => formatName(d["Public Assistance or Snap"]),
            groupBy: "Public Assistance or Snap",
            x: "share",
            y: "Public Assistance or Snap",
            time: "ID Year",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Population with SNAP benefits"
            },
            yConfig: {
              ticks: [],
              title: "SNAP benefits w/ cash & no cash"
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />
        </article>
        
        <BarChart config={{
          data: filterSnapRecievedData,
          discrete: "x",
          height: 400,
          stacked: true,
          legend: false,
          label: d => `${d["Family type"]} ${d["Number of workers"]}`,
          groupBy: d => `${d["Family type"]}`,
          x: d => d["Number of workers"],
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Number of workers"] - b["ID Number of workers"],
          xConfig: {
            labelRotation: false
            // tickFormat: d => rangeFormatter(d)
          },
          yConfig: {tickFormat: d => formatPercentage(d)},
          shapeConfig: {
            label: false
            // opacity: d => d["ID Family type"] === 0 ? 0.5 : 1
          },
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
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
  fetchData("publicAssistanceData", "/api/data?measures=Population&drilldowns=Public%20Assistance%20or%20Snap&County=<id>&Year=all", d => d.data),
  fetchData("householdSnapData", "/api/data?measures=Population&drilldowns=Snap%20Receipt,Family%20type,Number%20of%20workers&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  publicAssistanceData: state.data.publicAssistanceData,
  householdSnapData: state.data.householdSnapData
});

export default connect(mapStateToProps)(HouseholdIncomeFromPublicAssistance);

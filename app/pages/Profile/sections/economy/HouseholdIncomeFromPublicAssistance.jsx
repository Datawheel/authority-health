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

    // Find top recent year data for publicAssistanceData
    // const filteredData = recentYearHouseholdSnapData.values.filter(d => d["ID Public Assistance or Snap"] === 0).sort((a, b) => b.share - a.share);
    // const topPublicAssistanceData = filteredData[0];

    return (
      <SectionColumns>
        <SectionTitle>Household Income From Public Assistance</SectionTitle>
        <article>
          <Stat
            title={`Population ${topPublicAssistanceData["Public Assistance or Snap"]}`}
            year={topPublicAssistanceData.Year}
            value={`${formatPercentage(topPublicAssistanceData.share)}`}
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
          },
          yConfig: {tickFormat: d => formatPercentage(d)},
          shapeConfig: {
            label: false
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
  fetchData("publicAssistanceData", "/api/data?measures=Population&drilldowns=Public%20Assistance%20or%20Snap&Geography=<id>&Year=all", d => d.data),
  fetchData("householdSnapData", "/api/data?measures=Population&drilldowns=Snap%20Receipt,Family%20type,Number%20of%20workers&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  publicAssistanceData: state.data.publicAssistanceData,
  householdSnapData: state.data.householdSnapData
});

export default connect(mapStateToProps)(HouseholdIncomeFromPublicAssistance);

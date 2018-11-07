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

    const {publicAssistanceData} = this.props;

    const recentYearPublicAssistanceData = {};
    nest()
      .key(d => d.Year)
      .entries(publicAssistanceData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= publicAssistanceData[0].Year ? Object.assign(recentYearPublicAssistanceData, group) : {};
      });

    const filteredData = recentYearPublicAssistanceData.values.filter(d => d["ID Public Assistance or Snap"] === 0).sort((a, b) => b.share - a.share);
    const topPublicAssistanceData = filteredData[0];

    return (
      <SectionColumns>
        <SectionTitle>Household-Income-From-Public-Assistance</SectionTitle>
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
        
      </SectionColumns>
    );
  }
}

HouseholdIncomeFromPublicAssistance.defaultProps = {
  slug: "household-income-from-public-assistance"
};

HouseholdIncomeFromPublicAssistance.need = [
  fetchData("publicAssistanceData", "/api/data?measures=Population&drilldowns=Public%20Assistance%20or%20Snap&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  publicAssistanceData: state.data.publicAssistanceData
});

export default connect(mapStateToProps)(HouseholdIncomeFromPublicAssistance);

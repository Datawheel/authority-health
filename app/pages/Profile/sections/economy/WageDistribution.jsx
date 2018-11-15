import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class WageDistribution extends SectionColumns {

  render() {

    const {wageDistributionData, wageGinidata} = this.props;

    // Find the top data for the most recent year.
    const recentYearWageDistribution = {};
    nest()
      .key(d => d.Year)
      .entries(wageDistributionData)
      .forEach(group => {
        const total = sum(group.values, d => d["Household Income"]);
        group.values.forEach(d => d.share = d["Household Income"] / total * 100);
        group.key >= wageDistributionData[0].Year ? Object.assign(recentYearWageDistribution, group) : {};
      });
    recentYearWageDistribution.values.sort((a, b) => b.share - a.share);
    const topWageDistribution = recentYearWageDistribution.values[0];

    // Find all places and wage GINI in Michigan state.
    const wageGiniDataForMichigan = wageGinidata.filter(d => d["ID Place"].startsWith("16000US26"));
    wageGiniDataForMichigan.sort((a, b) => b["Wage GINI"] - a["Wage GINI"]);
    const topWageGini = wageGiniDataForMichigan[0];

    return (
      <SectionColumns>
        <SectionTitle>Wage Distribution</SectionTitle>
        <article>
          {/* Top stats and short paragraph about Wage distribution. */}
          <Stat
            title={`Top Wage Dsitribution in ${topWageDistribution.Year} in ${topWageDistribution.County}`}
            value={`${topWageDistribution["Household Income Bucket"]} ${formatPopulation(topWageDistribution.share)}`}
          />
          {/* Top stats and short paragraph about Wage Gini. */}
          <Stat
            title={`Top Wage GINI in ${topWageGini.Year}`}
            value={`${topWageGini.Place} ${formatAbbreviate(topWageGini["Wage GINI"])}`}
          />
          <p>This Barchart shows the number of workers in various wage buckets in {topWageDistribution.County}. In {topWageDistribution.Year}, {topWageDistribution.County} had the top Wage Distribution of {topWageDistribution["Household Income Bucket"]} with {formatPopulation(topWageDistribution.share)}.</p>
          <p>In {topWageGini.Year}, the highest income inequality in Michigan, was in {topWageGini.Place} with {formatAbbreviate(topWageGini["Wage GINI"])}</p>
        </article>

        {/* Draw Geomap to show wage distribution for each place in the Wayne county. */}
        <BarChart config={{
          data: wageDistributionData,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Household Income Bucket",
          x: "Household Income Bucket",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Household Income Bucket"] - b["ID Household Income Bucket"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d)
          },
          yConfig: {tickFormat: d => formatPopulation(d)},
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

WageDistribution.defaultProps = {
  slug: "wage-distribution"
};

WageDistribution.need = [
  fetchData("wageDistributionData", "https://gila-cliff.datausa.io/api/data?measures=Household%20Income&drilldowns=Household%20Income%20Bucket&County=<id>&Year=all", d => d.data),
  fetchData("wageGinidata", "https://gila-cliff.datausa.io/api/data?measures=Wage%20GINI&drilldowns=Place&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  wageDistributionData: state.data.wageDistributionData,
  wageGinidata: state.data.wageGinidata
});

export default connect(mapStateToProps)(WageDistribution);


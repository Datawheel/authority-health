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

    nest()
      .key(d => d.Year)
      .entries(wageDistributionData)
      .forEach(group => {
        const total = sum(group.values, d => d["Household Income"]);
        group.values.forEach(d => d.share = d["Household Income"] / total * 100);
      });

    return (
      <SectionColumns>
        <SectionTitle>Wage Distribution</SectionTitle>
        <article>
          {/* Top stats and short paragraph about Wage Gini. */}
          <Stat
            title="Wage GINI"
            year={wageGinidata[0].Year}
            value={wageGinidata[0]["Wage GINI"]}
          />
          <p>In {wageGinidata[0].Year}, the income inequality in {wageGinidata[0].Geography} was {wageGinidata[0]["Wage GINI"]}. The GINI coefficient is a measure of statistical dispersion intended to represent the equality of a distribution, and is the most commonly used measure of inequality. Values range from 0 to 1, with 0 being perfect equality.</p>
          <p>The following chart shows the household income bucket and share for each bucket in {wageDistributionData[0].Geography}.</p>
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
          time: "Year",
          xSort: (a, b) => a["ID Household Income Bucket"] - b["ID Household Income Bucket"],
          xConfig: {
            tickFormat: d => rangeFormatter(d),
            title: "Household Income Bucket"
          },
          yConfig: {
            tickFormat: d => formatPopulation(d),
            title: "Share"
          },
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)]]}
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
  fetchData("wageDistributionData", "https://niagara.datausa.io/api/data?measures=Household Income&drilldowns=Household Income Bucket&Geography=<id>&Year=all", d => d.data),
  fetchData("wageGinidata", "https://niagara.datausa.io/api/data?measures=Wage GINI&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  wageDistributionData: state.data.wageDistributionData,
  wageGinidata: state.data.wageGinidata
});

export default connect(mapStateToProps)(WageDistribution);

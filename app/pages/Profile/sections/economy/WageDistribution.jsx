import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class WageDistribution extends SectionColumns {

  render() {

    const {meta, wageDistributionData, wageGinidata} = this.props;

    const wageDistributionDataAvailable = wageDistributionData.length !== 0;
    const wageGinidataAvailable = wageGinidata.length !== 0;

    if (wageDistributionDataAvailable) {
      nest()
        .key(d => d.Year)
        .entries(wageDistributionData)
        .forEach(group => {
          const total = sum(group.values, d => d["Household Income"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Household Income"] / total * 100 : d.share = 0);
        });
    }

    return (
      <SectionColumns>
        <SectionTitle>Wage Distribution</SectionTitle>
        <article>
          {/* Top stats and short paragraph about Wage Gini. */}
          <Stat
            title="Wage GINI"
            year={wageGinidataAvailable ? wageGinidata[0].Year : ""}
            value={wageGinidataAvailable ? wageGinidata[0]["Wage GINI"] : "N/A"}
          />
          {wageGinidataAvailable ? <p>In {wageGinidata[0].Year}, the income inequality in {wageGinidata[0].Geography} was {wageGinidata[0]["Wage GINI"]}. The GINI coefficient is a measure of statistical dispersion intended to represent the equality of a distribution, and is the most commonly used measure of inequality. Values range from 0 to 1, with 0 being perfect equality.</p> : ""}
          {wageDistributionDataAvailable ? <p>The following chart shows the household income bucket and share for each bucket in {wageDistributionData[0].Geography}.</p> : ""}
        </article>

        {/* Draw Geomap to show wage distribution for each place in the Wayne county. */}
        {wageDistributionDataAvailable
          ? <BarChart config={{
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          /> : <div></div>}
      </SectionColumns>
    );
  }
}

WageDistribution.defaultProps = {
  slug: "wage-distribution"
};

WageDistribution.need = [
  fetchData("wageDistributionData", "https://acs.datausa.io/api/data?measures=Household Income&drilldowns=Household Income Bucket&Geography=<id>&Year=all", d => d.data),
  fetchData("wageGinidata", "https://acs.datausa.io/api/data?measures=Wage GINI&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  wageDistributionData: state.data.wageDistributionData,
  wageGinidata: state.data.wageGinidata
});

export default connect(mapStateToProps)(WageDistribution);

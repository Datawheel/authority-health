import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import rangeFormatter from "utils/rangeFormatter";
import growthCalculator from "utils/growthCalculator";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatRentersByIncomePercentage = rentersByIncomePercentage => {
  nest()
    .key(d => d.Year)
    .entries(rentersByIncomePercentage)
    .forEach(group => {
      const total = sum(group.values, d => d["Renters by Income Percentage"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Renters by Income Percentage"] / total * 100 : d.share = 0);
    });
  return rentersByIncomePercentage;
};

class Rentals extends SectionColumns {

  render() {

    const {meta, rentAmountData, utilitiesData, rentersByIncomePercentage} = this.props;

    const rentAmountDataAvailable = rentAmountData.length !== 0;
    const utilitiesDataAvailable = utilitiesData.length !== 0;
    const rentersByIncomePercentageAvailable = rentersByIncomePercentage.length !== 0;

    let recentYearNoExtraUtilitiesPercentage;
    if (utilitiesDataAvailable) {
      const totalUtilitiesData = utilitiesData[0]["Renter-Occupied Housing Units"] + utilitiesData[1]["Renter-Occupied Housing Units"];
      recentYearNoExtraUtilitiesPercentage = totalUtilitiesData !== 0 ? utilitiesData[1]["Renter-Occupied Housing Units"] / totalUtilitiesData * 100 : 0;
    }

    let topIncomeToPayMostRent;
    if (rentersByIncomePercentageAvailable) topIncomeToPayMostRent = formatRentersByIncomePercentage(rentersByIncomePercentage).sort((a, b) => b.share - a.share)[0];

    let growthRate;
    if (rentAmountDataAvailable) growthRate = growthCalculator(rentAmountData[0]["Rent Amount"], rentAmountData[1]["Rent Amount"]);

    return (
      <SectionColumns>
        <SectionTitle>Rentals</SectionTitle>
        <article>
          {/* Show recent Year Rent amount. */}
          <Stat
            title="Median Rent"
            year={rentAmountDataAvailable ? rentAmountData[0].Year : ""}
            value={rentAmountDataAvailable ? `$${formatAbbreviate(rentAmountData[0]["Rent Amount"])}/month` : "N/A"}
          />
          {/* Show stats for Renter-Occupied Housing Units with Extra Pay on Utilities for most recent year. */}
          <Stat
            title="Units with utilities included"
            year={utilitiesDataAvailable ? utilitiesData[0].Year : ""}
            value={utilitiesDataAvailable ? `${formatPercentage(recentYearNoExtraUtilitiesPercentage)}` : "N/A"}
          />

          <p>{rentAmountDataAvailable ? <span>In {rentAmountData[0].Year}, the median price for a rental unit in {rentAmountData[0].Geography} was ${formatAbbreviate(rentAmountData[0]["Rent Amount"])}/month. This is a {growthRate < 0 ? formatPercentage(growthRate * -1) : formatPercentage(growthRate)} {growthRate < 0 ? "decline" : "increase"} from the previous year (${formatAbbreviate(rentAmountData[1]["Rent Amount"])}/month).</span> : ""}</p>
          <p>{utilitiesDataAvailable ? <span>{formatPercentage(recentYearNoExtraUtilitiesPercentage)} of the rental properties in {utilitiesData[0].Geography} include utilities with the price of rent.</span> : ""}</p>
          <p>{rentersByIncomePercentageAvailable ? <span> The average income bracket for renters in {topIncomeToPayMostRent.Geography} is {rangeFormatter(topIncomeToPayMostRent["Household Income"])} and the following bar chart shows the renter distribution across all income levels.</span> : ""}</p>

          {/* Create a LinePlot. */}
          {rentAmountDataAvailable
            ? <LinePlot config={{
              data: rentAmountData,
              discrete: "x",
              height: 175,
              groupBy: "Geography",
              x: "Year",
              y: "Rent Amount",
              yConfig: {
                tickFormat: d => `$${formatAbbreviate(d)}`,
                title: "Rent Per Month"
              },
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => `$${formatAbbreviate(d["Rent Amount"])}`]]}
            }}
            /> : <div></div>}
          <Contact slug={this.props.slug} />
        </article>

        {rentersByIncomePercentageAvailable
          ? <BarChart config={{
            data: `https://acs.datausa.io/api/data?measures=Renters by Income Percentage&drilldowns=Household Income&Geography=${meta.id}&Year=all`,
            discrete: "x",
            legend: false,
            groupBy: "Household Income",
            x: d => d["Household Income"],
            y: "share",
            time: "Year",
            xSort: (a, b) => a["ID Household Income"] - b["ID Household Income"],
            xConfig: {
              labelRotation: false,
              tickFormat: d => rangeFormatter(d),
              title: "Household Income"
            },
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Share of Renters"},
            shapeConfig: {label: false},
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => formatRentersByIncomePercentage(resp.data)}
          /> : <div></div>}
      </SectionColumns>
    );
  }
}

Rentals.defaultProps = {
  slug: "rentals"
};

Rentals.need = [
  fetchData("rentAmountData", "/api/data?measures=Rent Amount&Geography=<id>&Year=all", d => d.data), // gets all year data to find growthRate
  fetchData("utilitiesData", "/api/data?measures=Renter-Occupied Housing Units&drilldowns=Inclusion of Utilities in Rent&Geography=<id>&Year=latest", d => d.data),
  fetchData("rentersByIncomePercentage", "https://acs.datausa.io/api/data?measures=Renters by Income Percentage&drilldowns=Household Income&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  rentAmountData: state.data.rentAmountData,
  utilitiesData: state.data.utilitiesData,
  rentersByIncomePercentage: state.data.rentersByIncomePercentage
});

export default connect(mapStateToProps)(Rentals);

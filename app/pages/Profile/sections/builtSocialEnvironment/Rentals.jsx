import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";
import growthCalculator from "../../../../utils/growthCalculator";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Rentals extends SectionColumns {

  render() {

    const {rentAmountData, utilitiesData, rentersByIncomePercentage} = this.props;
    const totalUtilitiesData = utilitiesData[0]["Renter-Occupied Housing Units"] + utilitiesData[1]["Renter-Occupied Housing Units"];
    const recentYearNoExtraUtilitiesPercentage = utilitiesData[1]["Renter-Occupied Housing Units"] / totalUtilitiesData * 100;

    const recentYearRentersByIncomePercentage = {};
    nest()
      .key(d => d.Year)
      .entries(rentersByIncomePercentage)
      .forEach(group => {
        const total = sum(group.values, d => d["Renters by Income Percentage"]);
        group.values.forEach(d => d.share = d["Renters by Income Percentage"] / total * 100);
        group.key >= rentersByIncomePercentage[0].Year ? Object.assign(recentYearRentersByIncomePercentage, group) : {};
      });

    let topIncomeToPayMostRent = recentYearRentersByIncomePercentage.values.sort((a, b) => b.share - a.share);
    topIncomeToPayMostRent = topIncomeToPayMostRent[0];

    const growthRate = growthCalculator(rentAmountData[0]["Rent Amount"], rentAmountData[1]["Rent Amount"]);

    return (
      <SectionColumns>
        <SectionTitle>Rentals</SectionTitle>
        <article>
          {/* Show recent Year Rent amount. */}
          <Stat
            title="Median Rent"
            year={rentAmountData[0].Year}
            value={`$${formatAbbreviate(rentAmountData[0]["Rent Amount"])}/month`}
          />
          {/* Show stats for Renter-Occupied Housing Units with Extra Pay on Utilities for most recent year. */}
          <Stat
            title="Units with utilities included"
            year={utilitiesData[0].Year}
            value={`${formatPercentage(recentYearNoExtraUtilitiesPercentage)}`}
          />

          <p>In {rentAmountData[0].Year}, the median price for a rental unit in {rentAmountData[0].Geography} was ${formatAbbreviate(rentAmountData[0]["Rent Amount"])}/month. This is a {growthRate < 0 ? formatPercentage(growthRate * -1) : formatPercentage(growthRate)} {growthRate < 0 ? "decline" : "increase"} from the previous year (${formatAbbreviate(rentAmountData[1]["Rent Amount"])}/month).</p>
          <p>{formatPercentage(recentYearNoExtraUtilitiesPercentage)} of the rental properties in {utilitiesData[0].Geography} include utilities with the price of rent.</p>
          <p>The average income bracket for renters in {topIncomeToPayMostRent.Geography} is {rangeFormatter(topIncomeToPayMostRent["Household Income"])} and the following bar chart shows the renter distribution across all income levels.</p>
          
          {/* Create a LinePlot. */}
          <LinePlot config={{
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
          />
        </article>

        <BarChart config={{
          data: rentersByIncomePercentage,
          discrete: "x",
          height: 400,
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
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["Location", d => d.Geography]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Rentals.defaultProps = {
  slug: "rentals"
};

Rentals.need = [
  fetchData("rentAmountData", "/api/data?measures=Rent Amount&Geography=<id>&Year=all", d => d.data),
  fetchData("utilitiesData", "/api/data?measures=Renter-Occupied Housing Units&drilldowns=Inclusion of Utilities in Rent&Geography=<id>&Year=latest", d => d.data),
  fetchData("rentersByIncomePercentage", "https://acs.datausa.io/api/data?measures=Renters by Income Percentage&drilldowns=Household Income&Year=all&Geography=<id>", d => d.data)
];

const mapStateToProps = state => ({
  rentAmountData: state.data.rentAmountData,
  utilitiesData: state.data.utilitiesData,
  rentersByIncomePercentage: state.data.rentersByIncomePercentage
});

export default connect(mapStateToProps)(Rentals);

import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class HouseRentals extends SectionColumns {

  render() {

    const {rentAmountData, utilitiesData, rentersByIncomePercentage} = this.props;
    const totalUtilitiesData = utilitiesData[0].Population + utilitiesData[1].Population;
    const recentYearNoExtraUtilitiesPercentage = utilitiesData[1].Population / totalUtilitiesData * 100;

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

    return (
      <SectionColumns>
        <SectionTitle>House Rentals</SectionTitle>
        <article>
          {/* Show recent Year Rent amount. */}
          <Stat
            title={`Median Rent Amount in ${rentAmountData[0].Year}`}
            value={`${rentAmountData[0].County} $${formatAbbreviate(rentAmountData[0]["Rent Amount"])}`}
          />
          {/* Show stats for Renter-Occupied Housing Units with Extra Pay on Utilities for most recent year. */}
          <Stat
            title={`Rental Housing Units with Utilities Included in ${utilitiesData[0].Year}`}
            value={`${utilitiesData[1].County} ${formatAbbreviate(recentYearNoExtraUtilitiesPercentage)}%`}
          />
          {/* Show stats for Household Income to pay maximum Rent in most recent year. */}
          <Stat
            title={`Household Income to pay maximum Rent in ${topIncomeToPayMostRent.Year}`}
            value={`${rangeFormatter(topIncomeToPayMostRent["Household Income"])} ${formatPercentage(topIncomeToPayMostRent.share)}`}
          />
          <p>The Barchart here shows the Household Income buckets and the Percentage of rent paid based on the Household Income.</p>
          {/* Create a LinePlot based on the dropdown choice. */}
          <LinePlot config={{
            data: rentAmountData,
            discrete: "x",
            height: 175,
            groupBy: "ID County",
            label: d => d.Year,
            x: "Year",
            xConfig: {
              title: "Year"
            },
            y: "Rent Amount",
            yConfig: {
              tickFormat: d => `$${formatAbbreviate(d)}`,
              title: "Rent amount"
            },
            tooltipConfig: {tbody: [["Value", d => `$${formatAbbreviate(d["Rent Amount"])}`]]}
          }}
          />
          <p>The LinePlot above shows the Median Rental amount for different years in the {rentAmountData[0].County} County.</p>
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
            title: "Renters by Income Percentage"},
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

HouseRentals.defaultProps = {
  slug: "house-rentals"
};

HouseRentals.need = [
  fetchData("rentAmountData", "/api/data?measures=Rent%20Amount&County=<id>&Year=all", d => d.data),
  fetchData("utilitiesData", "/api/data?measures=Population&drilldowns=Inclusion%20of%20Utilities%20in%20Rent&County=<id>&Year=latest", d => d.data),
  fetchData("rentersByIncomePercentage", "https://joshua-tree.datausa.io/api/data?measures=Renters%20by%20Income%20Percentage&drilldowns=Household%20Income&Year=all&Geography=<id>", d => d.data)
];

const mapStateToProps = state => ({
  rentAmountData: state.data.rentAmountData,
  utilitiesData: state.data.utilitiesData,
  rentersByIncomePercentage: state.data.rentersByIncomePercentage
});
  
export default connect(mapStateToProps)(HouseRentals);

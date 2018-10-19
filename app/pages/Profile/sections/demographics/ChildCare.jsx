import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatAge = d => rangeFormatter(d) === "< 6" || rangeFormatter(d) === "6 - 11" ? `${rangeFormatter(d)} months` : `${rangeFormatter(d)} years`;

class ChildCare extends SectionColumns {

  render() {

    const {responsibilityData} = this.props;

    // Add the total population for each year data then find the percentage of grandparents responsible.
    const recentYearData = {};
    nest()
      .key(d => d.Year)
      .entries(responsibilityData.data)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= responsibilityData.data[0].Year ? Object.assign(recentYearData, group) : {};
      });

    // Find the top data for the most recent year
    const recentYearFilteredData = recentYearData.values.filter(d => d["ID Responsibility Length"] !== 5 && d["ID Responsibility Length"] !== 6);
    recentYearFilteredData.sort((a, b) =>  b.share - a.share);
    const topRecentYearData = recentYearFilteredData[0];

    // Filter the data and pass it to the BarChart "data" key.
    const data = responsibilityData.data.filter(d => d["ID Responsibility Length"] !== 5 && d["ID Responsibility Length"] !== 6);

    return (
      <SectionColumns>
        <SectionTitle>Child Care</SectionTitle>
        <article>
          {/* Display stats and write short description of the top data for the most recent year */}
          <Stat
            title={`Most common age of grandchildren and Grandparents responsible in ${recentYearFilteredData[0].Year} `} 
            value={`${formatAge(topRecentYearData["Responsibility Length"])} ${formatPercentage(topRecentYearData.share)}`}
          />
          <p>In {topRecentYearData.Year}, {formatPercentage(topRecentYearData.share)} of the grandparents were responsible for their grandchildren. The most common age group of grandchildren was {formatAge(topRecentYearData["Responsibility Length"])} for this location.</p>
          <p>The Bar Chart here shows the breakdown by age of grandchildren and the percentage of grandparents responsible for their grandchildren.</p>
        </article>

        {/* Draw a BarChart */}
        <BarChart config={{
          data,
          discrete: "x",
          height: 400,
          groupBy: "Responsibility Length",
          legend: false,
          x: d => d["Responsibility Length"],
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Responsibility Length"] - b["ID Responsibility Length"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => formatAge(d)
          },
          yConfig: {tickFormat: d => formatPercentage(d)},
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

ChildCare.defaultProps = {
  slug: "child-care"
};

ChildCare.need = [
  fetchData("responsibilityData", "/api/data?measures=Population&drilldowns=Responsibility%20Length&Year=all")
];

const mapStateToProps = state => ({
  responsibilityData: state.data.responsibilityData
});
  
export default connect(mapStateToProps)(ChildCare);

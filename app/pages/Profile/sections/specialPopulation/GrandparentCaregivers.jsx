import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import rangeFormatter from "utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatAge = d => rangeFormatter(d) === "< 6" || rangeFormatter(d) === "6 - 11" ? `${rangeFormatter(d)} months` : `${rangeFormatter(d)} years`;

const formatResponsibilityData = responsibilityData => {
// Add the total population for each year data then find the percentage of grandparents responsible.
  nest()
    .key(d => d.Year)
    .entries(responsibilityData)
    .forEach(group => {
      const total = sum(group.values, d => d["Grandparent Caregivers"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Grandparent Caregivers"] / total * 100 : d.share = 0);
    });

  // Find the top data for the most recent year
  const filteredData = responsibilityData.filter(d => d["ID Responsibility Length"] !== 5 && d["ID Responsibility Length"] !== 6);
  const topRecentYearData = filteredData.sort((a, b) =>  b.share - a.share)[0];
  const overallGrandparentsResponsible = filteredData.reduce((acc, currValue) => acc + currValue.share, 0);

  return [filteredData, topRecentYearData, overallGrandparentsResponsible];
};

class GrandparentCaregivers extends SectionColumns {

  render() {

    const {meta, responsibilityData} = this.props;

    const responsibilityDataAvailable = responsibilityData.length !== 0;

    if (responsibilityDataAvailable) {
      const formattedResponsibilityData = formatResponsibilityData(responsibilityData);
      const topRecentYearData = formattedResponsibilityData[1];
      const overallGrandparentsResponsible = formattedResponsibilityData[2];

      return (
        <SectionColumns>
          <SectionTitle>Grandparent Caregivers</SectionTitle>
          <article>
            {/* Display stats and write short description of the top data for the most recent year */}
            <Stat
              title="Most common age group"
              year={topRecentYearData.Year}
              value={formatAge(topRecentYearData["Responsibility Length"])}
              qualifier={formatPercentage(topRecentYearData.share)}
            />
            <p>In {topRecentYearData.Year}, {formatPercentage(overallGrandparentsResponsible)} of grandparents in {topRecentYearData.Geography} were the primary care givers to their grandchildren. The most common age group of grandchildren is {formatAge(topRecentYearData["Responsibility Length"])}.</p>
            <p>The chart here shows the breakdown by age of grandchildren and the percentage of grandparents responsible for them.</p>

            <Contact slug={this.props.slug} />

          </article>

          {/* Draw a BarChart */}
          <BarChart config={{
            data: `/api/data?measures=Grandparent Caregivers&drilldowns=Responsibility Length&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 400,
            groupBy: "Responsibility Length",
            legend: false,
            x: d => d["Responsibility Length"],
            y: "share",
            time: "Year",
            xSort: (a, b) => a["ID Responsibility Length"] - b["ID Responsibility Length"],
            xConfig: {
              labelRotation: false,
              tickFormat: d => formatAge(d)
            },
            yConfig: {tickFormat: d => formatPercentage(d)},
            shapeConfig: {label: false},
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => formatResponsibilityData(resp.data)[0]}
          />
        </SectionColumns>
      );
    }
    else return <div></div>;
  }
}

GrandparentCaregivers.defaultProps = {
  slug: "grandparent-caregivers"
};

GrandparentCaregivers.need = [
  fetchData("responsibilityData", "/api/data?measures=Grandparent Caregivers&drilldowns=Responsibility Length&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  responsibilityData: state.data.responsibilityData
});

export default connect(mapStateToProps)(GrandparentCaregivers);

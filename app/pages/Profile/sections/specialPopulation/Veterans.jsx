import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Veterans extends SectionColumns {

  render() {

    const {veteransEmploymentStatus} = this.props;
    console.log("veteransEmploymentStatus: ", veteransEmploymentStatus);

    // Get data for Part-time and Full-time Dentists.
    const recentYearVeteransByEmploymentStatus = {};
    nest()
      .key(d => d.Year)
      .entries(veteransEmploymentStatus)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= veteransEmploymentStatus[0].Year ? Object.assign(recentYearVeteransByEmploymentStatus, group) : {};
      });

    recentYearVeteransByEmploymentStatus.values.sort((a, b) => b.sort - a.sort);
    const topEmploymentStatus = recentYearVeteransByEmploymentStatus.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Veterans</SectionTitle>
        <article>
          <Stat 
            title={`Majority Employment Status in ${topEmploymentStatus.Year}`}
            value={`${topEmploymentStatus["Employment Status"]} ${formatPercentage(topEmploymentStatus.share)}`}
          />
        </article>

        {/* Draw a BarChart to show data for Veterans by their Employement Status. */}
        <BarChart config={{
          data: veteransEmploymentStatus,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Employment Status",
          x: "Employment Status",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Employment Status"] - b["ID Employment Status"],
          xConfig: {
            labelRotation: false,
            title: "Employment Status"
          },
          yConfig: {
            ticks: [],
            title: "Percentage of Veterans",
            tickFormat: d => formatPercentage(d)
          },
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Veterans.defaultProps = {
  slug: "veterans"
};

Veterans.need = [
  fetchData("veteransEmploymentStatus", "/api/data?measures=Population&drilldowns=Employment%20Status&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  veteransEmploymentStatus: state.data.veteransEmploymentStatus
});

export default connect(mapStateToProps)(Veterans);

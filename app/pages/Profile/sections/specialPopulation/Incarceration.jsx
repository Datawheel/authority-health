import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Incarceration extends SectionColumns {

  render() {
    const {incarcerationData} = this.props;

    // Format data for Incarceration data Barchart and stats.
    const data = [];
    incarcerationData.data.forEach(d => {
      incarcerationData.source[0].measures.forEach(incarcerationType => {
        if (d[incarcerationType] !== null) {
          data.push(Object.assign({}, d, {IncarcerationType: incarcerationType}));
        }
      });
    });

    const recentYearIncarcerationData = {};
    nest()
      .key(d => d.Year)
      .entries(data)
      .forEach(group => {
        const total = sum(group.values, d => d[d.IncarcerationType]);
        group.values.forEach(d => d.share = d[d.IncarcerationType] / total * 100);
        group.key >= data[0].Year ? Object.assign(recentYearIncarcerationData, group) : {};
      });

    // Filter "Total" from the Incarceration data.
    const filteredData = data.filter(d => d.IncarcerationType !== "Total");

    // Find top recent year Incarceration data.
    const filteredRecentYearData = recentYearIncarcerationData.values.filter(d => d.IncarcerationType !== "Total");
    const sortedData = filteredRecentYearData.sort((a, b) => b.share - a.share);
    const topIncarcerationData = sortedData[0];

    return (
      <SectionColumns>
        <SectionTitle>Incarceration</SectionTitle>
        <article>
          <Stat
            title="Top Incarceration value"
            year={topIncarcerationData.Year}
            value={`${topIncarcerationData.IncarcerationType}: ${topIncarcerationData.Offense}`}
            qualifier={formatPercentage(topIncarcerationData.share)}
          />
          <p>The Barchart here shows the types of Offenses for each Incarceration type.</p>
          <p>In {topIncarcerationData.Year}, the top Incarceration type was {topIncarcerationData.IncarcerationType} for {topIncarcerationData.Offense} with the share of {formatPercentage(topIncarcerationData.share)}.</p>
        </article>

        {/* Draw a Barchart to show Incarceration data. */}
        <BarChart config={{
          data: filteredData,
          discrete: "x",
          height: 400,
          legend: false,
          label: d => ` ${d.IncarcerationType}: ${d.Offense}`,
          groupBy: "Offense",
          x: "IncarcerationType",
          y: "share",
          time: "ID Year",
          yConfig: {tickFormat: d => formatPercentage(d)},
          xConfig: {labelRotation: false},
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Incarceration.defaultProps = {
  slug: "incarceration"
};

Incarceration.need = [
  fetchData("incarcerationData", "/api/data?measures=Total,Prison,Jail,Jail%2FProbation,Probation,Other&drilldowns=Offense&Year=all")
];

const mapStateToProps = state => ({
  incarcerationData: state.data.incarcerationData
});

export default connect(mapStateToProps)(Incarceration);

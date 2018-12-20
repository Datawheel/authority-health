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
    const {incarcerationData, allOffenceData, allPunishmentData} = this.props;

    // Format data for Incarceration data Barchart and stats.
    const data = [];
    incarcerationData.data.forEach(d => {
      incarcerationData.source[0].measures.forEach(punishment => {
        if (d[punishment] !== null) {
          data.push(Object.assign({}, d, {Punishment: punishment}));
        }
      });
    });

    // Filter "Total" from the Incarceration data.
    const filteredData = data.filter(d => d.Punishment !== "Total");
    const recentYearIncarcerationData = {};
    nest()
      .key(d => d.Year)
      .entries(filteredData)
      .forEach(group => {
        const total = sum(group.values, d => d[d.Punishment]);
        group.values.forEach(d => d.share = d[d.Punishment] / total * 100);
        group.key >= data[0].Year ? Object.assign(recentYearIncarcerationData, group) : {};
      });
    // Find top recent year Incarceration data.
    const filteredRecentYearData = recentYearIncarcerationData.values;
    const sortedData = filteredRecentYearData.sort((a, b) => b.share - a.share);
    const topIncarcerationData = sortedData[0];

    // Find top most offence for recent year.
    nest()
      .key(d => d.Year)
      .entries(allOffenceData)
      .forEach(group => {
        const total = sum(group.values, d => d.Total);
        group.values.forEach(d => d.share = d.Total / total * 100);
      });
    allOffenceData.sort((a, b) => b.share - a.share);
    const topOffenceData = allOffenceData[0];

    // Find top most Punishment data.
    const punishmentdata = [];
    allPunishmentData.data.forEach(d => {
      allPunishmentData.source[0].measures.forEach(punishment => {
        if (d[punishment] !== null) {
          punishmentdata.push(Object.assign({}, d, {Punishment: punishment}));
        }
      });
    });
    nest()
      .key(d => d.Punishment)
      .entries(punishmentdata)
      .forEach(group => {
        group.values.forEach(d => d.share = d[d.Punishment] / d.Total * 100);
      });
    const filteredPunishmetData = punishmentdata.filter(d => d.Punishment !== "Total");
    const topPunishmentData = filteredPunishmetData.sort((a, b) => b.share - a.share)[0];

    return (
      <SectionColumns>
        <SectionTitle>Incarceration</SectionTitle>
        <article>
          <Stat
            title="Most common crime"
            year={topOffenceData.Year}
            value={`${topOffenceData.Offense}`}
            qualifier={formatPercentage(topOffenceData.share)}
          />
          <Stat
            title="Most common punishment"
            year={topPunishmentData.Year}
            value={`${topPunishmentData.Punishment}`}
            qualifier={formatPercentage(topPunishmentData.share)}
          />
          <p>In {topIncarcerationData.Year}, the most common crime in {topIncarcerationData.Geography} County was {topOffenceData.Offense.toLowerCase()} ({formatPercentage(topOffenceData.share)}) and the most common punishment was {topPunishmentData.Punishment.toLowerCase()} ({formatPercentage(topPunishmentData.share)}).</p>
          <p>The chart here shows the types of offenses for each incarceration type.</p>
        </article>

        {/* Draw a Barchart to show Incarceration data. */}
        <BarChart config={{
          data: filteredData,
          discrete: "x",
          height: 400,
          stacked: true,
          label: d => `${d.Offense}`,
          groupBy: "Offense",
          x: "Punishment",
          y: "share",
          time: "ID Year",
          yConfig: {tickFormat: d => formatPercentage(d)},
          xConfig: {labelRotation: false},
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Share", d => formatPercentage(d.share)]]}
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
  fetchData("incarcerationData", "/api/data?measures=Total,Prison,Jail,Jail/Probation,Probation,Other&drilldowns=Offense&Geography=<id>&Year=all"),
  fetchData("allOffenceData", "/api/data?measures=Total&drilldowns=Offense&Geography=<id>&Year=latest", d => d.data),
  fetchData("allPunishmentData", "/api/data?measures=Total,Prison,Jail,Jail/Probation,Probation,Other&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  incarcerationData: state.data.incarcerationData,
  allOffenceData: state.data.allOffenceData,
  allPunishmentData: state.data.allPunishmentData
});

export default connect(mapStateToProps)(Incarceration);

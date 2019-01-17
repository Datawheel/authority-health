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

class Poverty extends SectionColumns {

  render() {

    const {povertyByRace, povertyByAgeAndGender} = this.props;

    const filterOutTotalRaceData = povertyByRace.filter(d => d.Race !== "Total");

    // Get the Poverty by Race data.
    const recentYearPovertyByRaceData = {};
    nest()
      .key(d => d.Year)
      .entries(filterOutTotalRaceData)
      .forEach(group => {
        const total = sum(group.values, d => d["Poverty Population"]);
        group.values.forEach(d => d.share = d["Poverty Population"] / total * 100);
        group.key >= filterOutTotalRaceData[0].Year ? Object.assign(recentYearPovertyByRaceData, group) : {};
      });
    const filterDataBelowPovertyByRace = filterOutTotalRaceData.filter(d => d["ID Poverty Status"] === 0);

    // Find top stats for Poverty by Race
    const filterRecentYearPovertyByRace = recentYearPovertyByRaceData.values.filter(d => d["ID Poverty Status"] === 0).sort((a, b) => b.share - a.share);
    const topPovertyByRace = filterRecentYearPovertyByRace[0];

    // Get data for Poverty by Age and Gender.
    const belowPovertyLevelByAgeAndGender = povertyByAgeAndGender.filter(d => d["ID Poverty Status"] === 0);
    const recentYearPovertyByAgeAndGender = {};
    nest()
      .key(d => d.Year)
      .entries(belowPovertyLevelByAgeAndGender)
      .forEach(group => {
        const total = sum(group.values, d => d["Poverty Population"]);
        group.values.forEach(d => d.share = d["Poverty Population"] / total * 100);
        group.key >= belowPovertyLevelByAgeAndGender[0].Year ? Object.assign(recentYearPovertyByAgeAndGender, group) : {};
      });

    // Find top stats for povetry by Age and Gender.
    const recentYearPovertyByAgeAndGenderFiltered = recentYearPovertyByAgeAndGender.values.filter(d => d["ID Poverty Status"] === 0);

    // Find top male poverty data.
    const malePovertyData = recentYearPovertyByAgeAndGenderFiltered.filter(d => d.Gender === "Male").sort((a, b) => b.share - a.share);
    const topMalePovertyData = malePovertyData[0];

    // Find top female poverty data.
    const femalePovertyData = recentYearPovertyByAgeAndGenderFiltered.filter(d => d.Gender === "Female").sort((a, b) => b.share - a.share);
    const topFemalePovertyData = femalePovertyData[0];

    return (
      <SectionColumns>
        <SectionTitle>Poverty</SectionTitle>
        <article>
          <Stat
            title="Most common race"
            year={topPovertyByRace.Year}
            value={topPovertyByRace.Race}
            qualifier={formatPopulation(topPovertyByRace.share)}
          />
          <Stat
            title="Most common male age"
            year={topMalePovertyData.Year}
            value={topMalePovertyData.Age}
            qualifier={formatPopulation(topMalePovertyData.share)}
          />
          <Stat
            title="Most common female age"
            year={topFemalePovertyData.Year}
            value={topFemalePovertyData.Age}
            qualifier={formatPopulation(topFemalePovertyData.share)}
          />
          <p>In {topPovertyByRace.Year}, most common male age in poverty was {topMalePovertyData.Age.toLowerCase()} ({formatPopulation(topMalePovertyData.share)}) while most common female age was {topFemalePovertyData.Age.toLowerCase()} ({formatPopulation(topFemalePovertyData.share)}) in {topFemalePovertyData.Geography}. The chart on the right shows male and female age distribution in poverty.</p>
          <p>In {topPovertyByRace.Year}, the majority race in poverty was {topPovertyByRace.Race} ({formatPopulation(topPovertyByRace.share)}) of the total population in {topPovertyByRace.Geography}. The following chart shows the population in poverty by race.</p>

          <BarChart config={{
            data: filterDataBelowPovertyByRace,
            discrete: "y",
            height: 300,
            groupBy: "Race",
            legend: false,
            y: "Race",
            x: "share",
            time: "Year",
            yConfig: {
              ticks: [],
              title: "Population Below Poverty by Race"
            },
            xConfig: {
              tickFormat: d => formatPopulation(d),
              title: "Share"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)]]}
          }}
          />
        </article>

        <BarChart config={{
          data: belowPovertyLevelByAgeAndGender,
          discrete: "x",
          height: 400,
          groupBy: "Gender",
          x: "Age",
          y: "share",
          time: "Year",
          xSort: (a, b) => a["ID Age"] - b["ID Age"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d),
            title: "Population Below Poverty by Age and Gender"
          },
          yConfig: {
            tickFormat: d => formatPopulation(d),
            title: "Share"
          },
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPopulation(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Poverty.defaultProps = {
  slug: "poverty"
};

Poverty.need = [
  fetchData("povertyByRace", "https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Race&Geography=<id>&Year=all", d => d.data),
  fetchData("povertyByAgeAndGender", "https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Age,Gender&Geography=<id>&Year=all", d => d.data),
  fetchData("incomeToPovertyLevelRatio", "/api/data?measures=Population&drilldowns=Ratio of Income to Poverty Level&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  povertyByRace: state.data.povertyByRace,
  povertyByAgeAndGender: state.data.povertyByAgeAndGender,
  incomeToPovertyLevelRatio: state.data.incomeToPovertyLevelRatio
});

export default connect(mapStateToProps)(Poverty);

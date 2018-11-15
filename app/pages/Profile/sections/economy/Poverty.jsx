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

    const {povertyByRace, povertyByAgeAndSex, incomeToPovertyLevelRatio} = this.props;

    const filterOutTotalRaceData = povertyByRace.filter(d => d.Race !== "Total");

    // Get the Poverty by Race data.
    const recentYearPovertyByRaceData = {};
    nest()
      .key(d => d.Year)
      .entries(filterOutTotalRaceData)
      .forEach(group => {
        const total = sum(group.values, d => d["Population in Poverty by Gender, Age, and Race"]);
        group.values.forEach(d => d.share = d["Population in Poverty by Gender, Age, and Race"] / total * 100);
        group.key >= filterOutTotalRaceData[0].Year ? Object.assign(recentYearPovertyByRaceData, group) : {};
      });
    const filterDataBelowPovertyByRace = filterOutTotalRaceData.filter(d => d["ID Poverty Status"] === 0);

    // Find top stats for Poverty by Race
    const filterRecentYearPovertyByRace = recentYearPovertyByRaceData.values.filter(d => d["ID Poverty Status"] === 0).sort((a, b) => b.share - a.share);
    const topPovertyByRace = filterRecentYearPovertyByRace[0];

    // Get data for Poverty by Age and Sex.
    const belowPovertyLevelByAgeAndSex = povertyByAgeAndSex.filter(d => d["ID Poverty Status"] === 0);
    const recentYearPovertyByAgeAndSex = {};
    nest()
      .key(d => d.Year)
      .entries(belowPovertyLevelByAgeAndSex)
      .forEach(group => {
        const total = sum(group.values, d => d["Population in Poverty by Gender, Age, and Race"]);
        group.values.forEach(d => d.share = d["Population in Poverty by Gender, Age, and Race"] / total * 100);
        group.key >= belowPovertyLevelByAgeAndSex[0].Year ? Object.assign(recentYearPovertyByAgeAndSex, group) : {};
      });

    // Find top stats for povetry by Age and Sex.
    const recentYearPovertyByAgeAndSexFiltered = recentYearPovertyByAgeAndSex.values.filter(d => d["ID Poverty Status"] === 0);

    // Find top male poverty data.
    const malePovertyData = recentYearPovertyByAgeAndSexFiltered.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share);
    const topMalePovertyData = malePovertyData[0];

    // Find top female poverty data.
    const femalePovertyData = recentYearPovertyByAgeAndSexFiltered.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share);
    const topFemalePovertyData = femalePovertyData[0];

    // Get Income To Poverty Level Ratio
    console.log("incomeToPovertyLevelRatio: ", incomeToPovertyLevelRatio);
    const recentYearIncomeToPovertyLevelRatio = {};
    nest()
      .key(d => d.Year)
      .entries(incomeToPovertyLevelRatio)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= incomeToPovertyLevelRatio[0].Year ? Object.assign(recentYearIncomeToPovertyLevelRatio, group) : {};
      });

    // Find recent year top stats
    recentYearIncomeToPovertyLevelRatio.values.sort((a, b) => b.share - a.share);
    const topIncomeToPovertyLevelRatio = recentYearIncomeToPovertyLevelRatio.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Poverty</SectionTitle>
        <article>
          <Stat
            title="Majority race below poverty"
            year={topPovertyByRace.Year}
            value={topPovertyByRace.Race}
            qualifier={formatPopulation(topPovertyByRace.share)}
          />
          <Stat
            title="Male poverty majority"
            year={topMalePovertyData.Year}
            value={topMalePovertyData.Age}
            qualifier={formatPopulation(topMalePovertyData.share)}
          />
          <Stat
            title="Female poverty majority"
            year={topFemalePovertyData.Year}
            value={topFemalePovertyData.Age}
            qualifier={formatPopulation(topFemalePovertyData.share)}
          />
          <Stat
            title="Top Income To Poverty Level Ratio"
            year={topIncomeToPovertyLevelRatio.Year}
            value={topIncomeToPovertyLevelRatio["Ratio of Income to Poverty Level"]}
            qualifier={formatPopulation(topIncomeToPovertyLevelRatio.share)}
          />
          <p>The mini barchart here shows the population below poverty level in the {topPovertyByRace.County}. In {topPovertyByRace.Year}, the majority race in poverty was {topPovertyByRace.Race} with {formatPopulation(topPovertyByRace.share)} of the total population in the {topPovertyByRace.County}.</p>

          <BarChart config={{
            data: filterDataBelowPovertyByRace,
            discrete: "y",
            height: 300,
            groupBy: "Race",
            legend: false,
            y: "Race",
            x: "share",
            time: "ID Year",
            label: d => d.Race,
            ySort: (a, b) => a["ID Race"] - b["ID Race"],
            yConfig: {
              ticks: [],
              title: "Poverty by Race"
            },
            xConfig: {
              tickFormat: d => formatPopulation(d),
              title: "Population below poverty"
            },
            tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
          }}
          />
        </article>

        <BarChart config={{
          data: belowPovertyLevelByAgeAndSex,
          discrete: "x",
          height: 400,
          groupBy: "Sex",
          x: "Age",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Age"] - b["ID Age"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d),
            title: "Age Buckets in years"
          },
          yConfig: {
            tickFormat: d => formatPopulation(d),
            title: "Population below poverty level"
          },
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
        }}
        />
        <BarChart config={{
          data: incomeToPovertyLevelRatio,
          discrete: "x",
          height: 400,
          groupBy: "Ratio of Income to Poverty Level",
          legend: false,
          x: "Ratio of Income to Poverty Level",
          y: "share",
          time: "ID Year",
          label: false,
          xSort: (a, b) => a["ID Ratio of Income to Poverty Level"] - b["ID Ratio of Income to Poverty Level"],
          xConfig: {
            title: "Income to Poverty Level ratio"
          },
          yConfig: {
            tickFormat: d => formatPopulation(d),
            title: "Population"
          },
          tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
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
  fetchData("povertyByRace", "https://joshua-tree.datausa.io/api/data?measures=Population%20in%20Poverty%20by%20Gender,%20Age,%20and%20Race&drilldowns=Poverty%20Status,Race&County=<id>&Year=all", d => d.data),
  fetchData("povertyByAgeAndSex", "https://joshua-tree.datausa.io/api/data?measures=Population%20in%20Poverty%20by%20Gender,%20Age,%20and%20Race&drilldowns=Poverty%20Status,Age,Sex&County=<id>&Year=all", d => d.data),
  fetchData("incomeToPovertyLevelRatio", "http://localhost:3300/api/data?measures=Population&drilldowns=Ratio%20of%20Income%20to%20Poverty%20Level&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  povertyByRace: state.data.povertyByRace,
  povertyByAgeAndSex: state.data.povertyByAgeAndSex,
  incomeToPovertyLevelRatio: state.data.incomeToPovertyLevelRatio
});

export default connect(mapStateToProps)(Poverty);

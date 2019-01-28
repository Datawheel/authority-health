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

    const povertyByRaceAvailable = povertyByRace.length !== 0;
    const povertyByAgeAndGenderAvailable = povertyByAgeAndGender.length !== 0;

    // Get the Poverty by Race data.
    const recentYearPovertyByRaceData = {};
    let filterDataBelowPovertyByRace, topPovertyByRace;
    if (povertyByRaceAvailable) {
      const filterOutTotalRaceData = povertyByRace.filter(d => d.Race !== "Total");
      nest()
        .key(d => d.Year)
        .entries(filterOutTotalRaceData)
        .forEach(group => {
          const total = sum(group.values, d => d["Poverty Population"]);
          group.values.forEach(d => d.share = d["Poverty Population"] / total * 100);
          group.key >= filterOutTotalRaceData[0].Year ? Object.assign(recentYearPovertyByRaceData, group) : {};
        });
      filterDataBelowPovertyByRace = filterOutTotalRaceData.filter(d => d["ID Poverty Status"] === 0);
      // Find top stats for Poverty by Race
      topPovertyByRace = recentYearPovertyByRaceData.values.filter(d => d["ID Poverty Status"] === 0).sort((a, b) => b.share - a.share)[0];
    }

    // Get data for Poverty by Age and Gender.
    let belowPovertyLevelByAgeAndGender, topFemalePovertyData, topMalePovertyData;
    const recentYearPovertyByAgeAndGender = {};
    if (povertyByAgeAndGenderAvailable) {
      belowPovertyLevelByAgeAndGender = povertyByAgeAndGender.filter(d => d["ID Poverty Status"] === 0);
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
      topMalePovertyData = recentYearPovertyByAgeAndGenderFiltered.filter(d => d.Gender === "Male").sort((a, b) => b.share - a.share)[0];
      // Find top female poverty data.
      topFemalePovertyData = recentYearPovertyByAgeAndGenderFiltered.filter(d => d.Gender === "Female").sort((a, b) => b.share - a.share)[0];
    }

    return (
      <SectionColumns>
        <SectionTitle>Poverty</SectionTitle>
        <article>
          <Stat
            title="Most common race"
            year={povertyByRaceAvailable ? topPovertyByRace.Year : ""}
            value={povertyByRaceAvailable ? topPovertyByRace.Race : "N/A"}
            qualifier={povertyByRaceAvailable ? formatPopulation(topPovertyByRace.share) : ""}
          />
          <Stat
            title="Most common male age"
            year={povertyByAgeAndGenderAvailable ? topMalePovertyData.Year : ""}
            value={povertyByAgeAndGenderAvailable ? topMalePovertyData.Age : "N/A"}
            qualifier={povertyByAgeAndGenderAvailable ? formatPopulation(topMalePovertyData.share) : ""}
          />
          <Stat
            title="Most common female age"
            year={povertyByAgeAndGenderAvailable ? topFemalePovertyData.Year : ""}
            value={povertyByAgeAndGenderAvailable ? topFemalePovertyData.Age : "N/A"}
            qualifier={povertyByAgeAndGenderAvailable ? formatPopulation(topFemalePovertyData.share) : ""}
          />
          {povertyByAgeAndGenderAvailable ? <p>In {topMalePovertyData.Year}, most common male age in poverty was {topMalePovertyData.Age.toLowerCase()} ({formatPopulation(topMalePovertyData.share)}) while most common female age was {topFemalePovertyData.Age.toLowerCase()} ({formatPopulation(topFemalePovertyData.share)}) in {topFemalePovertyData.Geography}. The chart on the right shows male and female age distribution in poverty. </p> : ""}
          {povertyByRaceAvailable ? <p>In {topPovertyByRace.Year}, the majority race in poverty was {topPovertyByRace.Race} ({formatPopulation(topPovertyByRace.share)}) of the total population in {topPovertyByRace.Geography}. The following chart shows the population in poverty by race.</p> : ""}

          {povertyByRaceAvailable
            ? <BarChart config={{
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
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)], ["Location", d => d.Geography]]}
            }}
            /> : <div></div>}
        </article>

        {povertyByAgeAndGenderAvailable
          ? <BarChart config={{
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPopulation(d.share)], ["Location", d => d.Geography]]}
          }}
          /> : <div></div>}
      </SectionColumns>
    );
  }
}

Poverty.defaultProps = {
  slug: "poverty"
};

Poverty.need = [
  fetchData("povertyByRace", "https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Race&Geography=<id>&Year=all", d => d.data),
  fetchData("povertyByAgeAndGender", "https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Age,Gender&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  povertyByRace: state.data.povertyByRace,
  povertyByAgeAndGender: state.data.povertyByAgeAndGender
});

export default connect(mapStateToProps)(Poverty);

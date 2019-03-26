import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import rangeFormatter from "utils/rangeFormatter";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

const formatPovertyByRaceData = povertyByRace => {
  const filterOutTotalRaceData = povertyByRace.filter(d => d.Race !== "Total");
  nest()
    .key(d => d.Year)
    .entries(filterOutTotalRaceData)
    .forEach(group => {
      const total = sum(group.values, d => d["Poverty Population"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Poverty Population"] / total * 100 : d.share = 0);
    });
  const filterDataBelowPovertyByRace = filterOutTotalRaceData.filter(d => d["ID Poverty Status"] === 0);
  // Find top stats for Poverty by Race
  const topPovertyByRace = filterDataBelowPovertyByRace.sort((a, b) => b.share - a.share)[0];
  return [filterDataBelowPovertyByRace, topPovertyByRace];
};

const formatPovertyByAgeAndGender = povertyByAgeAndGender => {
  const belowPovertyLevelByAgeAndGender = povertyByAgeAndGender.filter(d => d["ID Poverty Status"] === 0);
  nest()
    .key(d => d.Year)
    .entries(belowPovertyLevelByAgeAndGender)
    .forEach(group => {
      const total = sum(group.values, d => d["Poverty Population"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Poverty Population"] / total * 100 : d.share = 0);
    });
  // Find top male poverty data.
  const topMalePovertyData = belowPovertyLevelByAgeAndGender.filter(d => d.Gender === "Male").sort((a, b) => b.share - a.share)[0];
  // Find top female poverty data.
  const topFemalePovertyData = belowPovertyLevelByAgeAndGender.filter(d => d.Gender === "Female").sort((a, b) => b.share - a.share)[0];
  return [belowPovertyLevelByAgeAndGender, topMalePovertyData, topFemalePovertyData];
};

class Poverty extends SectionColumns {

  render() {

    const {meta, povertyByRace, povertyByAgeAndGender} = this.props;

    const povertyByRaceAvailable = povertyByRace.length !== 0;
    const povertyByAgeAndGenderAvailable = povertyByAgeAndGender.length !== 0;

    // Get the Poverty by Race data.
    let topPovertyByRace;
    if (povertyByRaceAvailable) {
      topPovertyByRace = formatPovertyByRaceData(povertyByRace)[1];
    }

    // Get data for Poverty by Age and Gender.
    let topFemalePovertyData, topMalePovertyData;
    if (povertyByAgeAndGenderAvailable) {
      const getPovertyByGenderData = formatPovertyByAgeAndGender(povertyByAgeAndGender);
      topMalePovertyData = getPovertyByGenderData[1];
      topFemalePovertyData = getPovertyByGenderData[2];
    }

    return (
      <SectionColumns>
        <SectionTitle>Poverty</SectionTitle>
        <article>
          <Stat
            title="Most common race"
            year={povertyByRaceAvailable ? topPovertyByRace.Year : ""}
            value={povertyByRaceAvailable ? topPovertyByRace.Race : "N/A"}
            qualifier={povertyByRaceAvailable ? `${formatPopulation(topPovertyByRace.share)} of the population in ${topPovertyByRace.Geography}` : ""}
          />
          <Stat
            title="Most common male age"
            year={povertyByAgeAndGenderAvailable ? topMalePovertyData.Year : ""}
            value={povertyByAgeAndGenderAvailable ? topMalePovertyData.Age : "N/A"}
            qualifier={povertyByAgeAndGenderAvailable ? `${formatPopulation(topMalePovertyData.share)} of the population in ${topMalePovertyData.Geography}` : ""}
          />
          <Stat
            title="Most common female age"
            year={povertyByAgeAndGenderAvailable ? topFemalePovertyData.Year : ""}
            value={povertyByAgeAndGenderAvailable ? topFemalePovertyData.Age : "N/A"}
            qualifier={povertyByAgeAndGenderAvailable ? `${formatPopulation(topFemalePovertyData.share)} of the population in ${topFemalePovertyData.Geography}` : ""}
          />
          {povertyByAgeAndGenderAvailable ? <p>In {topMalePovertyData.Year}, most common male age in poverty was {topMalePovertyData.Age.toLowerCase()} ({formatPopulation(topMalePovertyData.share)}) while most common female age was {topFemalePovertyData.Age.toLowerCase()} ({formatPopulation(topFemalePovertyData.share)}) in {topFemalePovertyData.Geography}. The chart on the right shows male and female age distribution in poverty. </p> : ""}
          {povertyByRaceAvailable ? <p>In {topPovertyByRace.Year}, the majority race in poverty was {topPovertyByRace.Race} ({formatPopulation(topPovertyByRace.share)}) of the total population in {topPovertyByRace.Geography}. The following chart shows the population in poverty by race.</p> : ""}

          {povertyByRaceAvailable
            ? <BarChart config={{
              data: `https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Race&Geography=${meta.id}&Year=all`,
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
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => formatPovertyByRaceData(resp.data)[0]}
            /> : <div></div>}
          <Contact slug={this.props.slug} />
        </article>

        {povertyByAgeAndGenderAvailable
          ? <BarChart config={{
            data: `https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Age,Gender&Geography=${meta.id}&Year=all`,
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => formatPovertyByAgeAndGender(resp.data)[0]}
          /> : <div></div>}
      </SectionColumns>
    );
  }
}

Poverty.defaultProps = {
  slug: "poverty"
};

Poverty.need = [
  fetchData("povertyByRace", "https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Race&Geography=<id>&Year=latest", d => d.data),
  fetchData("povertyByAgeAndGender", "https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Age,Gender&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  povertyByRace: state.data.povertyByRace,
  povertyByAgeAndGender: state.data.povertyByAgeAndGender
});

export default connect(mapStateToProps)(Poverty);

import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import Stat from "components/Stat";
import rangeFormatter from "utils/rangeFormatter";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const definitions = [
  {term: "Poverty", definition: "The Census Bureau uses a set of money income thresholds that vary by family size and composition to determine who is in poverty. If a family's total income is less than the family's threshold, then that family and every individual in it is considered in poverty. The official poverty thresholds do not vary geographically, but they are updated for inflation using Consumer Price Index (CPI-U). The official poverty definition uses money income before taxes and does not include capital gains or noncash benefits (such as public housing, Medicaid, and food stamps)."}
];

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

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {meta, povertyByRace, povertyByAgeAndGender, immigrantsInPoverty} = this.props;

    const povertyByRaceAvailable = povertyByRace.length !== 0;
    const povertyByAgeAndGenderAvailable = povertyByAgeAndGender.length !== 0;
    const immigrantsInPovertyAvailable = immigrantsInPoverty.length !== 0;

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

    // Find immigrants in poverty for current location.
    let immigrantsInPovertyData;
    if (immigrantsInPovertyAvailable) {
      const totalPopulation = sum(immigrantsInPoverty, d => d["Poverty by Nativity"]);
      immigrantsInPovertyData = immigrantsInPoverty.filter(d => d.Nativity === "Foreign Born" && d["ID Poverty Status"] === 0)[0];
      immigrantsInPovertyData.share = totalPopulation !== 0 ? immigrantsInPovertyData["Poverty by Nativity"] / totalPopulation * 100 : 0;
    }

    return (
      <SectionColumns>
        <SectionTitle>Poverty</SectionTitle>
        <article>
          <Stat
            title="race most impacted by poverty"
            year={povertyByRaceAvailable ? topPovertyByRace.Year : ""}
            value={povertyByRaceAvailable ? topPovertyByRace.Race : "N/A"}
            qualifier={povertyByRaceAvailable ? `${formatPopulation(topPovertyByRace.share)} of the total population in ${topPovertyByRace.Geography}` : ""}
          />
          <Stat
            title="male age most impacted by poverty"
            year={povertyByAgeAndGenderAvailable ? topMalePovertyData.Year : ""}
            value={povertyByAgeAndGenderAvailable ? topMalePovertyData.Age : "N/A"}
            qualifier={povertyByAgeAndGenderAvailable ? `${formatPopulation(topMalePovertyData.share)} of the male population in ${topMalePovertyData.Geography}` : ""}
          />
          <Stat
            title="female age most impacted by poverty"
            year={povertyByAgeAndGenderAvailable ? topFemalePovertyData.Year : ""}
            value={povertyByAgeAndGenderAvailable ? topFemalePovertyData.Age : "N/A"}
            qualifier={povertyByAgeAndGenderAvailable ? `${formatPopulation(topFemalePovertyData.share)} of the female population in ${topFemalePovertyData.Geography}` : ""}
          />
          <Stat
            title="immigrants most impacted by poverty"
            year={immigrantsInPovertyAvailable ? immigrantsInPovertyData.Year : ""}
            value={immigrantsInPovertyAvailable ? formatPopulation(immigrantsInPovertyData.share) : "N/A"}
            qualifier={immigrantsInPovertyAvailable ? `of the total population in ${immigrantsInPovertyData.Geography}` : ""}
          />

          {povertyByAgeAndGenderAvailable ? <p>In {topMalePovertyData.Year}, most common male age in poverty was {topMalePovertyData.Age.toLowerCase()} ({formatPopulation(topMalePovertyData.share)} of the male population) while most common female age was {topFemalePovertyData.Age.toLowerCase()} ({formatPopulation(topFemalePovertyData.share)} of the female population) in {topFemalePovertyData.Geography}.</p> : ""}
          {povertyByRaceAvailable ? <p>In {topPovertyByRace.Year}, the majority race in poverty was {topPovertyByRace.Race} ({formatPopulation(topPovertyByRace.share)} of the total population in {topPovertyByRace.Geography}).</p> : ""}

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />

          {povertyByRaceAvailable &&
            <BarChart config={{
              data: `https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Race&Geography=${meta.id}&Year=all`,
              discrete: "y",
              height: 300,
              groupBy: "Race",
              legend: false,
              y: "Race",
              x: "share",
              time: "Year",
              title: d => `Population Below Poverty by Race in ${d[0].Geography}`,
              xConfig: {
                tickFormat: d => formatPopulation(d),
                title: "Share"
              },
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatPovertyByRaceData(resp.data)[0];
            }}
            />
          }
        </article>

        {povertyByAgeAndGenderAvailable
          ? <BarChart config={{
            data: `https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Age,Gender&Geography=${meta.id}&Year=all`,
            discrete: "x",
            groupBy: "Gender",
            x: "Age",
            y: "share",
            time: "Year",
            title: d => `Population Below Poverty by Age and Gender in ${d[0].Geography}`,
            xSort: (a, b) => a["ID Age"] - b["ID Age"],
            xConfig: {
              labelRotation: false,
              tickFormat: d => rangeFormatter(d)
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
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return formatPovertyByAgeAndGender(resp.data)[0];
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
  fetchData("povertyByRace", "https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Race&Geography=<id>&Year=latest", d => d.data),
  fetchData("povertyByAgeAndGender", "https://acs.datausa.io/api/data?measures=Poverty Population&drilldowns=Poverty Status,Age,Gender&Geography=<id>&Year=latest", d => d.data),
  fetchData("immigrantsInPoverty", "/api/data?measures=Poverty by Nativity&drilldowns=Nativity,Poverty Status&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  povertyByRace: state.data.povertyByRace,
  povertyByAgeAndGender: state.data.povertyByAgeAndGender,
  immigrantsInPoverty: state.data.immigrantsInPoverty
});

export default connect(mapStateToProps)(Poverty);

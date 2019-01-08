import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {format} from "d3-format";
import {BarChart, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatRaceName = d => d.replace("Alone", "");
const formatEthnicityName = d => d.replace("Not Hispanic or Latino", "Non-Hispanic").replace("or Latino", "");

const commas = format(".2f");

class SocioeconomicOutcomes extends SectionColumns {
  render() {
    const {population, populationByAgeAndGender, populationByRaceAndEthnicity, lifeExpectancy, socialVulnerabilityIndex} = this.props;

    // Find recent year population data.
    const recentYearPopulation = {};
    nest()
      .key(d => d.Year)
      .entries(population)
      .forEach(group => {
        group.key >= population[0].Year ? Object.assign(recentYearPopulation, group) : {};
      });

    // Find share for population by Age and Gender.
    nest()
      .key(d => d.Year)
      .entries(populationByAgeAndGender)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
      });
      
    // Find share for population by Race and Ethnicity.
    nest()
      .key(d => d.Year)
      .entries(populationByRaceAndEthnicity)
      .forEach(group => {
        const total = sum(group.values, d => d["Hispanic Population"]);
        group.values.forEach(d => d.share = d["Hispanic Population"] / total * 100);
      });

    return (
      <div>
        <SectionColumns>
          <SectionTitle>Socioeconomic Outcomes</SectionTitle>
          <article>
            <Stat
              title="Life Expectancy"
              year={""}
              value={`${formatAbbreviate(lifeExpectancy[0]["Life Expectancy"])}`}
            />
          </article>
          <article>
            <Stat
              title="Overall Ranking"
              year={socialVulnerabilityIndex[0].Year}
              value={commas(socialVulnerabilityIndex[0]["Overall Ranking"])}
            />
          </article>
          <article>
            <Stat
              title="Socioeconomic Ranking"
              year={socialVulnerabilityIndex[0].Year}
              value={commas(socialVulnerabilityIndex[0]["Socioeconomic Ranking"])}
            />
          </article>
        </SectionColumns>

        <SectionColumns>
          <article>
            <Stat
              title="Household Composition and Disability Ranking"
              year={socialVulnerabilityIndex[0].Year}
              value={commas(socialVulnerabilityIndex[0]["Household Composition and Disability Ranking"])}
            />
          </article>

          <article>
            <Stat
              title="Minority Status and Language Ranking"
              year={socialVulnerabilityIndex[0].Year}
              value={commas(socialVulnerabilityIndex[0]["Minority Status and Language Ranking"])}
            />
          </article>

          <article>
            <Stat
              title="Housing and Transportation Ranking"
              year={socialVulnerabilityIndex[0].Year}
              value={commas(socialVulnerabilityIndex[0]["Housing and Transportation Ranking"])}
            />
          </article>
        </SectionColumns>

        <SectionColumns>
          <Stat
            title="Total Population"
            year={recentYearPopulation.values[0].Year}
            value={`${formatAbbreviate(recentYearPopulation.values[0].Population)}`}
          />

          {/* Barchart to show population by age and gender over the years for selected geography. */}
          <BarChart config={{
            data: populationByAgeAndGender,
            discrete: "x",
            height: 300,
            groupBy: "Sex",
            x: "Age",
            y: "share",
            time: "Year",
            xSort: (a, b) => a["ID Age"] - b["ID Age"],
            xConfig: {
              tickFormat: d => rangeFormatter(d),
              title: "Population by Age and Gender"
            },
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Share"
            },
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => rangeFormatter(d.Age)], ["Share", d => formatPercentage(d.share)]]}
          }}
          />

          <Treemap config={{
            data: populationByRaceAndEthnicity,
            height: 300,
            sum: d => d["Hispanic Population"],
            groupBy: ["Race", "Ethnicity"],
            label: d => `${formatEthnicityName(d.Ethnicity)} ${formatRaceName(d.Race)}`,
            time: "Year",
            title: "Population by Race and Ethnicity",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)]]}
          }}
          />
        </SectionColumns>
      </div>
    );
  }
}

SocioeconomicOutcomes.defaultProps = {
  slug: "socioeconomic-outcomes"
};

SocioeconomicOutcomes.need = [
  fetchData("socialVulnerabilityIndex", "/api/data?measures=Socioeconomic Ranking,Household Composition and Disability Ranking,Minority Status and Language Ranking,Housing and Transportation Ranking,Overall Ranking&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  socialVulnerabilityIndex: state.data.socialVulnerabilityIndex
});

export default connect(mapStateToProps)(SocioeconomicOutcomes);

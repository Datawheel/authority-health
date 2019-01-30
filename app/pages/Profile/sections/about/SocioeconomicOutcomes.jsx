import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {format} from "d3-format";
import {BarChart, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatRaceName = d => d.replace("Alone", "");
const formatEthnicityName = d => d.replace("Not Hispanic or Latino", "Non-Hispanic").replace("or Latino", "");

const commas = format(".2f");

class SocioeconomicOutcomes extends SectionColumns {
  render() {
    const {meta, population, populationByAgeAndGender, populationByRaceAndEthnicity, lifeExpectancy, socialVulnerabilityIndex} = this.props;

    const populationByAgeAndGenderAvailable = populationByAgeAndGender.length !== 0;
    const populationByRaceAndEthnicityAvailable = populationByRaceAndEthnicity.length !== 0;
    const lifeExpectancyAvailable = lifeExpectancy.length !== 0;
    const socialVulnerabilityIndexAvailable = socialVulnerabilityIndex.length !== 0;

    const onCityOrZipLevel = meta.level === "place" || meta.level === "zip";

    // Find recent year population data.
    const recentYearPopulation = {};
    nest()
      .key(d => d.Year)
      .entries(population)
      .forEach(group => {
        group.key >= population[0].Year ? Object.assign(recentYearPopulation, group) : {};
      });

    // Find share for population by Age and Gender.
    if (populationByAgeAndGenderAvailable) {
      nest()
        .key(d => d.Year)
        .entries(populationByAgeAndGender)
        .forEach(group => {
          const total = sum(group.values, d => d["Population by Sex and Age"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Population by Sex and Age"] / total * 100 : d.share = 0);
        });
    }
      
    // Find share for population by Race and Ethnicity.
    if (populationByRaceAndEthnicityAvailable) {
      nest()
        .key(d => d.Year)
        .entries(populationByRaceAndEthnicity)
        .forEach(group => {
          const total = sum(group.values, d => d["Hispanic Population"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Hispanic Population"] / total * 100 : d.share = 0);
        });
    }

    return (
      <div>
        <SectionColumns>
          <SectionTitle>Socioeconomic Outcomes</SectionTitle>
          <article>
            <Stat
              title="Life Expectancy"
              year={""}
              value={lifeExpectancyAvailable ? `${formatAbbreviate(lifeExpectancy[0]["Life Expectancy"])}` : "N/A"}
              qualifier={lifeExpectancyAvailable ? onCityOrZipLevel ? lifeExpectancy[0].Geography : "" : ""}
            />
          </article>
          <article>
            <Stat
              title="Overall Ranking"
              year={socialVulnerabilityIndexAvailable ? socialVulnerabilityIndex[0].Year : ""}
              value={socialVulnerabilityIndexAvailable ? commas(socialVulnerabilityIndex[0]["Overall Ranking"]) : "N/A"}
              qualifier={socialVulnerabilityIndexAvailable ? onCityOrZipLevel ? socialVulnerabilityIndex[0].Geography : "" : ""}
            />
          </article>
          <article>
            <Stat
              title="Socioeconomic Ranking"
              year={socialVulnerabilityIndexAvailable ? socialVulnerabilityIndex[0].Year : ""}
              value={socialVulnerabilityIndexAvailable ? commas(socialVulnerabilityIndex[0]["Socioeconomic Ranking"]) : "N/A"}
              qualifier={socialVulnerabilityIndexAvailable ? onCityOrZipLevel ? socialVulnerabilityIndex[0].Geography : "" : ""}
            />
          </article>
        </SectionColumns>

        <SectionColumns>
          <article>
            <Stat
              title="Household Composition and Disability Ranking"
              year={socialVulnerabilityIndexAvailable ? socialVulnerabilityIndex[0].Year : ""}
              value={socialVulnerabilityIndexAvailable ? commas(socialVulnerabilityIndex[0]["Household Composition and Disability Ranking"]) : "N/A"}
              qualifier={socialVulnerabilityIndexAvailable ? onCityOrZipLevel ? socialVulnerabilityIndex[0].Geography : "" : ""}
            />
          </article>

          <article>
            <Stat
              title="Minority Status and Language Ranking"
              year={socialVulnerabilityIndexAvailable ? socialVulnerabilityIndex[0].Year : ""}
              value={socialVulnerabilityIndexAvailable ? commas(socialVulnerabilityIndex[0]["Minority Status and Language Ranking"]) : "N/A"}
              qualifier={socialVulnerabilityIndexAvailable ? onCityOrZipLevel ? socialVulnerabilityIndex[0].Geography : "" : ""}
            />
          </article>

          <article>
            <Stat
              title="Housing and Transportation Ranking"
              year={socialVulnerabilityIndexAvailable ? socialVulnerabilityIndex[0].Year : ""}
              value={socialVulnerabilityIndexAvailable ? commas(socialVulnerabilityIndex[0]["Housing and Transportation Ranking"]) : "N/A"}
              qualifier={socialVulnerabilityIndexAvailable ? onCityOrZipLevel ? socialVulnerabilityIndex[0].Geography : "" : ""}
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
          {populationByAgeAndGenderAvailable
            ? <BarChart config={{
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
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => rangeFormatter(d.Age)], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            /> : <div></div>}

          {populationByRaceAndEthnicityAvailable
            ? <Treemap config={{
              data: populationByRaceAndEthnicity,
              height: 300,
              sum: d => d["Hispanic Population"],
              groupBy: ["Race", "Ethnicity"],
              label: d => `${formatEthnicityName(d.Ethnicity)} ${formatRaceName(d.Race)}`,
              time: "Year",
              title: "Population by Race and Ethnicity",
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            /> : <div></div>}
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
  meta: state.data.meta,
  population: state.data.population.data, 
  populationByAgeAndGender: state.data.populationByAgeAndGender,
  populationByRaceAndEthnicity: state.data.populationByRaceAndEthnicity.data,
  lifeExpectancy: state.data.lifeExpectancy,
  socialVulnerabilityIndex: state.data.socialVulnerabilityIndex
});

export default connect(mapStateToProps)(SocioeconomicOutcomes);

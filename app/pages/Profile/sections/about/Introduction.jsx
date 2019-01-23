import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {sum} from "d3-array";
import {SectionColumns, SectionTitle} from "@datawheel/canon-core";
import {formatAbbreviate} from "d3plus-format";
import growthCalculator from "../../../../utils/growthCalculator";

const formatRaceName = d => d.replace("Alone", "");
const formatEthnicityName = d => d.replace("Not Hispanic or Latino", "Non-Hispanic").replace("or Latino", "");

class Introduction extends SectionColumns {

  render() {
    const {meta, population, populationByAgeAndGender, populationByRaceAndEthnicity, lifeExpectancy} = this.props;

    const onCityOrZipLevel = meta.level === "place" || meta.level === "zip";

    const populationGrowth = formatAbbreviate(growthCalculator(population[0].Population, population[1].Population));

    // Get recent year male and female population data by their age.
    const recentYearPopulationByAgeAndGender = {};
    nest()
      .key(d => d.Year)
      .entries(populationByAgeAndGender)
      .forEach(group => {
        group.key >= populationByAgeAndGender[0].Year ? Object.assign(recentYearPopulationByAgeAndGender, group) : {};
      });
    const getMaleData = recentYearPopulationByAgeAndGender.values.filter(d => d.Sex === "Male");
    const getTopMaleData = getMaleData.sort((a, b) => b["Population by Sex and Age"] - a["Population by Sex and Age"])[0];
    const getFemaleData = populationByAgeAndGender.filter(d => d.Sex === "Female");
    const getTopFemaleData = getFemaleData.sort((a, b) => b["Population by Sex and Age"] - a["Population by Sex and Age"])[0];

    // Get recent year race and ethnicity population data.
    const recentYearPopulationByRaceAndEthnicity = {};
    nest()
      .key(d => d.Year)
      .entries(populationByRaceAndEthnicity)
      .forEach(group => {
        const total = sum(group.values, d => d["Hispanic Population"]);
        group.values.forEach(d => d.share = d["Hispanic Population"] / total * 100);
        group.key >= populationByRaceAndEthnicity[0].Year ? Object.assign(recentYearPopulationByRaceAndEthnicity, group) : {};
      });
    recentYearPopulationByRaceAndEthnicity.values.sort((a, b) => b.share - a.share);

    return (
      <SectionColumns>
        <SectionTitle>Introduction</SectionTitle>
        <article>
          <p>
            {population[0].Geography} has a population of {formatAbbreviate(population[0].Population)} people with life expectancy of {formatAbbreviate(lifeExpectancy[0]["Life Expectancy"])} {onCityOrZipLevel ? `(in ${lifeExpectancy[0].Geography})` : ""}. 
            The most common age group for male is {getTopMaleData.Age.toLowerCase()} and for female it is {getTopFemaleData.Age.toLowerCase()}. 
            Between 2015 and 2016 the population of {population[0].Geography} {populationGrowth < 0 ? "reduced" : "increased"} from {formatAbbreviate(population[1].Population)} to {formatAbbreviate(population[0].Population)}, 
            { } {populationGrowth < 0 ? "a decline" : "an increase"} of {populationGrowth < 0 ? populationGrowth * -1 : populationGrowth}%.
          </p>
        </article>

        <article>
          <p>
            Most of the population in {recentYearPopulationByRaceAndEthnicity.values[0].Geography} is {formatEthnicityName(recentYearPopulationByRaceAndEthnicity.values[0].Ethnicity).toLowerCase()} { }
            {formatRaceName(recentYearPopulationByRaceAndEthnicity.values[0].Race).toLowerCase()} ({formatAbbreviate(recentYearPopulationByRaceAndEthnicity.values[0].share)}%), followed by { }
            {formatEthnicityName(recentYearPopulationByRaceAndEthnicity.values[1].Ethnicity).toLowerCase()} {formatRaceName(recentYearPopulationByRaceAndEthnicity.values[1].Race).toLowerCase()} 
            ({formatAbbreviate(recentYearPopulationByRaceAndEthnicity.values[1].share)}%).
          </p>
        </article>

        {/* Add empty article tags for allignment. */}
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Introduction.defaultProps = {
  slug: "introduction"
};

const mapStateToProps = state => ({
  meta: state.data.meta,
  population: state.data.population.data, 
  populationByAgeAndGender: state.data.populationByAgeAndGender,
  populationByRaceAndEthnicity: state.data.populationByRaceAndEthnicity.data,
  lifeExpectancy: state.data.lifeExpectancy
});

export default connect(mapStateToProps)(Introduction);

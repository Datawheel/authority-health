import React from "react";
import {nest} from "d3-collection";

import {SectionColumns, SectionTitle} from "@datawheel/canon-core";
import {formatAbbreviate} from "d3plus-format";
import growthCalculator from "../../../../utils/growthCalculator";

// import Stat from "../../../../components/Stat";

class Introduction extends SectionColumns {

  render() {
    const {population, populationByAgeAndGender, lifeExpectancy} = this.props;

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
    const getTopMaleData = getMaleData.sort((a, b) => b.Population - a.Population)[0];
    const getFemaleData = populationByAgeAndGender.filter(d => d.Sex === "Female");
    const getTopFemaleData = getFemaleData.sort((a, b) => b.Population - a.Population)[0];

    return (
      <SectionColumns>
        <SectionTitle>Introduction</SectionTitle>
        <article>
          <p>
            {population[0].Geography} has a population of {formatAbbreviate(population[0].Population)} people with life expectancy of {formatAbbreviate(lifeExpectancy[0]["Life Expectancy"])}. 
            The most common age group for male is {getTopMaleData.Age.toLowerCase()} and for female it is {getTopFemaleData.Age.toLowerCase()}. 
            Between 2015 and 2016 the population of {population[0].Geography} {populationGrowth < 0 ? "reduced" : "increased"} from {formatAbbreviate(population[1].Population)} to {formatAbbreviate(population[0].Population)}, 
            a {populationGrowth < 0 ? "decline" : "increase"} of {populationGrowth < 0 ? populationGrowth * -1 : populationGrowth}%.
          </p>
        </article>

        <article>
        </article>
      </SectionColumns>
    );
  }
}

Introduction.defaultProps = {
  slug: "introduction"
};

export default Introduction;

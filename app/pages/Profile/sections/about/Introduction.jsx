import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {sum} from "d3-array";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import {formatAbbreviate} from "d3plus-format";
import growthCalculator from "utils/growthCalculator";
import Stat from "components/Stat";

const formatRaceName = d => {
  d = d.replace("Alone", "").replace("Black", "black").replace("White", "white").replace("Asian", "asian");
  if (d.trim() === "Some Other Race") return d.toLowerCase();
  if (d.trim() === "Two or More Races") return d.toLowerCase();
  return d;
};
const formatEthnicityName = d => d.replace("Not Hispanic or Latino", "non-Hispanic").replace("or Latino", "");

class Introduction extends SectionColumns {

  render() {
    const {meta, population, populationByAgeAndGender, populationByRaceAndEthnicity, lifeExpectancy, topStats, medianHouseholdIncome} = this.props;
    const {healthTopics, socialDeterminants} = topStats;
    const {level} = meta;

    const populationByAgeAndGenderAvailable = populationByAgeAndGender.length !== 0;
    const populationByRaceAndEthnicityAvailable = populationByRaceAndEthnicity.length !== 0;
    const lifeExpectancyAvailable = lifeExpectancy.length !== 0;

    const onCityOrZipLevel = level === "place" || level === "zip";

    const populationGrowth = formatAbbreviate(growthCalculator(population[0].Population, population[population.length - 1].Population));

    // Get recent year male and female population data by their age.
    const recentYearPopulationByAgeAndGender = {};
    let getFemaleData, getMaleData, getTopFemaleData, getTopMaleData;
    if (populationByAgeAndGenderAvailable) {
      nest()
        .key(d => d.Year)
        .entries(populationByAgeAndGender)
        .forEach(group => {
          group.key >= populationByAgeAndGender[0].Year ? Object.assign(recentYearPopulationByAgeAndGender, group) : {};
        });
      getMaleData = recentYearPopulationByAgeAndGender.values.filter(d => d.Sex === "Male");
      getTopMaleData = getMaleData.sort((a, b) => b["Population by Sex and Age"] - a["Population by Sex and Age"])[0];
      getFemaleData = populationByAgeAndGender.filter(d => d.Sex === "Female");
      getTopFemaleData = getFemaleData.sort((a, b) => b["Population by Sex and Age"] - a["Population by Sex and Age"])[0];
    }

    // Get recent year race and ethnicity population data.
    const recentYearPopulationByRaceAndEthnicity = {};
    if (populationByRaceAndEthnicityAvailable) {
      nest()
        .key(d => d.Year)
        .entries(populationByRaceAndEthnicity)
        .forEach(group => {
          const total = sum(group.values, d => d["Hispanic Population"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Hispanic Population"] / total * 100 : d.share = 0);
          group.key >= populationByRaceAndEthnicity[0].Year ? Object.assign(recentYearPopulationByRaceAndEthnicity, group) : {};
        });
      recentYearPopulationByRaceAndEthnicity.values.sort((a, b) => b.share - a.share);
    }

    return (
      <SectionColumns>
        <SectionTitle>Introduction</SectionTitle>
        <article>
          <p>
            {level === "zip" ? `Zip code ${population[0].Geography}` : population[0].Geography} has a population of {formatAbbreviate(population[0].Population)} people with life expectancy of {lifeExpectancyAvailable ? formatAbbreviate(lifeExpectancy[0]["Life Expectancy"]) : "N/A"} {lifeExpectancyAvailable ? onCityOrZipLevel ? <span>(in {lifeExpectancy[0].Geography})</span> : "" : ""}.
            The most common age group for male is {populationByAgeAndGenderAvailable ? getTopMaleData.Age.toLowerCase() : "N/A"} and for female it is {populationByAgeAndGenderAvailable ? getTopFemaleData.Age.toLowerCase() : "N/A"}.
            Between {population[population.length - 1].Year} and {population[0].Year} the population of {population[0].Geography} {populationGrowth < 0 ? "reduced" : "increased"} from {formatAbbreviate(population[population.length - 1].Population)} to {formatAbbreviate(population[0].Population)},
            {} {populationGrowth < 0 ? "a decline" : "an increase"} of {populationGrowth < 0 ? `${populationGrowth * -1}%` : isNaN(populationGrowth) ? "N/A" : `${populationGrowth}%`}.
          </p>
          {populationByRaceAndEthnicityAvailable
            ? <p>
              Most of the population in {recentYearPopulationByRaceAndEthnicity.values[0].Geography} is {formatEthnicityName(recentYearPopulationByRaceAndEthnicity.values[0].Ethnicity)} {}
              {formatRaceName(recentYearPopulationByRaceAndEthnicity.values[0].Race)} ({formatAbbreviate(recentYearPopulationByRaceAndEthnicity.values[0].share)}%), followed by {}
              {formatEthnicityName(recentYearPopulationByRaceAndEthnicity.values[1].Ethnicity)} {formatRaceName(recentYearPopulationByRaceAndEthnicity.values[1].Race)}
              ({formatAbbreviate(recentYearPopulationByRaceAndEthnicity.values[1].share)}%).
            </p>
            : null}
          {/* TODO: Add comparison for median household income as described in feedback. */}
          {/* <p>In {medianHouseholdIncome[0].Geography}, the median household income is {formatAbbreviate(medianHouseholdIncome[0]["Household Income"])}.</p> */}
          <p>
            Social and economic factors, such as income, education, and access to health care, impact health outcomes for all Americans. For example, in many low income areas in the country, there are higher rates of chronic diseases, like high blood pressure and diabetes. The summary to the right highlights some of the social and health conditions for {population[0].Geography}.
          </p>
        </article>
        <div className="top-stats viz">
          {socialDeterminants.map(item =>
            <Stat key={item.measure}
              title={item.measure}
              year={item.latestYear}
              value={item.value}
            />
          )}
        </div>
        <div className="top-stats viz">
          {healthTopics.map(item =>
            <Stat key={item.measure}
              title={item.measure}
              year={item.latestYear}
              value={item.value}
            />
          )}
        </div>
      </SectionColumns>
    );
  }
}

Introduction.defaultProps = {
  slug: "introduction"
};

Introduction.need = [
  fetchData("topStats", "/api/stats/<id>"),
  fetchData("medianHouseholdIncome", "https://acs.datausa.io/api/data?measures=Household Income&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  population: state.data.population.data,
  populationByAgeAndGender: state.data.populationByAgeAndGender,
  populationByRaceAndEthnicity: state.data.populationByRaceAndEthnicity.data,
  lifeExpectancy: state.data.lifeExpectancy,
  topStats: state.data.topStats,
  medianHouseholdIncome: state.data.medianHouseholdIncome
});

export default connect(mapStateToProps)(Introduction);

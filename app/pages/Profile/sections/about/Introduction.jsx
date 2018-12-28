import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {format} from "d3-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import {formatAbbreviate} from "d3plus-format";
import growthCalculator from "../../../../utils/growthCalculator";

const commas = format(",d");

// import Stat from "../../../../components/Stat";

class Introduction extends SectionColumns {

  render() {
    const {population, populationByAgeAndGender, unemploymentRate, lifeExpectancy, employmentStatus, workExperience, socioeconomicRanking, percentChangeInEmploymemt} = this.props;

    const populationGrowth = formatAbbreviate(growthCalculator(population.data[0].Population, population.data[1].Population));

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

    // Get recent year part time and full time data
    const recentYearWorkExperienceData = {};
    nest()
      .key(d => d.Year)
      .entries(workExperience)
      .forEach(group => {
        group.key >= populationByAgeAndGender[0].Year ? Object.assign(recentYearWorkExperienceData, group) : {};
      });
    const getTopFullTimeAndPartTimeData = recentYearWorkExperienceData.values.filter(d => d["Work Experience"] !== "Did Not Work");

    return (
      <SectionColumns>
        <SectionTitle>Introduction</SectionTitle>
        <article>
          <p>
            {population.data[0].Geography} has a population of {formatAbbreviate(population.data[0].Population)} people with life expectancy of {formatAbbreviate(lifeExpectancy[0]["Life Expectancy"])}. 
            The most common age group for male is {getTopMaleData.Age.toLowerCase()} and for female it is {getTopFemaleData.Age.toLowerCase()}. 
            Between 2015 and 2016 the population of {population.data[0].Geography} {populationGrowth < 0 ? "reduced" : "increased"} from {formatAbbreviate(population.data[1].Population)} to {formatAbbreviate(population.data[0].Population)}, 
            a {populationGrowth < 0 ? "decline" : "increase"} of {populationGrowth < 0 ? populationGrowth * -1 : populationGrowth}%.
          </p>
        </article>

        <article>
          <p>
            Most population in {getTopFullTimeAndPartTimeData[0].Geography} {getTopFullTimeAndPartTimeData[0]["Work Experience"].toLowerCase()}. {percentChangeInEmploymemt.length !== 0 ? `Percent change in employment was ${commas(percentChangeInEmploymemt[0]["Percent Change in Employment"])}%.` : ""} 
            The unemployment rate in {unemploymentRate[0].Year} was {unemploymentRate[0]["Unemployment Rate"]}%,
            while the socioeconomic ranking in {socioeconomicRanking[0].Year} was {commas(socioeconomicRanking[0]["Socioeconomic Ranking"])}.
          </p>
        </article>

        {/* <article>
          <p>
            The median property value in Wayne County is $xx, and the homeownership rate is xx%.
            Most people in Wayne County commute by xx, and the average commute time is xx minutes. 
            The average car ownership in Wayne County is 2 cars per household.
          </p>
        </article> */}
      </SectionColumns>
    );
  }
}

Introduction.defaultProps = {
  slug: "introduction"
};

Introduction.need = [
  fetchData("population", "https://niagara.datausa.io/api/data?measures=Population&Geography=<id>&year=all"),
  fetchData("populationByAgeAndGender", "/api/data?measures=Population&drilldowns=Age,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("unemploymentRate", "/api/data?measures=Unemployment Rate&Geography=<id>&Year=all", d => d.data),
  fetchData("lifeExpectancy", "/api/data?measures=Life Expectancy&Geography=<id>", d => d.data), // Year data not available
  fetchData("employmentStatus", "/api/data?measures=Population&drilldowns=Employment Status,Age,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("workExperience", "/api/data?measures=Population&drilldowns=Work Experience&Geography=<id>&Year=all", d => d.data),
  fetchData("socioeconomicRanking", "/api/data?measures=Socioeconomic Ranking&Geography=<id>&Year=latest", d => d.data),
  fetchData("percentChangeInEmploymemt", "/api/data?measures=Percent Change in Employment&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  population: state.data.population,
  populationByAgeAndGender: state.data.populationByAgeAndGender,
  unemploymentRate: state.data.unemploymentRate,
  lifeExpectancy: state.data.lifeExpectancy,
  employmentStatus: state.data.employmentStatus,
  workExperience: state.data.workExperience,
  socioeconomicRanking: state.data.socioeconomicRanking,
  percentChangeInEmploymemt: state.data.percentChangeInEmploymemt
});

export default connect(mapStateToProps)(Introduction);

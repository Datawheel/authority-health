import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {format} from "d3-format";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatWorkHours = d => {
  if (d === "Worked Full Time, Year-round") return "Full Time";
  if (d === "Worked Part-time Or Part-year") return "Part Time";
  return d;
};

const commas = format(",d");

class Demographics extends SectionColumns {

  render() {
    const {population, populationByAgeAndGender, unemploymentRate, lifeExpectancy, employmentStatus, workExperience, socioeconomicRanking, percentChangeInEmploymemt} = this.props;

    // Find share for population by Age and Gender.
    nest()
      .key(d => d.Year)
      .entries(populationByAgeAndGender)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
      });

    // Find share for work experience.
    nest()
      .key(d => d.Year)
      .entries(workExperience)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
      });
    const filteredWorkExperienceData = workExperience.filter(d => d["Work Experience"] !== "Did Not Work");

    // Find share for employmentStatus.
    nest()
      .key(d => d.Year)
      .entries(employmentStatus)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
      });

    return (
      <div>
        <SectionColumns>
          <SectionTitle>Demographics</SectionTitle>

          <Stat
            title="Life Expectancy"
            year={""}
            value={`${formatAbbreviate(lifeExpectancy[0]["Life Expectancy"])} Years`}
          />

          <Stat
            title="Socioeconomic Ranking"
            year={socioeconomicRanking[0].Year}
            value={commas(socioeconomicRanking[0]["Socioeconomic Ranking"])}
          />

          {percentChangeInEmploymemt.length !== 0
            ? <Stat
              title="Percent Change in Employment"
              year={percentChangeInEmploymemt[0].Year}
              value={formatPercentage(percentChangeInEmploymemt[0]["Percent Change in Employment"] * 100)}
            />
            : <div></div>}
        </SectionColumns>

        <SectionColumns>
          {/* Lineplot to show total population over the years for selected geography. */}
          <LinePlot config={{
            data: population.data,
            discrete: "x",
            height: 300,
            title: "Population Over Years",
            legend: false,
            groupBy: "Geography",
            x: "Year",
            y: "Population",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Population", d => formatAbbreviate(d.Population)]]}
          }}
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

        </SectionColumns>

        <SectionColumns>
          {/* Barchart to show work experience by gender over the years for selected geography. */}
          <BarChart config={{
            data: filteredWorkExperienceData,
            discrete: "y",
            height: 300,
            groupBy: ["Work Experience", "Sex"],
            stacked: true,
            x: "share",
            y: "Work Experience",
            time: "Year",
            title: "Work Experience by Gender",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              labelRotation: false,
              title: "Share"
            },
            yConfig: {
              labelRotation: false,
              tickFormat: d => formatWorkHours(d)
            },
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Work Hours", d => formatWorkHours(d["Work Experience"])], ["Share", d => formatPercentage(d.share)]]}
          }}
          />
          
          {/* Barchart to show population by age and gender over the years for selected geography. */}
          <BarChart config={{
            data: employmentStatus,
            discrete: "x",
            height: 300,
            groupBy: ["Sex", "Employment Status"],
            x: "Age",
            stacked: true,
            y: "share",
            time: "Year",
            xSort: (a, b) => a["ID Age"] - b["ID Age"],
            xConfig: {
              tickFormat: d => rangeFormatter(d),
              title: "Employment Status by Age and Gender"
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

          {/* Lineplot to show total population over the years for selected geography. */}
          <LinePlot config={{
            data: unemploymentRate,
            discrete: "x",
            height: 300,
            title: "Unemplyment Rate Over Years",
            legend: false,
            groupBy: "Geography",
            x: "Year",
            y: "Unemployment Rate",
            yConfig: {tickFormat: d => formatPercentage(d)},
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d["Unemployment Rate"])]]}
          }}
          />
        </SectionColumns>
      </div>
    );
  }
}

Demographics.defaultProps = {
  slug: "demographics"
};

Demographics.need = [
  fetchData("population", "https://niagara.datausa.io/api/data?measures=Population&Geography=<id>&year=all"),
  fetchData("populationByAgeAndGender", "/api/data?measures=Population&drilldowns=Age,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("unemploymentRate", "/api/data?measures=Unemployment Rate&Geography=<id>&Year=all", d => d.data),
  fetchData("lifeExpectancy", "/api/data?measures=Life Expectancy&Geography=<id>", d => d.data), // Year data not available
  fetchData("employmentStatus", "/api/data?measures=Population&drilldowns=Employment Status,Age,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("workExperience", "/api/data?measures=Population&drilldowns=Work Experience,Sex&Geography=<id>&Year=all", d => d.data),
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

export default connect(mapStateToProps)(Demographics);

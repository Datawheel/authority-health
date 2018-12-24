import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Demographics extends SectionColumns {

  render() {
    const {population, populationByAgeAndGender, unemploymentRate, lifeExpectancy} = this.props;
    console.log("lifeExpectancy: ", lifeExpectancy);

    // Find share for population by Age and Gender.
    nest()
      .key(d => d.Year)
      .entries(populationByAgeAndGender)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
      });

    return (
      <SectionColumns>
        <SectionTitle>Demographics</SectionTitle>
        <article>
          <Stat
            title="Life Expectancy"
            year={""}
            value={`${formatAbbreviate(lifeExpectancy[0]["Life Expectancy"])} Years`}
          />
          
          {/* Lineplot to show total population over the years for selected geography. */}
          <LinePlot config={{
            data: population.data,
            discrete: "x",
            height: 200,
            title: "Population Over Years",
            legend: false,
            groupBy: "Geography",
            x: "Year",
            y: "Population",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Population", d => formatAbbreviate(d.Population)]]}
          }}
          />

          {/* Lineplot to show total population over the years for selected geography. */}
          <LinePlot config={{
            data: unemploymentRate,
            discrete: "x",
            height: 200,
            title: "Unemplyment Rate Over Years",
            legend: false,
            groupBy: "Geography",
            x: "Year",
            y: "Unemployment Rate",
            yConfig: {tickFormat: d => formatPercentage(d)},
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d["Unemployment Rate"])]]}
          }}
          />
        </article>

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
            labelRotation: false,
            tickFormat: d => rangeFormatter(d)
          },
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Population by Age and Gender"
          },
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => d.Age], ["Share", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
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
  fetchData("lifeExpectancy", "/api/data?measures=Life Expectancy&Geography=<id>", d => d.data) // Year data not available
];

const mapStateToProps = state => ({
  population: state.data.population,
  populationByAgeAndGender: state.data.populationByAgeAndGender,
  unemploymentRate: state.data.unemploymentRate,
  lifeExpectancy: state.data.lifeExpectancy
});

export default connect(mapStateToProps)(Demographics);

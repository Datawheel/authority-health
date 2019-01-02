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

const commas = format(",d");

class Demographics extends SectionColumns {

  render() {
    const {population, populationByAgeAndGender, lifeExpectancy, socioeconomicRanking, percentChangeInEmploymemt} = this.props;

    // Find share for population by Age and Gender.
    nest()
      .key(d => d.Year)
      .entries(populationByAgeAndGender)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
      });

    return (
      <div>
        <SectionColumns>
          <SectionTitle>Demographics</SectionTitle>
          <article>
            <Stat
              title="Life Expectancy"
              year={""}
              value={`${formatAbbreviate(lifeExpectancy[0]["Life Expectancy"])}`}
            />
          </article>

          <article>
            <Stat
              title="Socioeconomic Ranking"
              year={socioeconomicRanking[0].Year}
              value={commas(socioeconomicRanking[0]["Socioeconomic Ranking"])}
            />
          </article>

          {percentChangeInEmploymemt.length !== 0
            ? <article>
              <Stat
                title="Percent Change in Employment"
                year={percentChangeInEmploymemt[0].Year}
                value={formatPercentage(percentChangeInEmploymemt[0]["Percent Change in Employment"] * 100)}
              />
            </article>
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
  fetchData("lifeExpectancy", "/api/data?measures=Life Expectancy&Geography=<id>", d => d.data), // Year data not available
  fetchData("socioeconomicRanking", "/api/data?measures=Socioeconomic Ranking&Geography=<id>&Year=latest", d => d.data),
  fetchData("percentChangeInEmploymemt", "/api/data?measures=Percent Change in Employment&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  population: state.data.population,
  populationByAgeAndGender: state.data.populationByAgeAndGender,
  lifeExpectancy: state.data.lifeExpectancy,
  socioeconomicRanking: state.data.socioeconomicRanking,
  percentChangeInEmploymemt: state.data.percentChangeInEmploymemt
});

export default connect(mapStateToProps)(Demographics);

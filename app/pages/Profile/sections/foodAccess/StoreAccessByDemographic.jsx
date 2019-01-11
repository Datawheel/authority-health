import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

// const formatName = name => name.split(",")[0];
const formatPercentage = d => `${formatAbbreviate(d)}%`;

class StoreAccessByDemographic extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Children"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {foodAccessByAge, foodAccessByRace} = this.props;
    const {dropdownValue} = this.state;
    const isFoodAccessByAgeAvailableForCurrentGeography = foodAccessByAge.source[0].substitutions.length === 0;
    const isFoodAccessByRaceAvailableForCurrentGeography = foodAccessByRace.source[0].substitutions.length === 0;

    const raceAndAgeTypes = ["Children", "Seniors", "American Indian or Alaska Native", "Asian", "Black", "Hawaiian or Pacific Islander", "Hispanic ethnicity", "Multiracial", "White"];
    const ageSelected = dropdownValue === "Children" || dropdownValue === "Seniors";

    // Get recent year data for food access by Age.
    const recentYearFoodAccessByAge = {};
    nest()
      .key(d => d.Year)
      .entries(foodAccessByAge.data)
      .forEach(group => {
        group.key >= foodAccessByAge.data[0].Year ? Object.assign(recentYearFoodAccessByAge, group) : {};
      });
    recentYearFoodAccessByAge.values.sort((a, b) => b.Percent - a.Percent);
    const topFoodAccessByAge = recentYearFoodAccessByAge.values[0];

    // Get recent year data for food access by Race.
    const recentYearFoodAccessByRace = {};
    nest()
      .key(d => d.Year)
      .entries(foodAccessByRace.data)
      .forEach(group => {
        group.key >= foodAccessByRace.data[0].Year ? Object.assign(recentYearFoodAccessByRace, group) : {};
      });
    recentYearFoodAccessByRace.values.sort((a, b) => b.Percent - a.Percent);
    const topFoodAccessByRace = recentYearFoodAccessByRace.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Store Access by Demographic</SectionTitle>
        <article>
          {isFoodAccessByAgeAvailableForCurrentGeography && isFoodAccessByRaceAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">Showing data for {foodAccessByRace.data[0].Geography}.</div>}
          {/* Create a dropdown for each age and race type using raceAndAgeTypes array. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {raceAndAgeTypes.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          {/* Show top stats for Age and Race groups based on the drilldown value. */}
          { ageSelected
            ? <Stat
              title={"Most at risk demographic"}
              year={topFoodAccessByAge.Year}
              value={topFoodAccessByAge["Age Group"]}
              qualifier={`${formatPercentage(topFoodAccessByAge.Percent)} Low Access`}
            />
            : <Stat
              title={"Top Food Access by Race"}
              year={topFoodAccessByRace.Year}
              value={topFoodAccessByRace["Race Group"]}
              qualifier={`${formatPercentage(topFoodAccessByRace.Percent)} Low Access`}
            />
          }
          {/* Write a paragraph for top stats based on the dropdown choice. */}
          {ageSelected
            ? <p> In {topFoodAccessByAge.Geography}, {topFoodAccessByAge["Age Group"]} are the largest age group with low access to food stores ({formatPercentage(topFoodAccessByAge.Percent)} in {topFoodAccessByAge.Year}).</p>
            : <p> In {topFoodAccessByRace.Geography}, {topFoodAccessByRace["Race Group"]} are the largest race group with low access to food stores ({formatPercentage(topFoodAccessByRace.Percent)} in {topFoodAccessByRace.Year}).</p>
          }

          <p>The following map shows the low access rate for {dropdownValue.toLowerCase()} with low access to food stores across all counties in Michigan.</p>

          {/* Create a BarChart based on the dropdown choice. */}
          <BarChart config={{
            data: ageSelected ? foodAccessByAge.data : foodAccessByRace.data,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: ageSelected ? "Age Group" : "Race Group",
            x: "Percent",
            y: ageSelected ? "Age Group" : "Race Group",
            xConfig: {
              title: "Low Access To Food Stores",
              tickFormat: d => formatPercentage(d)
            },
            yConfig: {ticks: []},
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Demographic", d => ageSelected ? `${d["Age Group"]}` : `${d["Race Group"]}`], ["Low-Access Rate", d => formatPercentage(d.Percent)], ["Location", d => d.Geography]]}
          }}
          />
        </article>

        {/* Create a Geomap based on dropdown choice for all the counties in Michigan. */}
        <Geomap config={{
          data: ageSelected ? `/api/data?measures=Percent&drilldowns=Age Group,County&Age Group=${dropdownValue}&Year=all` : `/api/data?measures=Percent&drilldowns=Race Group,County&Race Group=${dropdownValue}&Year=all`,
          groupBy: "ID County",
          colorScale: "Percent",
          colorScaleConfig: {
            axisConfig: {tickFormat: d => formatPercentage(d)}
          },
          label: d => d.County,
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Demographic", dropdownValue], ["Low-Access Rate", d => formatPercentage(d.Percent)]]},
          topojson: "/topojson/county.json",
          topojsonFilter: d => d.id.startsWith("05000US26")
        }}
        dataFormat={resp => resp.data}
        />
      </SectionColumns>
    );
  }
}

StoreAccessByDemographic.defaultProps = {
  slug: "store-access-by-demographic"
};

StoreAccessByDemographic.need = [
  fetchData("foodAccessByAge", "/api/data?measures=Percent&drilldowns=Age Group&Geography=<id>&Year=all"),
  fetchData("foodAccessByRace", "/api/data?measures=Percent&drilldowns=Race Group&Geography=<id>&Year=all")
];

const mapStateToProps = state => ({
  foodAccessByAge: state.data.foodAccessByAge,
  foodAccessByRace: state.data.foodAccessByRace
});

export default connect(mapStateToProps)(StoreAccessByDemographic);

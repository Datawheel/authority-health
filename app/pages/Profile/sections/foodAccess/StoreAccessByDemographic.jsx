import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

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

    const raceAndAgeTypes = ["Children", "Seniors", "American Indian or Alaska Native", "Asian", "Black", "Hawaiian or Pacific Islander", "Hispanic ethnicity", "Multiracial", "White"];
    const ageSelected = dropdownValue === "Children" || dropdownValue === "Seniors";

    // Get recent year data for food access by Age.
    const recentYearFoodAccessByAge = {};
    nest()
      .key(d => d.Year)
      .entries(foodAccessByAge)
      .forEach(group => {
        group.key >= foodAccessByAge[0].Year ? Object.assign(recentYearFoodAccessByAge, group) : {};
      });
    recentYearFoodAccessByAge.values.sort((a, b) => b.Percent - a.Percent);
    const topFoodAccessByAge = recentYearFoodAccessByAge.values[0];

    // Get recent year data for food access by Race.
    const recentYearFoodAccessByRace = {};
    nest()
      .key(d => d.Year)
      .entries(foodAccessByRace)
      .forEach(group => {
        group.key >= foodAccessByRace[0].Year ? Object.assign(recentYearFoodAccessByRace, group) : {};
      });
    recentYearFoodAccessByRace.values.sort((a, b) => b.Percent - a.Percent);
    const topFoodAccessByRace = recentYearFoodAccessByRace.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Store Access by Demographic</SectionTitle>
        <article>
          {/* Create a dropdown for each age and race type using raceAndAgeTypes array. */}
          <select onChange={this.handleChange}>
            {raceAndAgeTypes.map((item, i) => <option key={i} value={item}>{item}</option>)}
          </select>
          {/* Show top stats for Age and Race groups based on the drilldown value. */}
          { ageSelected
            ? <Stat
              title={`Top Food Access by Age in ${topFoodAccessByAge.Year}`}
              value={`${topFoodAccessByAge["Age Group"]} ${formatPercentage(topFoodAccessByAge.Percent)}`}
            />
            : <Stat
              title={`Top Food Access by Race in ${topFoodAccessByRace.Year}`}
              value={`${topFoodAccessByRace["Race Group"]} ${formatPercentage(topFoodAccessByRace.Percent)}`}
            />
          }
          {/* Write a paragraph for top stats based on the dropdown choice. */}
          {ageSelected
            ? <p> In {topFoodAccessByAge.County} County, {topFoodAccessByAge["Age Group"]} were the largest age group with {formatPercentage(topFoodAccessByAge.Percent)} in the year {topFoodAccessByAge.Year}.</p>
            : <p> In {topFoodAccessByRace.County} County, {topFoodAccessByRace["Race Group"]} were the largest race group with {formatPercentage(topFoodAccessByRace.Percent)} in the year {topFoodAccessByRace.Year}.</p>
          }

          <p>The Geomap here shows the percentage of {dropdownValue} who have access to food stores.</p>

          {/* Create a BarChart based on the dropdown choice. */}
          <BarChart config={{
            data: ageSelected ? foodAccessByAge : foodAccessByRace,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: ageSelected ? "Age Group" : "Race Group",
            x: "Percent",
            y: ageSelected ? "Age Group" : "Race Group",
            yConfig: {ticks: []},
            time: "Year",
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.Percent)]]}
          }}
          />
        </article>

        {/* Create a Geomap based on dropdown choice for all the counties in Michigan state. */}
        <Geomap config={{
          data: ageSelected ? `/api/data?measures=Percent&drilldowns=Age%20Group,County&Age%20Group=${dropdownValue}&Year=all` : `/api/data?measures=Percent&drilldowns=Race%20Group,County&Race%20Group=${dropdownValue}&Year=all`,
          groupBy: "ID County",
          colorScale: "Percent",
          label: d => d.County,
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [[`${dropdownValue}`, d => formatPercentage(d.Percent)]]},
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
  fetchData("foodAccessByAge", "/api/data?measures=Percent&drilldowns=Age%20Group&County=<id>&Year=all", d => d.data),
  fetchData("foodAccessByRace", "/api/data?measures=Percent&drilldowns=Race%20Group&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  foodAccessByAge: state.data.foodAccessByAge,
  foodAccessByRace: state.data.foodAccessByRace
});
  
export default connect(mapStateToProps)(StoreAccessByDemographic);

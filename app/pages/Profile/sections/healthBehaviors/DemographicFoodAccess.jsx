import React from "react";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

// const formatName = name => name.split(",")[0];
const formatPercentage = d => `${formatAbbreviate(d)}%`;

class DemographicFoodAccess extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Child"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {foodAccessByAge, foodAccessByRace} = this.props;
    const {dropdownValue} = this.state;

    // console.log("foodAccessByAge: ", foodAccessByAge);
    // console.log("foodAccessByRace: ", foodAccessByRace);

    // Create an array of each age and race type.
    // Make sure that the Children and Seniors data are always at the first 2 places in the array.
    // const ageTypes = [], raceTypes = [];
    // foodAccessByTypes.source[0].measures.forEach(d => d.toLowerCase().includes("children") || d.toLowerCase().includes("seniors") ? ageTypes.push(d) : raceTypes.push(d));
    // const raceAndAgeTypes = ageTypes.slice(0);
    // raceTypes.forEach(d => raceAndAgeTypes.push(d));

    const raceAndAgeTypes = ["Child", "Seniors", "American Indian or Alaska Native", "Asian", "Black", "Hawaiian or Pacific Islander", "Hispanic ethnicity", "Multiracial", "White"];
    const ageSelected = dropdownValue === "Child" || dropdownValue === "Seniors";

    // Create individual data object for each age and race type.
    // Add AgeRaceType key in each object.
    // const data = raceAndAgeTypes.map(d => {
    //   const result = foodAccessByTypes.data.reduce((acc, currentValue) => {
    //     if (acc === null && currentValue[d] !== null) {
    //       return Object.assign({}, currentValue, {AgeRaceType: d});
    //     }
    //     return acc;
    //   }, null);
    //   return result;
    // });

    // const currentRaceAndAgeData = data.find(d => d.AgeRaceType === dropdownValue);

    // Separate data for age and race.
    // const ageData = [], raceData = [];
    // data.forEach(d => d.AgeRaceType === raceAndAgeTypes[0] || d.AgeRaceType === raceAndAgeTypes[1] ? ageData.push(d) : raceData.push(d));

    // Sort age and race data to get the object with largest age/race value.
    // raceData.sort((a, b) =>  b[b.AgeRaceType] - a[a.AgeRaceType]);
    // ageData.sort((a, b) =>  b[b.AgeRaceType] - a[a.AgeRaceType]);

    return (
      <SectionColumns>
        <SectionTitle>Access to food by demographic</SectionTitle>
        <article>
          {/* Create a dropdown for each age and race type using raceAndAgeTypes array. */}
          <div className="field-container">
            <label>
              Demographic
              <select onChange={this.handleChange}>
                <option value="Child">age</option>
                <option value="Asian">ethnicity</option>
                {/* {raceAndAgeTypes.map((item, i) => <option key={i} value={item}>{item}</option>)} */}
              </select>
            </label>
          </div>
          {/* <Stat
            title={`Food Access in ${currentRaceAndAgeData.County} County`}
            value={`${formatAbbreviate(currentRaceAndAgeData[dropdownValue])}%`}
          /> */}

          {/* Create a paragraph based on the dropdown choice. */}
          {/* {ageSelected
            ? <p> In {ageData[0].County} County {formatName(ageData[0].AgeRaceType)} were the largest age group with {formatAbbreviate(ageData[0][ageData[0].AgeRaceType])}% in the year {ageData[0]["ID Year"]}</p>
            : <p> In {raceData[0].County} County {formatName(raceData[0].AgeRaceType)} were the largest race group with {formatAbbreviate(raceData[0][raceData[0].AgeRaceType])}% in the year {raceData[0]["ID Year"]}</p>
          } */}

          {/* Create a BarChart based on the dropdown choice. */}
          <BarChart config={{
            data: ageSelected ? foodAccessByAge : foodAccessByRace,
            discrete: "y",
            height: 300,
            legend: false,
            groupBy: ageSelected ? "Age Group" : "Race Group",
            x: "Percent",
            y: ageSelected ? "Age Group" : "Race Group",
            time: "Year",
            shapeConfig: {
              label: false
            },
            // xSort: ageSelected ? (a, b) => a["ID Age Group"] - b["ID Age Group"] : (a, b) => a["ID Race Group"] - b["ID Race Group"],
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.Percent)]]}
          }}
          />
        </article>

        {/* Create a Geomap based on the dropdown choice. */}
        <Geomap config={{
          data: ageSelected ? "/api/data?measures=Percent&drilldowns=Age%20Group,County&Year=all" : "/api/data?measures=Percent&drilldowns=Race%20Group,County&Year=all",
          groupBy: "ID County",
          colorScale: "Percent",
          label: d => d.County,
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.Percent)]]},
          topojson: "/topojson/county.json",
          topojsonFilter: d => d.id.startsWith("05000US26")
        }}
        dataFormat={resp => resp.data}
        />
      </SectionColumns>
    );
  }
}

DemographicFoodAccess.defaultProps = {
  slug: "demographic-access"
};

DemographicFoodAccess.need = [
  fetchData("foodAccessByAge", "/api/data?measures=Percent&drilldowns=Age%20Group&Geography=<id>&Year=all", d => d.data),
  fetchData("foodAccessByRace", "/api/data?measures=Percent&drilldowns=Race%20Group&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  foodAccessByAge: state.data.foodAccessByAge,
  foodAccessByRace: state.data.foodAccessByRace
});

export default connect(mapStateToProps)(DemographicFoodAccess);

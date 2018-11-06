import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Crime extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Violent crime"};
  }

  // Handler function for dropdown onChange.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {
    const {dropdownValue} = this.state;
    console.log("dropdownValue: ", dropdownValue);
    const {crimeData} = this.props;
    console.log("crimeData: ", crimeData);

    const typesOfCrime = ["Violent crime", "Property crime"];

    // Find the percentage for each type of crime and add "share" property to each data point.
    nest()
      .key(d => d.Year)
      .entries(crimeData)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Crimes"]);
        group.values.forEach(d => d.share = d["Number of Crimes"] / total * 100);
      });

    // Seperate property crime and violent crime data from crime data array.
    const propertyCrime = [], violentCrime = [];
    crimeData.forEach(d => d["Type of Crime"] === "Violent crime" ? violentCrime.push(d) : propertyCrime.push(d));

    // Get data for Property crime stats.
    const recentYearPropertyCrime = {};
    nest()
      .key(d => d.Year)
      .entries(propertyCrime)
      .forEach(group => {
        group.key >= propertyCrime[0].Year ? Object.assign(recentYearPropertyCrime, group) : {};
      });
    recentYearPropertyCrime.values.sort((a, b) => b.share - a.share);
    const topRecentYearPropertyCrime = recentYearPropertyCrime.values[0];

    // Get data for Property crime stats.
    const recentYearViolentCrime = {};
    nest()
      .key(d => d.Year)
      .entries(violentCrime)
      .forEach(group => {
        group.key >= violentCrime[0].Year ? Object.assign(recentYearViolentCrime, group) : {};
      });
    recentYearViolentCrime.values.sort((a, b) => b.share - a.share);
    const topRecentYearViolentCrime = recentYearViolentCrime.values[0];

    const violentCrimeSelected = dropdownValue === "Violent crime";

    return (
      <SectionColumns>
        <SectionTitle>Crime</SectionTitle>
        <article>
          {/* Create a dropdown for drug types. */}
          <select onChange={this.handleChange}>
            {typesOfCrime.map(item => <option key={item} value={item}>{item}</option>)}
          </select>

          {/* Show a Stats and a short paragraph for each type of crime based on the dropdown value. */}
          { violentCrimeSelected
            ? <Stat 
              title={`Top Violent Crime in ${topRecentYearViolentCrime.Year}`}
              value={`${topRecentYearViolentCrime.Crime} ${formatPercentage(topRecentYearViolentCrime.share)}`}
            />
            : <Stat 
              title={`Top Property Crime in ${topRecentYearPropertyCrime.Year}`}
              value={`${topRecentYearPropertyCrime.Crime} ${formatPercentage(topRecentYearPropertyCrime.share)}`}
            />
          }
          { violentCrimeSelected
            ? <p>The Barchart here shows data for different types of Violent Crime. In {topRecentYearViolentCrime.Year}, {topRecentYearViolentCrime.Crime} had the highest rate Violent crime of ${formatPercentage(topRecentYearViolentCrime.share)} at the current location.</p>
            : <p>The Barchart here shows data for different types of Property Crime. In {topRecentYearPropertyCrime.Year}, {topRecentYearPropertyCrime.Crime} had the highest rate Property crime of ${formatPercentage(topRecentYearPropertyCrime.share)} at the current location.</p>
          }
        </article>

        {/* Draw a Barchart for each type of crime based on the dropdown value. */}
        <BarChart config={{
          data: violentCrimeSelected ? violentCrime : propertyCrime,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Crime",
          x: "Crime",
          y: "share",
          time: "ID Year",
          xConfig: {
            labelRotation: false,
            title: `Types of ${dropdownValue}`
          },
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Crime Rate"
          },
          xSort: (a, b) => a.share - b.share,
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Crime.defaultProps = {
  slug: "crime"
};

Crime.need = [
  fetchData("crimeData", "/api/data?measures=Number%20of%20Crimes&drilldowns=Type%20of%20Crime,Crime&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  crimeData: state.data.crimeData
});

export default connect(mapStateToProps)(Crime);

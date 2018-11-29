import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Homeless extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Sheltered"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {typesOfShelteredHomeless, typesOfUnshelteredHomeless, typesOfHomeless} = this.props;
    const {dropdownValue} = this.state;
    const dropdownList = ["Sheltered", "Unsheltered"];
    const shelteredSelected = dropdownValue === "Sheltered";

    console.log("typesOfShelteredHomeless: ", typesOfShelteredHomeless);
    const recentYearTypesOfShelteredHomeless = {};
    nest()
      .key(d => d.Year)
      .entries(typesOfShelteredHomeless)
      .forEach(group => {
        const total = sum(group.values, d => d.Sheltered);
        group.values.forEach(d => d.share = d.Sheltered / total * 100);
        group.key >= typesOfShelteredHomeless[0].Year ? Object.assign(recentYearTypesOfShelteredHomeless, group) : {};
      });
    recentYearTypesOfShelteredHomeless.values.sort((a, b) => b.share - a.share);
    const topShelteredHomelessTypes = recentYearTypesOfShelteredHomeless.values[0];

    console.log("typesOfUnshelteredHomeless: ", typesOfUnshelteredHomeless);
    const recentYearTypesOfUnshelteredHomeless = {};
    nest()
      .key(d => d.Year)
      .entries(typesOfUnshelteredHomeless)
      .forEach(group => {
        const total = sum(group.values, d => d.Unsheltered);
        group.values.forEach(d => d.share = d.Unsheltered / total * 100);
        group.key >= typesOfUnshelteredHomeless[0].Year ? Object.assign(recentYearTypesOfUnshelteredHomeless, group) : {};
      });
    recentYearTypesOfUnshelteredHomeless.values.sort((a, b) => b.share - a.share);
    const topUnshelteredHomelessTypes = recentYearTypesOfUnshelteredHomeless.values[0];
    
    // Get data for Homeless types - Sheltered and Unsheltered with their sub-categories.
    const data = [];
    typesOfHomeless.forEach(d => {
      dropdownList.forEach(homelessType => {
        if (d[homelessType] !== null) {
          data.push(Object.assign({}, d, {HomelessType: homelessType}));
        }
      });
    });
    const recentYearTypesOfHomeless = {};
    nest()
      .key(d => d.Year)
      .entries(data)
      .forEach(group => {
        const total = sum(group.values, d => d[d.HomelessType]);
        group.values.forEach(d => d.share = d[d.HomelessType] / total * 100);
        group.key >= data[0].Year ? Object.assign(recentYearTypesOfHomeless, group) : {};
      });
    recentYearTypesOfHomeless.values.sort((a, b) => b.share - a.share);
    const topHomelessTypes = recentYearTypesOfHomeless.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Homeless</SectionTitle>
        <article>
          {/* Create a dropdown for each age and race type using raceAndAgeTypes array. */}
          <select onChange={this.handleChange}>
            {dropdownList.map((item, i) => <option key={i} value={item}>{item}</option>)}
          </select>
          {shelteredSelected
            ? <Stat 
              title={`Majority Sheltered Homeless Category in ${topShelteredHomelessTypes.Year}`}
              value={`${topShelteredHomelessTypes["Sub-category"]} ${formatPercentage(topShelteredHomelessTypes.share)}`}
            />
            : <Stat 
              title={`Majority Unsheltered Homeless Category in ${topUnshelteredHomelessTypes.Year}`}
              value={`${topUnshelteredHomelessTypes["Sub-category"]} ${formatPercentage(topUnshelteredHomelessTypes.share)}`}
            />}
          <Stat 
            title={`Majority Homeless Type in ${topHomelessTypes.Year}`}
            value={`${topHomelessTypes.HomelessType} ${topHomelessTypes["Sub-category"]} ${formatPercentage(topHomelessTypes.share)}`}
          />

          <BarChart config={{
            data,
            discrete: "y",
            height: 250,
            stacked: true,
            groupBy: d => `${d.HomelessType} ${d["Sub-category"]}`,
            legend: false,
            time: "Year",
            x: "share",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Homeless Percentage"
            },
            y: "HomelessType",
            yConfig: {
              ticks: [],
              labelRotation: false,
              title: "Homeless Types"
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />
        </article>

        <LinePlot config={{
          data: shelteredSelected ? typesOfShelteredHomeless : typesOfUnshelteredHomeless,
          discrete: "x",
          height: 400,
          groupBy: "Sub-category",
          legend: false,
          x: "Year",
          xConfig: {
            title: "Year",
            labelRotation: false
          },
          y: "share",
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Homeless Categories"
          },
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Homeless.defaultProps = {
  slug: "homeless"
};

Homeless.need = [
  fetchData("typesOfShelteredHomeless", "/api/data?measures=Sheltered&drilldowns=Sub-category&County=<id>&Year=all", d => d.data),
  fetchData("typesOfUnshelteredHomeless", "/api/data?measures=Unsheltered&drilldowns=Sub-category&County=<id>&Year=all", d => d.data),
  fetchData("typesOfHomeless", "/api/data?measures=Sheltered,Unsheltered&drilldowns=Sub-category&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  typesOfShelteredHomeless: state.data.typesOfShelteredHomeless,
  typesOfUnshelteredHomeless: state.data.typesOfUnshelteredHomeless,
  typesOfHomeless: state.data.typesOfHomeless
});

export default connect(mapStateToProps)(Homeless);
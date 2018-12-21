import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Homeless extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Sheltered"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {typesOfShelteredHomeless, typesOfUnshelteredHomeless, typesOfHomeless, totalHomelessData, population} = this.props;

    const {dropdownValue} = this.state;
    const dropdownList = ["Sheltered", "Unsheltered"];
    const shelteredSelected = dropdownValue === "Sheltered";

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
    const shelteredData = data.filter(d => d.HomelessType === "Sheltered");
    
    const totalHomelessPopulation = (totalHomelessData[0].Sheltered + totalHomelessData[0].Unsheltered) / population.data[0].Population * 100;

    return (
      <SectionColumns>
        <SectionTitle>Homeless</SectionTitle>
        <article>
          {/* Create a dropdown for sheltered and unsheltered choices. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {shelteredSelected
            ? <Stat
              title={"Most common Sheltered demographic"}
              year={topShelteredHomelessTypes.Year}
              value={topShelteredHomelessTypes.Category}
              qualifier={formatPercentage(topShelteredHomelessTypes.share)}
            />
            : <Stat
              title={"Most common Unsheltered demographic"}
              year={topUnshelteredHomelessTypes.Year}
              value={topUnshelteredHomelessTypes.Category}
              qualifier={formatPercentage(topUnshelteredHomelessTypes.share)}
            />}
          <Stat
            title={"Homeless rate"}
            year={totalHomelessData[0].Year}
            value={formatPercentage(totalHomelessPopulation)}
          />

          {shelteredSelected
            ? <p>In {totalHomelessData[0].Year}, {formatPercentage(totalHomelessPopulation)} of the population in {totalHomelessData[0].Geography} was homeless. The most common demographic of {dropdownValue.toLowerCase()} individuals is {topShelteredHomelessTypes.Category.toLowerCase()} ({formatPercentage(topShelteredHomelessTypes.share)}).</p>
            : <p>In {totalHomelessData[0].Year}, {formatPercentage(totalHomelessPopulation)} of the population in {totalHomelessData[0].Geography} was homeless. The most common demographic of {dropdownValue.toLowerCase()} individuals is {topUnshelteredHomelessTypes.Category.toLowerCase()} ({formatPercentage(topUnshelteredHomelessTypes.share)}).</p>
          }

          <p>The chart on the right shows different categories of homeless population and the corresponding share for each category.</p>
          <p>The following chart shows types of sheltered homeless population and the corresponding share for each type.</p>

          {/* Draw a lineplot for sheltered homeless population. */}
          <LinePlot config={{
            data: shelteredData,
            discrete: "x",
            height: 200,
            groupBy: "Sub-group",
            legend: false,
            x: "Year",
            xConfig: {
              labelRotation: false
            },
            y: "share",
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Sheltered Population"
            },
            tooltipConfig: {tbody: [["Share", d => formatPercentage(d.share)]]}
          }}
          />
        </article>

        <LinePlot config={{
          data: shelteredSelected ? typesOfShelteredHomeless : typesOfUnshelteredHomeless,
          discrete: "x",
          height: 400,
          groupBy: "Category",
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
          tooltipConfig: {tbody: [["Share", d => formatPercentage(d.share)]]}
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
  fetchData("typesOfShelteredHomeless", "/api/data?measures=Sheltered&drilldowns=Category&Geography=<id>&Year=all", d => d.data),
  fetchData("typesOfUnshelteredHomeless", "/api/data?measures=Unsheltered&drilldowns=Category&Geography=<id>&Year=all", d => d.data),
  fetchData("typesOfHomeless", "/api/data?measures=Sheltered,Unsheltered&drilldowns=Sub-group&Geography=<id>&Year=all", d => d.data),
  fetchData("totalHomelessData", "/api/data?measures=Sheltered,Unsheltered&drilldowns=Group&Geography=<id>&Year=latest", d => d.data),
  fetchData("population", "https://niagara.datausa.io/api/data?measures=Population&Geography=<id>&year=latest")
];

const mapStateToProps = state => ({
  typesOfShelteredHomeless: state.data.typesOfShelteredHomeless,
  typesOfUnshelteredHomeless: state.data.typesOfUnshelteredHomeless,
  typesOfHomeless: state.data.typesOfHomeless,
  totalHomelessData: state.data.totalHomelessData,
  population: state.data.population
});

export default connect(mapStateToProps)(Homeless);

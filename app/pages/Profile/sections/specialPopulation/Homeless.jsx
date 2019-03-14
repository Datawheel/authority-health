import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatTypesOfShelteredHomeless = typesOfShelteredHomeless => {
  nest()
    .key(d => d.Year)
    .entries(typesOfShelteredHomeless)
    .forEach(group => {
      const total = sum(group.values, d => d["Sheltered Homeless Population"]);
      group.values.forEach(d => d.share = d["Sheltered Homeless Population"] / total * 100);
    });
  const topShelteredHomelessTypes = typesOfShelteredHomeless.sort((a, b) => b.share - a.share)[0];
  return [typesOfShelteredHomeless, topShelteredHomelessTypes];
};

const formatTypesOfUnshelteredHomeless = typesOfUnshelteredHomeless => {
  nest()
    .key(d => d.Year)
    .entries(typesOfUnshelteredHomeless)
    .forEach(group => {
      const total = sum(group.values, d => d["Unsheltered Homeless Population"]);
      group.values.forEach(d => d.share = d["Unsheltered Homeless Population"] / total * 100);
    });
  const topUnshelteredHomelessTypes = typesOfUnshelteredHomeless.sort((a, b) => b.share - a.share)[0];
  return [typesOfUnshelteredHomeless, topUnshelteredHomelessTypes];
};

const formatTypesOfHomeless = (typesOfHomeless, shelteredSelected) => {
  // Get data for Homeless types - Sheltered and Unsheltered with their sub-categories.
  const data = [];
  const dropdownList = ["Sheltered Homeless Population", "Unsheltered Homeless Population"];
  typesOfHomeless.forEach(d => {
    dropdownList.forEach(homelessType => {
      if (d[homelessType] !== null) {
        data.push(Object.assign({}, d, {HomelessType: homelessType}));
      }
    });
  });
  nest()
    .key(d => d.Year)
    .entries(data)
    .forEach(group => {
      const total = sum(group.values, d => d[d.HomelessType]);
      group.values.forEach(d => d.share = d[d.HomelessType] / total * 100);
    });
  const resultData = shelteredSelected ? data.filter(d => d.HomelessType === "Sheltered Homeless Population") : data.filter(d => d.HomelessType !== "Sheltered Homeless Population");
  return resultData;
};

class Homeless extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta,
      dropdownValue: "Sheltered Homeless Population",
      typesOfUnshelteredHomeless: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue =  event.target.value;
    axios.get(`/api/data?measures=Unsheltered Homeless Population&drilldowns=Category&Geography=${this.state.meta.id}&Year=latest`)
      .then(resp => {
        this.setState({
          typesOfUnshelteredHomeless: resp.data.data,
          dropdownValue
        });
      });
  }

  render() {

    const {typesOfShelteredHomeless, totalHomelessData, wayneCountyPopulation} = this.props;
    const {meta, typesOfUnshelteredHomeless, dropdownValue} = this.state;

    const dropdownList = ["Sheltered Homeless Population", "Unsheltered Homeless Population"];
    const shelteredSelected = dropdownValue === "Sheltered Homeless Population";

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isHomelessDataAvailableForCurrentGeography = totalHomelessData.source[0].substitutions.length === 0;

    const topShelteredHomelessTypes = formatTypesOfShelteredHomeless(typesOfShelteredHomeless)[1];
    const topUnshelteredHomelessTypes = formatTypesOfUnshelteredHomeless(typesOfUnshelteredHomeless)[1];
    const totalHomelessPopulation = (totalHomelessData.data[0]["Sheltered Homeless Population"] + totalHomelessData.data[0]["Unsheltered Homeless Population"]) / wayneCountyPopulation[0].Population * 100;

    return (
      <SectionColumns>
        <SectionTitle>Homeless</SectionTitle>
        <article>
          {isHomelessDataAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">Showing data for {typesOfShelteredHomeless[0].Geography}</div>}
          {/* Create a dropdown for sheltered and unsheltered choices. */}
          <label className="pt-label pt-inline" htmlFor="health-center-dropdown">
            Show data for
            <div className="pt-select">
              <select id="health-center-dropdown" onChange={this.handleChange}>
                {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </label>

          <Stat
            title={shelteredSelected ? "Most common Sheltered demographic" : "Most common Unsheltered demographic"}
            year={shelteredSelected ? topShelteredHomelessTypes.Year : topUnshelteredHomelessTypes.Year}
            value={shelteredSelected ? topShelteredHomelessTypes.Category : topUnshelteredHomelessTypes.Category}
            qualifier={shelteredSelected ? formatPercentage(topShelteredHomelessTypes.share) : formatPercentage(topUnshelteredHomelessTypes.share)}
          />
          <Stat
            title={"Homeless rate"}
            year={totalHomelessData.data[0].Year}
            value={formatPercentage(totalHomelessPopulation)}
          />

          {shelteredSelected
            ? <p>In {totalHomelessData.data[0].Year}, {formatPercentage(totalHomelessPopulation)} of the population in {totalHomelessData.data[0].Geography} was homeless. The most common demographic of {dropdownValue.toLowerCase()} individuals is {topShelteredHomelessTypes.Category.toLowerCase()} ({formatPercentage(topShelteredHomelessTypes.share)}).</p>
            : <p>In {totalHomelessData.data[0].Year}, {formatPercentage(totalHomelessPopulation)} of the population in {totalHomelessData.data[0].Geography} was homeless. The most common demographic of {dropdownValue.toLowerCase()} individuals is {topUnshelteredHomelessTypes.Category.toLowerCase()} ({formatPercentage(topUnshelteredHomelessTypes.share)}).</p>
          }

          <p>The chart on the right shows different categories of homeless population and the corresponding share for each category.</p>
          <p>The following chart shows types of sheltered homeless population and the corresponding share for each type.</p>

          {/* Draw a lineplot for sheltered homeless population. */}
          <LinePlot config={{
            data: `/api/data?measures=Sheltered Homeless Population,Unsheltered Homeless Population&drilldowns=Sub-group&Geography=${meta.id}&Year=all`,
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
              title: dropdownValue
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => formatTypesOfHomeless(resp.data, shelteredSelected)}
          />
          <Contact slug={this.props.slug} />
        </article>

        <LinePlot config={{
          data: shelteredSelected ? `/api/data?measures=Sheltered Homeless Population&drilldowns=Category&Geography=${meta.id}&Year=all` : `/api/data?measures=Unsheltered Homeless Population&drilldowns=Category&Geography=${meta.id}&Year=all`,
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
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["County", d => d.Geography]]}
        }}
        dataFormat={resp => shelteredSelected ? formatTypesOfShelteredHomeless(resp.data)[0] : formatTypesOfUnshelteredHomeless(resp.data)[0]}
        />
      </SectionColumns>
    );
  }
}

Homeless.defaultProps = {
  slug: "homeless"
};

Homeless.need = [
  fetchData("typesOfShelteredHomeless", "/api/data?measures=Sheltered Homeless Population&drilldowns=Category&Geography=<id>&Year=latest", d => d.data),
  fetchData("totalHomelessData", "/api/data?measures=Sheltered Homeless Population,Unsheltered Homeless Population&drilldowns=Group&Geography=<id>&Year=latest"),
  fetchData("wayneCountyPopulation", "https://acs.datausa.io/api/data?measures=Population&Geography=05000US26163&year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  typesOfShelteredHomeless: state.data.typesOfShelteredHomeless,
  totalHomelessData: state.data.totalHomelessData,
  wayneCountyPopulation: state.data.wayneCountyPopulation.data
});

export default connect(mapStateToProps)(Homeless);

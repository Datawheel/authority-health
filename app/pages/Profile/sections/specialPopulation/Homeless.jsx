import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {LinePlot, BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import Stat from "components/Stat";

const definitions = [
  {term: "Sheltered Homeless", definition: "According to U.S. Department of Housing and Urban Development, a person is considered sheltered homeless when he/she resides in a an emergency shelter or in transitional housing or supportive housing for homeless persons who originally came from the streets or emergency shelters."},
  {term: "Unsheltered Homeless", definition: "According to U.S. Department of Housing and Urban Development, a person is considered unsheltered homeless when he/she resides in a place not meant for human habitation, such as cars, parks, sidewalks, abandoned buildings (on the street)."}
];

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatTypesOfShelteredAndUnshelteredData = (data, shelteredHomelessData = false) => {
  if (shelteredHomelessData) {
    nest()
      .key(d => d.Year)
      .entries(data)
      .forEach(group => {
        const total = sum(group.values, d => d["Sheltered Homeless Population"]);
        group.values.forEach(d => d.share = d["Sheltered Homeless Population"] / total * 100);
      });
    const topShelteredHomelessTypes = data.sort((a, b) => b.share - a.share)[0];
    return [data, topShelteredHomelessTypes];
  }
  else {
    nest()
      .key(d => d.Year)
      .entries(data)
      .forEach(group => {
        const total = sum(group.values, d => d["Unsheltered Homeless Population"]);
        group.values.forEach(d => d.share = d["Unsheltered Homeless Population"] / total * 100);
      });
    const topUnshelteredHomelessTypes = data.sort((a, b) => b.share - a.share)[0];
    return [data, topUnshelteredHomelessTypes];
  }
};

const formatTypesOfHomeless = typesOfHomeless => {
  // Get data for Homeless types - Sheltered and Unsheltered with their sub-categories.
  const data = [];
  const homelessTypes = ["Sheltered Homeless Population", "Unsheltered Homeless Population"];
  typesOfHomeless.forEach(d => {
    homelessTypes.forEach(homelessType => {
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
  return data;
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

  render() {

    const {meta, typesOfShelteredAndUnshelteredHomeless, totalHomelessData, wayneCountyPopulation} = this.props;

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isHomelessDataAvailableForCurrentGeography = totalHomelessData.source[0].substitutions.length === 0;

    const topShelteredHomelessTypes = formatTypesOfShelteredAndUnshelteredData(typesOfShelteredAndUnshelteredHomeless, true)[1];
    const topUnshelteredHomelessTypes = formatTypesOfShelteredAndUnshelteredData(typesOfShelteredAndUnshelteredHomeless)[1];
    const totalHomelessPopulation = (totalHomelessData.data[0]["Sheltered Homeless Population"] + totalHomelessData.data[0]["Unsheltered Homeless Population"]) / wayneCountyPopulation[0].Population * 100;

    return (
      <SectionColumns>
        <SectionTitle>Homeless</SectionTitle>
        <article>
          {isHomelessDataAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">Showing data for {topShelteredHomelessTypes.Geography}</div>}
          <Stat
            title={"Homeless rate"}
            year={totalHomelessData.data[0].Year}
            value={formatPercentage(totalHomelessPopulation)}
          />
          <Stat
            title={"Most common Sheltered demographic"}
            year={topShelteredHomelessTypes.Year}
            value={topShelteredHomelessTypes.Category}
            qualifier={formatPercentage(topShelteredHomelessTypes.share)}
          />
          <Stat
            title={"Most common Unsheltered demographic"}
            year={topUnshelteredHomelessTypes.Year}
            value={topUnshelteredHomelessTypes.Category}
            qualifier={formatPercentage(topUnshelteredHomelessTypes.share)}
          />
          
          <p>In {totalHomelessData.data[0].Year}, {formatPercentage(totalHomelessPopulation)} of the population in {totalHomelessData.data[0].Geography} was homeless. { } 
          The most common sheltered demographic was {topShelteredHomelessTypes.Category.toLowerCase()} ({formatPercentage(topShelteredHomelessTypes.share)}) { } 
          and unsheltered demographic was {topUnshelteredHomelessTypes.Category.toLowerCase()} ({formatPercentage(topUnshelteredHomelessTypes.share)}).</p>

          <p>Following charts shows different categories and types of sheltered and unsheltered homeless population in {totalHomelessData.data[0].Geography} and percentage for each one of them.</p>

          {/* Draw a lineplot for sheltered homeless population. */}
          <LinePlot config={{
            data: `/api/data?measures=Sheltered Homeless Population,Unsheltered Homeless Population&drilldowns=Sub-group&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 200,
            groupBy: d => ` ${d.HomelessType}: ${d["Sub-group"]}`,
            legend: false,
            x: "Year",
            xConfig: {
              labelRotation: false
            },
            y: "share",
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Types of Sheltered & Unsheltered Population"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => formatTypesOfHomeless(resp.data)}
          />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        <BarChart config={{
          data: `/api/data?measures=Sheltered Homeless Population,Unsheltered Homeless Population&drilldowns=Category&Geography=${meta.id}&Year=all`,
          discrete: "x",
          height: 400,
          // stacked: true,
          legend: false,
          groupBy: "HomelessType",
          x: "Category",
          y: "share",
          time: "Year",
          xConfig: {labelRotation: false},
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Share"
          },
          title: "Categories in Sheltered & Unsheltered Population",
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
        }}
        dataFormat={resp => formatTypesOfHomeless(resp.data)}
        />
      </SectionColumns>
    );
  }
}

Homeless.defaultProps = {
  slug: "homeless"
};

Homeless.need = [
  fetchData("typesOfShelteredAndUnshelteredHomeless", "/api/data?measures=Sheltered Homeless Population,Unsheltered Homeless Population&drilldowns=Category&Geography=<id>&Year=latest", d => d.data),
  fetchData("totalHomelessData", "/api/data?measures=Sheltered Homeless Population,Unsheltered Homeless Population&drilldowns=Group&Geography=<id>&Year=latest"),
  fetchData("wayneCountyPopulation", "https://acs.datausa.io/api/data?measures=Population&Geography=05000US26163&year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  typesOfShelteredAndUnshelteredHomeless: state.data.typesOfShelteredAndUnshelteredHomeless,
  totalHomelessData: state.data.totalHomelessData,
  wayneCountyPopulation: state.data.wayneCountyPopulation.data
});

export default connect(mapStateToProps)(Homeless);

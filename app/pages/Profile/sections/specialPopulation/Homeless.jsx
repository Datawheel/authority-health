import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {LinePlot, BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionRows, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import Stat from "components/Stat";

const definitions = [
  {term: "Sheltered Homeless", definition: "According to U.S. Department of Housing and Urban Development, a person is considered sheltered homeless when he/she resides in a an emergency shelter or in transitional housing or supportive housing for homeless persons who originally came from the streets or emergency shelters."},
  {term: "Unsheltered Homeless", definition: "According to U.S. Department of Housing and Urban Development, a person is considered unsheltered homeless when he/she resides in a place not meant for human habitation, such as cars, parks, sidewalks, abandoned buildings (on the street)."}
];

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatShelteredHomelessCategories = data => {
  nest()
    .key(d => d.Year)
    .entries(data)
    .forEach(group => {
      const total = sum(group.values, d => d["Sheltered Homeless Population"]);
      group.values.forEach(d => d.shelteredShare = d["Sheltered Homeless Population"] / total * 100);
    });
  const topShelteredHomelessTypes = data.sort((a, b) => b.shelteredShare - a.shelteredShare)[0];
  return [data, topShelteredHomelessTypes];
};

const formatUnshelteredHomelessCategories = data => {
  nest()
    .key(d => d.Year)
    .entries(data)
    .forEach(group => {
      const total = sum(group.values, d => d["Unsheltered Homeless Population"]);
      group.values.forEach(d => d.unshelteredShare = d["Unsheltered Homeless Population"] / total * 100);
    });
  const topUnshelteredHomelessTypes = data.sort((a, b) => b.unshelteredShare - a.unshelteredShare)[0];
  return [data, topUnshelteredHomelessTypes];
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

  render() {

    const {meta, typesOfShelteredAndUnshelteredHomeless, totalHomelessData, wayneCountyPopulation} = this.props;

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isHomelessDataAvailableForCurrentGeography = totalHomelessData.source[0].substitutions.length === 0;

    const topShelteredHomelessCategory = formatShelteredHomelessCategories(typesOfShelteredAndUnshelteredHomeless)[1];
    const topUnshelteredHomelessCategory = formatUnshelteredHomelessCategories(typesOfShelteredAndUnshelteredHomeless)[1];
    const totalHomelessPopulation = (totalHomelessData.data[0]["Sheltered Homeless Population"] + totalHomelessData.data[0]["Unsheltered Homeless Population"]) / wayneCountyPopulation[0].Population * 100;

    return (
      <SectionColumns>
        <SectionTitle>Homeless</SectionTitle>
        <article>
          {isHomelessDataAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">data is shown for {topShelteredHomelessCategory.Geography}</div>}
          <Stat
            title={"Homeless rate"}
            year={totalHomelessData.data[0].Year}
            value={formatPercentage(totalHomelessPopulation)}
          />
          <Stat
            title={"Most common Sheltered demographic"}
            year={topShelteredHomelessCategory.Year}
            value={topShelteredHomelessCategory.Category}
            qualifier={formatPercentage(topShelteredHomelessCategory.shelteredShare)}
          />
          <Stat
            title={"Most common Unsheltered demographic"}
            year={topUnshelteredHomelessCategory.Year}
            value={topUnshelteredHomelessCategory.Category}
            qualifier={formatPercentage(topUnshelteredHomelessCategory.unshelteredShare)}
          />

          <p>In {totalHomelessData.data[0].Year}, {formatPercentage(totalHomelessPopulation)} of the population in {totalHomelessData.data[0].Geography} was homeless. { }
          The most common sheltered demographic was {topShelteredHomelessCategory.Category.toLowerCase()} ({formatPercentage(topShelteredHomelessCategory.shelteredShare)}) { }
          and unsheltered demographic was {topUnshelteredHomelessCategory.Category.toLowerCase()} ({formatPercentage(topUnshelteredHomelessCategory.unshelteredShare)}).</p>

          <p>Following charts shows different categories and types of sheltered and unsheltered homeless population in {totalHomelessData.data[0].Geography} and percentages for each one of them.</p>

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
              title: "Share"
            },
            title: d => `Types of Homeless Population in ${d[0].Geography}`,
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => formatTypesOfHomeless(resp.data)}
          />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        {/* <SectionRows>  */}
        <BarChart config={{
          data: `/api/data?measures=Sheltered Homeless Population&drilldowns=Category&Geography=${meta.id}&Year=all`,
          discrete: "y",
          legend: false,
          groupBy: "Category",
          label: d => `Sheltered Homeless: ${d.Category}`,
          x: "shelteredShare",
          y: "Category",
          time: "Year",
          xConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Share"
          },
          yConfig: {
            labelRotation: false
          },
          title: d => `Categories in Sheltered Homeless Population in ${d[0].Geography}`,
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.shelteredShare)], ["County", d => d.Geography]]}
        }}
        dataFormat={resp => formatShelteredHomelessCategories(resp.data)[0]}
        />
        
        <BarChart config={{
          data: `/api/data?measures=Unsheltered Homeless Population&drilldowns=Category&Geography=${meta.id}&Year=all`,
          discrete: "y",
          legend: false,
          groupBy: "Category",
          label: d => `Unsheltered Homeless: ${d.Category}`,
          x: "unshelteredShare",
          y: "Category",
          time: "Year",
          xConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Share"
          },
          yConfig: {
            labelRotation: false
          },
          title: d => `Categories in Unsheltered Homeless Population in ${d[0].Geography}`,
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.unshelteredShare)], ["County", d => d.Geography]]}
        }}
        dataFormat={resp => formatUnshelteredHomelessCategories(resp.data)[0]}
        />
        {/* </SectionRows> */}
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

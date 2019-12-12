import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {LinePlot, BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Glossary from "components/Glossary";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const definitions = [
  {term: "Sheltered Homeless", definition: "According to U.S. Department of Housing and Urban Development, a person is considered sheltered homeless when he/she resides in a an emergency shelter or in transitional housing or supportive housing for homeless persons who originally came from the streets or emergency shelters."},
  {term: "Unsheltered Homeless", definition: "According to U.S. Department of Housing and Urban Development, a person is considered unsheltered homeless when he/she resides in a place not meant for human habitation, such as cars, parks, sidewalks, abandoned buildings (on the street)."},
  {term: "Parenting Youth", definition: "A youth who identifies as the parent or legal guardian of one or more children who are present with or sleeping in the same place as that youth parent, where there is no person over age 24 in the household."},
  {term: "Chronically Homeless", definition: "HUD defines a “chronically homeless” individual as someone who has been homeless and living or residing in a place not meant for human habitation, a safe haven, or in an emergency shelter continuously for at least 1 year or on at least four separate occasions in the last 3 years where the combined length of time homeless in those occasions is at least 12 months, and also has a disability."},
  {term: "Unaccompanied Youth", definition: "Persons who are age 24 or younger, who are not part of a family with children, and who are not accompanied by their parent or guardian during their episode of homelessness. This also includes two or more youth age 24 or younger who are presenting together as a family without children."},
  {term: "Homeless Veteran", definition: "The United States Code defines the term “homeless veteran” as “a veteran who is homeless (as that term is defined in section 103(a) of the McKinney-Vento Homeless Assistance Act)"}
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

  const shelteredData = data.filter(d => d.HomelessType !== "Unsheltered Homeless Population");
  return shelteredData;
};

class Homeless extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

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
          {!isHomelessDataAvailableForCurrentGeography &&
            <Disclaimer>Data is only available for {topShelteredHomelessCategory.Geography}</Disclaimer>
          }
          <Stat
            title={"Homeless rate"}
            year={totalHomelessData.data[0].Year}
            value={formatPercentage(totalHomelessPopulation)}
          />
          <Stat
            title={"Most common Sheltered demographic"}
            year={topShelteredHomelessCategory.Year}
            value={topShelteredHomelessCategory.Category}
            qualifier={`${formatPercentage(topShelteredHomelessCategory.shelteredShare)} of sheltered population`}
          />
          <Stat
            title={"Most common Unsheltered demographic"}
            year={topUnshelteredHomelessCategory.Year}
            value={topUnshelteredHomelessCategory.Category}
            qualifier={`${formatPercentage(topUnshelteredHomelessCategory.unshelteredShare)} of unsheltered population`}
          />

          <p>In {totalHomelessData.data[0].Year}, {formatPercentage(totalHomelessPopulation)} of the population in {totalHomelessData.data[0].Geography} was homeless. { }
          The most common sheltered demographic was {topShelteredHomelessCategory.Category.toLowerCase()} ({formatPercentage(topShelteredHomelessCategory.shelteredShare)}) { }
          and the most common unsheltered demographic was {topUnshelteredHomelessCategory.Category.toLowerCase()} ({formatPercentage(topUnshelteredHomelessCategory.unshelteredShare)}).</p>

          <p>The following charts show the different categories and types of sheltered and unsheltered homeless population in {totalHomelessData.data[0].Geography}.</p>

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />

          <div className="viz">
            <Options
              component={this}
              componentKey="viz1"
              dataFormat={resp => resp.data}
              slug={this.props.slug}
              data={ `/api/data?measures=Sheltered Homeless Population,Unsheltered Homeless Population&drilldowns=Sub-group&Geography=${meta.id}&Year=all` }
              title={ "Chart of Homeless Individuals vs Families" } />
            {/* Draw a lineplot for sheltered homeless population. */}
            <LinePlot ref={comp => this.viz1 = comp} config={{
              data: `/api/data?measures=Sheltered Homeless Population,Unsheltered Homeless Population&drilldowns=Sub-group&Geography=${meta.id}&Year=all`,
              discrete: "x",
              height: 200,
              groupBy: d => `${d["Sub-group"]} (${d.HomelessType.split(" ")[0]})`,
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
              title: d => `Homeless Individuals vs Families in ${d[0].Geography}`,
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["County", d => d.Geography]]}
            }}
            dataFormat={resp =>  {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatTypesOfHomeless(resp.data);
            }}
            />
          </div>
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz2"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Sheltered Homeless Population&drilldowns=Category&Geography=${meta.id}&Year=all` }
            title="Chart of Sheltered Homeless Demographics" />
          <BarChart ref={comp => this.viz2 = comp} config={{
            data: `/api/data?measures=Sheltered Homeless Population&drilldowns=Category&Geography=${meta.id}&Year=all`,
            height: 300,
            groupBy: "Category",
            label: d => `${d.Category} (Sheltered)`,
            y: "shelteredShare",
            x: "Category",
            time: "Year",
            xSort: (a, b) => a.Category.localeCompare(b.Category),
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Share"
            },
            title: d => `Sheltered Homeless Demographics in ${d[0].Geography}`,
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.shelteredShare)], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => formatShelteredHomelessCategories(resp.data)[0]}
          />

          <Options
            component={this}
            componentKey="viz3"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Unsheltered Homeless Population&drilldowns=Category&Geography=${meta.id}&Year=all` }
            title="Chart of Unsheltered Homeless Demographics" />
          <BarChart ref={comp => this.viz3 = comp} config={{
            data: `/api/data?measures=Unsheltered Homeless Population&drilldowns=Category&Geography=${meta.id}&Year=all`,
            groupBy: "Category",
            height: 300,
            label: d => `${d.Category} (Unsheltered)`,
            y: "unshelteredShare",
            x: "Category",
            time: "Year",
            xSort: (a, b) => a.Category.localeCompare(b.Category),
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Share"
            },
            title: d => `Unsheltered Homeless Demographics in ${d[0].Geography}`,
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.unshelteredShare)], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => formatUnshelteredHomelessCategories(resp.data)[0]}
          />
        </div>
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

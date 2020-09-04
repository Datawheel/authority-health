import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import rangeFormatter from "utils/rangeFormatter";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Glossary from "components/Glossary";
import Options from "components/Options";

const definitions = [
  {term: "Disability", definition: "Census Bureau defines disability as a long-lasting physical, mental, or emotional condition. This condition can make it difficult for a person to do activities such as walking, climbing stairs, dressing, bathing, learning, or remembering. This condition can also impede a person from being able to go outside the home alone or to work at a job or business."}
];

const formatPopulation = d => `${formatAbbreviate(d)}%`;

const formatHealthCoverageTypeData = healthCoverageType => {
  nest()
    .key(d => d.Year)
    .entries(healthCoverageType)
    .forEach(group => {
      const total = sum(group.values, d => d["Population in Disability"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Population in Disability"] / total * 100 : d.share = 0);
    });
  // Filter data for only disabled population.
  const filteredHealthCoverageType = healthCoverageType.filter(d => d["Disability Status"] !== "No Disability");

  return filteredHealthCoverageType;
};

const formatDisabilityStatus = disabilityStatus => {
  nest()
    .key(d => d.Year)
    .entries(disabilityStatus)
    .forEach(group => {
      const total = sum(group.values, d => d["Population in Disability"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Population in Disability"] / total * 100 : d.share = 0);
    });
  const filteredRecentYearDisabilityStatus = disabilityStatus.filter(d => d["ID Disability Status"] === 0);
  const topDisabilityStatus = filteredRecentYearDisabilityStatus.sort((a, b) => b.share - a.share)[0];
  return [disabilityStatus, topDisabilityStatus];
};

class DisabilityStatus extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {meta, healthCoverageType, disabilityStatus} = this.props;

    const healthCoverageTypeAvailable = healthCoverageType.length !== 0;
    const disabilityStatusAvailable = disabilityStatus.length !== 0;

    // Get top stat for disabled population.
    let topDisabilityStatus;
    if (disabilityStatusAvailable) {
      topDisabilityStatus = formatDisabilityStatus(disabilityStatus)[1];
    }

    // Read and transform Health Coverage type data into desired format.
    let filteredHealthCoverageType;
    if (healthCoverageTypeAvailable) {
      filteredHealthCoverageType = formatHealthCoverageTypeData(healthCoverageType);
    }

    return (
      <SectionColumns>
        <SectionTitle>Disability Status</SectionTitle>
        <article>
          {/* Show stats for the top data. */}
          <Stat
            title="Largest age group with a disibility"
            year={disabilityStatusAvailable ? topDisabilityStatus.Year : ""}
            value={disabilityStatusAvailable && topDisabilityStatus.share !== 0 ? `${rangeFormatter(topDisabilityStatus.Age)} years` : "N/A"}
            qualifier={disabilityStatusAvailable ? `(${formatPopulation(topDisabilityStatus.share)} of the population in ${topDisabilityStatus.Geography})` : ""}
          />
          {/* Write short paragraph describing stats and barchart. */}
          {disabilityStatusAvailable ? <p>In {topDisabilityStatus.Year}, the most commonly disabled age group was {topDisabilityStatus.share !== 0 ? topDisabilityStatus.Age.toLowerCase() : "N/A"}, making up {formatPopulation(topDisabilityStatus.share)} of all citizens in {topDisabilityStatus.Geography}.</p> : ""}
          {healthCoverageTypeAvailable ? <p>The chart here shows the health coverage breakdown of the disabled population by age in {filteredHealthCoverageType[0].Geography}.</p> : ""}

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          {healthCoverageTypeAvailable &&
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Population in Disability&drilldowns=Coverage Status,Coverage Type,Disability Status,Age&Geography=${meta.id}&Year=all` }
            title={ `Chart of Disability Status in ${meta.name}` } />
          }
          {/* Show barchart for each age group type with public, private and no health insurance coverage*/}
          {healthCoverageTypeAvailable &&
          <BarChart ref={comp => this.viz = comp} config={{
            data: `/api/data?measures=Population in Disability&drilldowns=Coverage Status,Coverage Type,Disability Status,Age&Geography=${meta.id}&Year=all`,
            discrete: "y",
            height: 400,
            stacked: true,
            groupBy: ["Coverage Type"],
            y: "Age",
            x: "share",
            time: "Year",
            title: d => `Disabled Population by Age and Health Coverage in ${d[0].Geography}`,
            yConfig: {
              tickFormat: d => `${rangeFormatter(d)} years`
            },
            xConfig: {
              tickFormat: d => formatPopulation(d)
            },
            ySort: (a, b) => a["ID Age"] - b["ID Age"],
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Age Group", d => `${rangeFormatter(d.Age)} years`], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return formatHealthCoverageTypeData(resp.data);
          }}
          />}
        </div>
      </SectionColumns>
    );
  }
}

DisabilityStatus.defaultProps = {
  slug: "disability-status"
};

DisabilityStatus.need = [
  fetchData("healthCoverageType", "/api/data?measures=Population in Disability&drilldowns=Coverage Status,Coverage Type,Disability Status,Age&Geography=<id>&Year=latest", d => d.data),
  fetchData("disabilityStatus", "/api/data?measures=Population in Disability&drilldowns=Disability Status,Age&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  healthCoverageType: state.data.healthCoverageType,
  disabilityStatus: state.data.disabilityStatus
});

export default connect(mapStateToProps)(DisabilityStatus);

/* eslint no-extra-parens: 0 */ // extra parens needed for && conditional
import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {Pie} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatRaceNames = d => d.replace("Health Center Patient Population", "").trim();
const lowerCaseRaceName = d => d.trim() === "Black" || d.trim() === "White" ? d.toLowerCase() : d;
const formatPercentage = d => `${formatAbbreviate(d * 100)}%`;

const formatRaceAndEthnicityData = raceAndEthnicityData => {
  // Add RaceType property to raceAndEthnicityData so that each race type can have individual object.
  const data = [];
  nest()
    .key(d => d.Year)
    .entries(raceAndEthnicityData.data)
    .forEach(group => {
      raceAndEthnicityData.source[0].measures.map(d => {
        const result = group.values.reduce((acc, currentValue) => {
          if (acc === null && currentValue[d] !== null) {
            // Non-white race population is the sum of all the race population minus White population.
            if (d === "Non-white Health Center Patient Population") {
              d = "White Health Center Patient Population";
              currentValue[d] = 1 - currentValue["Non-white Health Center Patient Population"];
              return Object.assign({}, currentValue, {RaceType: d});
            }
            return Object.assign({}, currentValue, {RaceType: d});
          }
          return acc;
        }, null);
        data.push(result);
      });
    });
  return data;
};

class HealthCenterDemographics extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {
    const {meta, raceAndEthnicityData, raceAndEthnicityZipLevelData} = this.props;
    const isZipLevelDataAvailable = raceAndEthnicityZipLevelData.data.length !== 0;

    const recentYearData = formatRaceAndEthnicityData(raceAndEthnicityData).sort((a, b) => b[b.RaceType] - a[a.RaceType]);
    const topMostRaceData = recentYearData[0];
    const topSecondRaceData = recentYearData[1];
    const topThirdRaceData = recentYearData[2];

    let recentYearZipLevelData, topZipLevelData;
    if (isZipLevelDataAvailable) {
      recentYearZipLevelData = formatRaceAndEthnicityData(raceAndEthnicityZipLevelData).sort((a, b) => b[b.RaceType] - a[a.RaceType]);
      topZipLevelData = recentYearZipLevelData[0];
    }

    return (
      <SectionColumns>
        <SectionTitle>Health Center Demographics</SectionTitle>
        <article>
          {(!isZipLevelDataAvailable && meta.level !== "county" && meta.name !== "") &&
            <Disclaimer>Data is shown for Wayne County</Disclaimer>
          }
          {
            meta.level === "tract" && isZipLevelDataAvailable &&
            <Disclaimer>Data is shown for zip {raceAndEthnicityZipLevelData.data[0].Geography}</Disclaimer>
          }

          {isZipLevelDataAvailable
            ? <Stat
              title={"Most common race utilizing health centers"}
              year={`${topZipLevelData.Year}`}
              value={formatRaceNames(topZipLevelData.RaceType)}
              qualifier={`${formatPercentage(topZipLevelData[topZipLevelData.RaceType])} of the population in ${topZipLevelData.Geography}`}
            /> : null}

          <Stat
            title={"Most common race utilizing health centers"}
            year={`${topMostRaceData.Year}`}
            value={formatRaceNames(topMostRaceData.RaceType)}
            qualifier={`${formatPercentage(topMostRaceData[topMostRaceData.RaceType])} of the health center visiting population in Wayne County`}
          />

          {isZipLevelDataAvailable ? <p>In {topZipLevelData.Year}, {formatPercentage(topZipLevelData[topZipLevelData.RaceType])} of the health center visiting population in {`zip ${topZipLevelData.Geography}`} were {lowerCaseRaceName(formatRaceNames(topZipLevelData.RaceType))}, compared to {lowerCaseRaceName(formatRaceNames(topMostRaceData.RaceType))} residents in Wayne County ({formatPercentage(topMostRaceData[topMostRaceData.RaceType])}).</p>
            : <p>In {topMostRaceData.Year}, {formatPercentage(topMostRaceData[topMostRaceData.RaceType])} of the health center visiting population in Wayne County were {lowerCaseRaceName(formatRaceNames(topMostRaceData.RaceType))}, followed by {lowerCaseRaceName(formatRaceNames(topSecondRaceData.RaceType))} ({formatPercentage(topSecondRaceData[topSecondRaceData.RaceType])}) and then {lowerCaseRaceName(formatRaceNames(topThirdRaceData.RaceType))} ({formatPercentage(topThirdRaceData[topThirdRaceData.RaceType])}).</p>}

          <p> The following chart shows the health center visitors breakdown across all reported racial groups in {isZipLevelDataAvailable ? topZipLevelData.Geography : "Wayne County"}.</p>

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ isZipLevelDataAvailable ? `/api/data?measures=Non-white Health Center Patient Population,Hispanic Health Center Patient Population,Black Health Center Patient Population,Asian Health Center Patient Population,American Indian/Alaska Native Health Center Patient Population&Geography=${meta.id}&Year=all` : "/api/data?measures=Non-white Health Center Patient Population,Hispanic Health Center Patient Population,Black Health Center Patient Population,Asian Health Center Patient Population,American Indian/Alaska Native Health Center Patient Population&Year=all" }
            title="Chart of Health Center Demographics" />

          {/* Draw a Pie chart to show data for health center data by race */}
          <Pie ref={comp => this.viz = comp } config={{
            data: isZipLevelDataAvailable ? `/api/data?measures=Non-white Health Center Patient Population,Hispanic Health Center Patient Population,Black Health Center Patient Population,Asian Health Center Patient Population,American Indian/Alaska Native Health Center Patient Population&Geography=${meta.id}&Year=all` : "/api/data?measures=Non-white Health Center Patient Population,Hispanic Health Center Patient Population,Black Health Center Patient Population,Asian Health Center Patient Population,American Indian/Alaska Native Health Center Patient Population&Year=all",
            groupBy: "RaceType",
            value: d => d[d.RaceType],
            label: d => d.RaceType.replace(" Health Center Patient Population", ""),
            time: "Year",
            shapeConfig: {
              Path: {
                fillOpacity: 1
              }
            },
            tooltipConfig: {
              title: d => d.RaceType,
              tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d[d.RaceType])], ["Geography", d => isZipLevelDataAvailable ? d.Geography : "Wayne County"]]
            }
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return formatRaceAndEthnicityData(resp);
          }}
          />
        </div>
      </SectionColumns>
    );
  }
}

HealthCenterDemographics.defaultProps = {
  slug: "health-center-demographics"
};

HealthCenterDemographics.need = [
  fetchData("raceAndEthnicityData", "/api/data?measures=Non-white Health Center Patient Population,Hispanic Health Center Patient Population,Black Health Center Patient Population,Asian Health Center Patient Population,American Indian/Alaska Native Health Center Patient Population&Year=latest"),
  fetchData("raceAndEthnicityZipLevelData", "/api/data?measures=Non-white Health Center Patient Population,Hispanic Health Center Patient Population,Black Health Center Patient Population,Asian Health Center Patient Population,American Indian/Alaska Native Health Center Patient Population&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  raceAndEthnicityData: state.data.raceAndEthnicityData,
  raceAndEthnicityZipLevelData: state.data.raceAndEthnicityZipLevelData
});

export default connect(mapStateToProps)(HealthCenterDemographics);

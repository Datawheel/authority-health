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

const formatRaceNames = d => d.replace("Health Center Patients", "");
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
            if (d === "Non-white Health Center Patients") {
              d = "White Health Center Patients";
              currentValue[d] = 1 - currentValue["Non-white Health Center Patients"];
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

    // const isHealthCentersSelected = dropdownValue === "Health Centers";

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
            qualifier={`${formatPercentage(topMostRaceData[topMostRaceData.RaceType])} of the population in Wayne County`}
          />

          {isZipLevelDataAvailable ? <p>In {topZipLevelData.Year}, {lowerCaseRaceName(formatRaceNames(topZipLevelData.RaceType))} residents of {`zip ${topZipLevelData.Geography}`} visited health centers more than any other race/ethnicity group that utilizes services offered by health centers ({formatPercentage(topZipLevelData[topZipLevelData.RaceType])} of the health center population), as compared to the {lowerCaseRaceName(formatRaceNames(topMostRaceData.RaceType))} residents in Wayne County ({formatPercentage(topMostRaceData[topMostRaceData.RaceType])} of the health center population).</p>
            : <p>In {topMostRaceData.Year}, {lowerCaseRaceName(formatRaceNames(topMostRaceData.RaceType))} residents of Wayne County visited health centers more than any other reported race/ethnicity group that utilizes services offered by health centers ({formatPercentage(topMostRaceData[topMostRaceData.RaceType])} of the health center population). This is followed by {lowerCaseRaceName(formatRaceNames(topSecondRaceData.RaceType))} residents ({formatPercentage(topSecondRaceData[topSecondRaceData.RaceType])}) and then {lowerCaseRaceName(formatRaceNames(topThirdRaceData.RaceType))} residents ({formatPercentage(topThirdRaceData[topThirdRaceData.RaceType])}).</p>}

          <p> The following chart shows the health center visitors breakdown across all reported race/ethnicity groups in {isZipLevelDataAvailable ? topZipLevelData.Geography : "Wayne County"}.</p>

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ isZipLevelDataAvailable ? `/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Geography=${meta.id}&Year=all` : "/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Year=all" }
            title="Chart of Health Center Demographics" />

          {/* Draw a Pie chart to show data for health center data by race */}
          <Pie ref={comp => this.viz = comp } config={{
            data: isZipLevelDataAvailable ? `/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Geography=${meta.id}&Year=all` : "/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Year=all",
            groupBy: "RaceType",
            value: d => d[d.RaceType],
            label: d => d.RaceType.replace(" Health Center Patients", ""),
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
  fetchData("raceAndEthnicityData", "/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Year=latest"),
  fetchData("raceAndEthnicityZipLevelData", "/api/data?measures=Non-white Health Center Patients,Hispanic Health Center Patients,Black Health Center Patients,Asian Health Center Patients,American Indian/Alaska Native Health Center Patients&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  raceAndEthnicityData: state.data.raceAndEthnicityData,
  raceAndEthnicityZipLevelData: state.data.raceAndEthnicityZipLevelData
});

export default connect(mapStateToProps)(HealthCenterDemographics);

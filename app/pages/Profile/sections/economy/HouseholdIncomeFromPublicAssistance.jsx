import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const definitions = [
  {term: "Married-Couple Family", definition: " A family in which the householder and his or her spouse are listed as members of the same household."},
  {term: "Male Householder, No Wife Present", definition: "A family with a male householder and no spouse of householder present."},
  {term: "Female Householder, No Husband Present", definition: "A family with a female householder and no spouse of householder present."}
];

const formatHouseholdSnapData = householdSnapData => {
  // Find share for each data in householdSnapData.
  nest()
    .key(d => d.Year)
    .entries(householdSnapData)
    .forEach(group => {
      const total = sum(group.values, d => d["SNAP Receipts"]);
      group.values.forEach(d => total !== 0 ? d.share = d["SNAP Receipts"] / total * 100 : d.share = 0);
    });
  const filterSnapRecievedData = householdSnapData.filter(d => d["ID Snap Receipt"] === 0);
  nest()
    .key(d => d["ID Number of workers"])
    .entries(filterSnapRecievedData)
    .forEach(group => {
      const totalShare = sum(group.values, d => d.share);
      group.values.forEach(d => d.totalShare = totalShare);
    });
  const topRecentYearTotalShareData = filterSnapRecievedData.sort((a, b) => b.totalShare - a.totalShare)[0];
  const topRecentYearData = filterSnapRecievedData.filter(d => d.totalShare === topRecentYearTotalShareData.totalShare).sort((a, b) => b.share - a.share)[0];
  return [filterSnapRecievedData, topRecentYearData];
};

class HouseholdIncomeFromPublicAssistance extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      sources: []
    };
  }

  render() {

    const {meta, publicAssistanceData, householdSnapData} = this.props;

    const publicAssistanceDataAvailable = publicAssistanceData.length !== 0;
    const householdSnapDataAvailable = householdSnapData.length !== 0;

    // Format data for publicAssistanceData
    let topPublicAssistanceData;
    if (publicAssistanceDataAvailable) {
      // Format data for publicAssistanceData
      nest()
        .key(d => d.Year)
        .entries(publicAssistanceData)
        .forEach(group => {
          const total = sum(group.values, d => d["Food-Stamp Population"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Food-Stamp Population"] / total * 100 : d.share = 0);
        });
      topPublicAssistanceData = publicAssistanceData.filter(d => d["ID Public Assistance or Snap"] === 0).sort((a, b) => b.share - a.share)[0];
    }

    // Find share for each data in householdSnapData.
    let topRecentYearHouseholdSnapData;
    if (householdSnapDataAvailable) {
      topRecentYearHouseholdSnapData = formatHouseholdSnapData(householdSnapData)[1];
    }

    return (
      <SectionColumns>
        <SectionTitle>Household Income From Public Assistance</SectionTitle>
        <article>
          <Stat
            title={"Population With Cash Public Assistance Or Food Stamps/SNAP"}
            year={publicAssistanceDataAvailable ? topPublicAssistanceData.Year : ""}
            value={publicAssistanceDataAvailable ? `${formatPercentage(topPublicAssistanceData.share)}` : "N/A"}
            qualifier={publicAssistanceDataAvailable ? `of the population with food stamp in ${topPublicAssistanceData.Geography}` : "N/A"}
          />
          <Stat
            title={"most common number of workers per household on public assistance"}
            year={householdSnapDataAvailable ? topRecentYearHouseholdSnapData.Year : ""}
            value={householdSnapDataAvailable ? topRecentYearHouseholdSnapData["Number of workers"] : "N/A"}
            qualifier={householdSnapDataAvailable ? `(${formatPercentage(topRecentYearHouseholdSnapData.totalShare)} of the population in ${topRecentYearHouseholdSnapData.Geography})` : ""}
          />
          <p>
            {publicAssistanceDataAvailable ? <span>In {topPublicAssistanceData.Year}, {formatPercentage(topPublicAssistanceData.share)} of the population in {topPublicAssistanceData.Geography} got cash public assistance or food stamps.</span> : ""}
            {householdSnapDataAvailable ? <span>The most common number of workers per household on public assistance was {topRecentYearHouseholdSnapData["Number of workers"].toLowerCase()} ({formatPercentage(topRecentYearHouseholdSnapData.totalShare)} of the population in {topRecentYearHouseholdSnapData.Geography}).</span> : ""}
          </p>
          {householdSnapDataAvailable ? <p>The following chart shows the number of workers per household on public assistance.</p> : ""}
          
          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        {householdSnapDataAvailable
          ? <BarChart config={{
            data: `/api/data?measures=SNAP Receipts&drilldowns=Snap Receipt,Family type,Number of workers&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 400,
            stacked: true,
            legend: false,
            label: d => `${d["Family type"]}`,
            groupBy: d => `${d["Family type"]}`,
            x: d => d["Number of workers"],
            y: "share",
            time: "Year",
            xSort: (a, b) => a["ID Number of workers"] - b["ID Number of workers"],
            xConfig: {labelRotation: false},
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Share"
            },
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Workers", d => d["Number of workers"]], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return formatHouseholdSnapData(resp.data)[0];
          }}
          /> : null}
      </SectionColumns>
    );
  }
}

HouseholdIncomeFromPublicAssistance.defaultProps = {
  slug: "household-income-from-public-assistance"
};

HouseholdIncomeFromPublicAssistance.need = [
  fetchData("publicAssistanceData", "/api/data?measures=Food-Stamp Population&drilldowns=Public Assistance or Snap&Geography=<id>&Year=latest", d => d.data),
  fetchData("householdSnapData", "/api/data?measures=SNAP Receipts&drilldowns=Snap Receipt,Family type,Number of workers&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  publicAssistanceData: state.data.publicAssistanceData,
  householdSnapData: state.data.householdSnapData
});

export default connect(mapStateToProps)(HouseholdIncomeFromPublicAssistance);

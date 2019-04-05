import React from "react";
import {connect} from "react-redux";
import {format} from "d3-format";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const commas = format(",d");

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatPublicAssistanceData = publicAssistanceData => {
  // Format data for publicAssistanceData
  nest()
    .key(d => d.Year)
    .entries(publicAssistanceData)
    .forEach(group => {
      const total = sum(group.values, d => d["Food-Stamp Population"]);
      group.values.forEach(d => {
        if (total !== 0) {
          d.total = total; // save total to later calculate total population with stamps.
          d.share = d["Food-Stamp Population"] / total * 100;
        }
        else d.share = 0;
      });
    });
  const withCashFoodStamps = publicAssistanceData.filter(d => d["ID Public Assistance or Snap"] === 0);
  return withCashFoodStamps;
};

class FoodStamps extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      sources: [],
      snapWicData: this.props.snapWicData
    };
  }

  componentDidMount() {
    this.setState({sources: updateSource(this.state.snapWicData.source, this.state.sources)});
  }

  render() {

    const {meta, population, publicAssistanceData, snapWicData} = this.props;
    const isSnapWicDataAvailableForCurrentGeography = snapWicData.source[0].substitutions.length === 0;

    const publicAssistanceDataAvailable = publicAssistanceData.length !== 0;
    const topPublicAssistanceData = formatPublicAssistanceData(publicAssistanceData)[0];
    const currentYearPopulation = population.filter(d => d.Year === topPublicAssistanceData.Year)[0];
    const shareOfPopulationWithFoodStamps = formatPercentage(topPublicAssistanceData.total / currentYearPopulation.Population * 100);

    // Get latest year SNAP and WIC authorized stores data
    const snapWicArr = ["SNAP", "WIC"];
    const snapWicLatestData = snapWicArr.map(d => {
      const result = snapWicData.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue["Assistance Type"] !== null && currentValue["Assistance Type"] === d) {
          return currentValue;
        }
        return acc;
      }, null);
      return result;
    });

    // Get SNAP latest year data:
    const snapLatestYear = snapWicLatestData[0].Year;
    const snapLatestYearValue = snapWicLatestData[0]["Number of Nutrition Assistance Stores"];

    // Get WIC latest year data:
    const wicLatestYear = snapWicLatestData[1].Year;
    const wicLatestYearValue = snapWicLatestData[1]["Number of Nutrition Assistance Stores"];

    // Get county information for current location
    const county = snapWicData.data[0].Geography;

    return (
      <SectionColumns>
        <SectionTitle>Food Stamps</SectionTitle>
        <article>
          {isSnapWicDataAvailableForCurrentGeography ? <div></div> : <Disclaimer>snap and wic data is shown for {snapWicData.data[0].Geography}</Disclaimer>}
          <Stat
            title="SNAP-authorized stores"
            year={snapLatestYear}
            value={commas(snapLatestYearValue)}
            qualifier={`stores in ${county}`}
          />
          <Stat
            title="WIC-authorized stores"
            year={wicLatestYear}
            value={wicLatestYearValue}
            qualifier={`stores in ${county}`}
          />
          <Stat
            title="Population with food stamps"
            year={topPublicAssistanceData.Year}
            value={shareOfPopulationWithFoodStamps}
            qualifier={`of the population in ${meta.name}`}
          />
          <Stat
            title={"Population With Cash Public Assistance Or Food Stamps/SNAP"}
            year={publicAssistanceDataAvailable ? topPublicAssistanceData.Year : ""}
            value={publicAssistanceDataAvailable ? `${formatPercentage(topPublicAssistanceData.share)}` : "N/A"}
            qualifier={publicAssistanceDataAvailable ? `of the population with food stamps in ${meta.name}` : ""}
          />
          <p>The monthly average number of SNAP-authorized stores in {county} in {snapLatestYear} was {commas(snapLatestYearValue)} and there were {commas(wicLatestYearValue)} WIC-authorized stores in {wicLatestYear}.</p>
          <p>In {topPublicAssistanceData.Year}, {shareOfPopulationWithFoodStamps} of the population in {topPublicAssistanceData.Geography} had food stamps, out of which {formatPercentage(topPublicAssistanceData.share)} of the population were given food stamps in cash.</p>
          <p>The chart here shows the share of population who gets food stamps in cash out of the population with food stamps.</p>
          <Contact slug={this.props.slug} />
          <SourceGroup sources={this.state.sources} />
        </article>

        {publicAssistanceDataAvailable
          ? <LinePlot config={{
            data: `/api/data?measures=Food-Stamp Population&drilldowns=Public Assistance or Snap&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 400,
            groupBy: "Public Assistance or Snap",
            x: "Year",
            y: "share",
            yConfig: {
              tickFormat: d => `${formatPercentage(d)}`,
              title: "Share"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => `${formatPercentage(d.share)}`], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return formatPublicAssistanceData(resp.data);
          }}
          /> : null
        }
      </SectionColumns>
    );
  }
}

FoodStamps.defaultProps = {
  slug: "food-stamps"
};

FoodStamps.need = [
  fetchData("publicAssistanceData", "/api/data?measures=Food-Stamp Population&drilldowns=Public Assistance or Snap&Geography=<id>&Year=latest", d => d.data),
  fetchData("snapWicData", "/api/data?measures=Number of Nutrition Assistance Stores&drilldowns=Assistance Type&Geography=<id>&Year=all") // getting all year data since WIC and SNAP both have different latest years.
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  population: state.data.population.data,
  publicAssistanceData: state.data.publicAssistanceData,
  snapWicData: state.data.snapWicData
});

export default connect(mapStateToProps)(FoodStamps);

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
import StatGroup from "components/StatGroup";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

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

class PublicFoodAssistance extends SectionColumns {

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
    const shareOfPopulationWithFoodStamps = currentYearPopulation.Population !== 0 ? formatPercentage(topPublicAssistanceData.total / currentYearPopulation.Population * 100) : `${0}%`;

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
        <SectionTitle>Public Food Assistance</SectionTitle>
        <article>
          {!isSnapWicDataAvailableForCurrentGeography &&
            <Disclaimer>SNAP and WIC data is shown for {snapWicData.data[0].Geography}</Disclaimer>
          }
          <StatGroup
            title="authorized stores by program"
            stats={[
              {
                title: "SNAP",
                value: commas(snapLatestYearValue),
                qualifier: `stores in ${county}, ${snapLatestYear}`
              },
              {
                title: "WIC",
                value: wicLatestYearValue,
                qualifier: `stores in ${county}, ${wicLatestYear}`
              }
            ]}
          />
          <StatGroup
            title="population with public assistance"
            year={topPublicAssistanceData ? topPublicAssistanceData.Year : null}
            stats={[
              {
                title: "Food stamps",
                value: shareOfPopulationWithFoodStamps,
                qualifier: `of the population in ${meta.name}`
              },
              {
                title: "Cash assistance",
                value: publicAssistanceDataAvailable
                  ? `${formatPercentage(topPublicAssistanceData.share)}`
                  : null,
                qualifier: publicAssistanceDataAvailable
                  ? `of the population with food stamps in ${meta.name}`
                  : null
              }
            ]}
          />
          <p>The monthly average number of SNAP-authorized stores in {county} in {snapLatestYear} was {commas(snapLatestYearValue)}, and there were {commas(wicLatestYearValue)} WIC-authorized stores in {wicLatestYear}.</p>
          <p>In {topPublicAssistanceData.Year}, {shareOfPopulationWithFoodStamps} of the population in {topPublicAssistanceData.Geography} had food stamps, out of which {formatPercentage(topPublicAssistanceData.share)} of the population were given food stamps in cash.</p>
          <p>The chart here shows the share of the population who gets food stamps in cash out of the population with food stamps.</p>

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Food-Stamp Population&drilldowns=Public Assistance or Snap&Geography=${meta.id}&Year=all` }
            title="Chart of Food Stamps" />

          {publicAssistanceDataAvailable
            ? <LinePlot ref={comp => this.viz = comp } config={{
              data: `/api/data?measures=Food-Stamp Population&drilldowns=Public Assistance or Snap&Geography=${meta.id}&Year=all`,
              discrete: "x",
              height: 400,
              baseline: 0,
              groupBy: "Public Assistance or Snap",
              x: "Year",
              y: "share",
              yConfig: {
                tickFormat: d => `${formatPercentage(d)}`,
                title: "Share"
              },
              title: "Food Stamp Population Using Cash Assistance",
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => `${formatPercentage(d.share)}`], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatPublicAssistanceData(resp.data);
            }}
            /> : null
          }
        </div>
      </SectionColumns>
    );
  }
}

PublicFoodAssistance.defaultProps = {
  slug: "public-food-assistance"
};

PublicFoodAssistance.need = [
  fetchData("publicAssistanceData", "/api/data?measures=Food-Stamp Population&drilldowns=Public Assistance or Snap&Geography=<id>&Year=latest", d => d.data),
  fetchData("snapWicData", "/api/data?measures=Number of Nutrition Assistance Stores&drilldowns=Assistance Type&Geography=<id>&Year=all") // getting all year data since WIC and SNAP both have different latest years.
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  population: state.data.population.data,
  publicAssistanceData: state.data.publicAssistanceData,
  snapWicData: state.data.snapWicData
});

export default connect(mapStateToProps)(PublicFoodAssistance);

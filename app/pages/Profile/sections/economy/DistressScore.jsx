import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import styles from "style.yml";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import zipcodes from "utils/zipcodes";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const definitions = [
  {term: "The Distressed Communities Index (DCI) combines seven complementary economic indicators into a single holistic and comparative measure of community well-being. The seven component metrics of the DCI are", definition: ""},
  {term: "1. No high school diploma", definition: "Percent of the 25+ population without a high school diploma or equivalent."},
  {term: "2. Housing vacancy rate", definition: "Percent of habitable housing that is unoccupied, excluding properties that are for seasonal, recreational, or occasional use."},
  {term: "3. Adults not working", definition: "Percent of the prime-age population (25-64) not currently in work."},
  {term: "4. Poverty rate", definition: "Percent of the population living under the poverty line."},
  {term: "5. Median income ratio", definition: "Median household income as a percent of the state’s median household income (to account for cost of living differences across states)."},
  {term: "6. Change in employment", definition: "Percent change in the number of jobs."},
  {term: "7. Change in establishments", definition: "Percent change in the number of business establishments."}
];

const formatGeomapZipLabel = (d, meta, zipToPlace) => {
  const cityName = zipToPlace[d["ID Zip"]];
  return cityName === undefined ? d.Zip : `${d.Zip}, ${cityName}`;
};

class DistressScore extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {meta, distressScoreData, topStats} = this.props;
    const {zipToPlace} = topStats;

    distressScoreData.sort((a, b) => b["Distress Score"] - a["Distress Score"]);
    const topDistressScoreData = distressScoreData[0];

    return (
      <SectionColumns>
        <SectionTitle>Distress Score</SectionTitle>
        <article>
          <Disclaimer>Data is shown at the zip level</Disclaimer>
          <Stat
            title="Zip code with highest Distress Score"
            year={topDistressScoreData.Year}
            value={topDistressScoreData.Zip}
            qualifier={`(${formatAbbreviate(topDistressScoreData["Distress Score"])} percentile)`}
          />
          <p>In {topDistressScoreData.Year}, the highest distress score was observed in the zip code {topDistressScoreData.Zip} ({formatAbbreviate(topDistressScoreData["Distress Score"])}), 0 would be the least distressed (desired outcome), and 100 would be the most distressed (unfavorable outcome).</p>
          <p>The following map shows the distress score for each zip code in Wayne County.</p>

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ "/api/data?measures=Distress Score&drilldowns=Zip&Year=all" }
            title="Map of Distress Score" />

          {/* Draw Geomap to show distress scores for each zip code in the Wayne county. */}
          <Geomap ref={comp => this.viz = comp } config={{
            data: "/api/data?measures=Distress Score&drilldowns=Zip&Year=all",
            groupBy: "Zip",
            label: d => formatGeomapZipLabel(d, meta, zipToPlace),
            colorScale: "Distress Score",
            colorScaleConfig: {
              // having a high distress score is bad
              color: [
                styles.success,
                styles["shamrock-white"],
                styles["terra-cotta-white"],
                styles["danger-light"],
                styles["terra-cotta-medium"],
                styles["danger-dark"]
              ],
              // format geomap legend range
              axisConfig: {tickFormat: d => `${formatAbbreviate(d)}%`}
            },
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Distress Score", d => `${formatAbbreviate(d["Distress Score"])}`]]},
            topojson: "/topojson/zipcodes.json",
            topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
            topojsonId: d => d.properties.ZCTA5CE10
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return resp.data;
          }}
          />
        </div>
      </SectionColumns>
    );
  }
}

DistressScore.defaultProps = {
  slug: "distress-score"
};

DistressScore.need = [
  fetchData("distressScoreData", "/api/data?measures=Distress Score&drilldowns=Zip&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  distressScoreData: state.data.distressScoreData
});

export default connect(mapStateToProps)(DistressScore);

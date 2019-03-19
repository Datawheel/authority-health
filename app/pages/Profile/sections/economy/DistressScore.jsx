import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import Stat from "components/Stat";
import zipcodes from "utils/zipcodes";

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

class DistressScore extends SectionColumns {

  render() {

    const {distressScoreData} = this.props;

    distressScoreData.sort((a, b) => b["Distress Score"] - a["Distress Score"]);
    const topDistressScoreData = distressScoreData[0];

    return (
      <SectionColumns>
        <SectionTitle>Distress Score</SectionTitle>
        <article>
          <Stat
            title="Zip code with highest Distress Score"
            year={topDistressScoreData.Year}
            value={topDistressScoreData.Zip}
            qualifier={`(${formatAbbreviate(topDistressScoreData["Distress Score"])} percentile)`}
          />
          <p>In {topDistressScoreData.Year}, the maximum distress score was observed in the zip code {topDistressScoreData.Zip} with {formatAbbreviate(topDistressScoreData["Distress Score"])} percentile with 0 percentile being least distressed (desired outcome) and 100 percentile being most distressed (unfavorable outcome).</p>
          <p>The following map shows the distress score percentile for each zip code in Wayne County.</p>
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        {/* Draw Geomap to show distress scores for each zip code in the Wayne county. */}
        <Geomap config={{
          data: "/api/data?measures=Distress Score&drilldowns=Zip&Year=all",
          groupBy: "ID Zip",
          colorScale: "Distress Score",
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Distress Score", d => `${formatAbbreviate(d["Distress Score"])} percentile`]]},
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
          topojsonId: d => d.properties.ZCTA5CE10
        }}
        dataFormat={resp => resp.data}
        />
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
  distressScoreData: state.data.distressScoreData
});

export default connect(mapStateToProps)(DistressScore);

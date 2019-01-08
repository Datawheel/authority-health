import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import zipcodes from "../../../../utils/zipcodes";

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
            value={topDistressScoreData["Zip"]}
            qualifier={`${formatAbbreviate(topDistressScoreData["Distress Score"])} percentile`}
          />
          <p>The maximum distress score was observed in the zip code {topDistressScoreData["Zip"]} with {formatAbbreviate(topDistressScoreData["Distress Score"])} percentile in the year {topDistressScoreData.Year}.</p>
          <p>The following map shows the distress score percentile for each zip code in Wayne County, MI.</p>
        </article>

        {/* Draw Geomap to show distress scores for each zip code in the Wayne county. */}
        <Geomap config={{
          data: distressScoreData,
          groupBy: "ID Zip",
          colorScale: "Distress Score",
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Distress Score", d => `${formatAbbreviate(d["Distress Score"])} percentile`]]},
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
          topojsonId: d => d.properties.ZCTA5CE10
        }}
        />
      </SectionColumns>
    );
  }
}

DistressScore.defaultProps = {
  slug: "distress-score"
};

DistressScore.need = [
  fetchData("distressScoreData", "/api/data?measures=Distress Score&drilldowns=Zip&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  distressScoreData: state.data.distressScoreData
});

export default connect(mapStateToProps)(DistressScore);

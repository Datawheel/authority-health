import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
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
            title={`Top Distress Score in ${topDistressScoreData.Year}`}
            value={`${topDistressScoreData["Zip Code"]} ${formatAbbreviate(topDistressScoreData["Distress Score"])} Percentile`}
          />
          <p>The Geomap here shows the Distress Score percentile for each Zip code region in the Wayne County, MI.</p>
          <p>The maximum Distress Score was observed in the zip code {topDistressScoreData["Zip Code"]} with {formatAbbreviate(topDistressScoreData["Distress Score"])} Percentile in the year {topDistressScoreData.Year}.</p>
        </article>

        {/* Draw Geomap to show distress scores for each zip code in the Wayne county. */}
        <Geomap config={{
          data: distressScoreData,
          groupBy: "ID Zip Code",
          colorScale: "Distress Score",
          height: 400,
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d["Distress Score"])]]},
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
  fetchData("distressScoreData", "/api/data?measures=Distress%20Score&drilldowns=Zip%20Code&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  distressScoreData: state.data.distressScoreData
});

export default connect(mapStateToProps)(DistressScore);


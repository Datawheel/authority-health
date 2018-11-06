import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";
import zipcodes from "../../../../utils/zipcodes";

class DistressScore extends SectionColumns {

  render() {

    const {distressScoreData} = this.props;
    console.log("distressScoreData: ", distressScoreData);

    return (
      <SectionColumns>
        <SectionTitle>Distress Score</SectionTitle>
        <article>
        </article>
        {/* Draw Geomap to show distress score for each zip code in the Wayne county */}
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


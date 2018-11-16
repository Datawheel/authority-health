import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

const formatData = d => {
  if (d === "unavailable") return 0;
  if (d === "normal") return 1;
  if (d === "excessive") return 2;
  return -1;
};

class WaterQuality extends SectionColumns {

  render() {

    const {waterQualityData} = this.props;
    // console.log("waterQualityData: ", waterQualityData);



    return (
      <SectionColumns>
        <SectionTitle>Water Quality</SectionTitle>
        <article>
        </article>

        {/* Geomap to show Lead and Mercury level in water for all tracts in the Wayne County. */}
        <Geomap config={{
          data: waterQualityData.data,
          groupBy: "ID Tract",
          colorScale: d => formatData(d["Lead Level"]),
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Value", d => d["Lead Level"]]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        />
      </SectionColumns>
    );
  }
}

WaterQuality.defaultProps = {
  slug: "water-quality"
};

WaterQuality.need = [
  fetchData("waterQualityData", "/api/data?measures=Lead%20Level,Mercury%20Level&drilldowns=Tract&Year=all")
];

const mapStateToProps = state => ({
  waterQualityData: state.data.waterQualityData
});

export default connect(mapStateToProps)(WaterQuality);

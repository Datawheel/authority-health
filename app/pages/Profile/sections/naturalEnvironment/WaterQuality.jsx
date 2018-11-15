import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class WaterQuality extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Water Quality</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

WaterQuality.defaultProps = {
  slug: "water-quality"
};

export default WaterQuality;

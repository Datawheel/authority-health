import React from "react";
// import {connect} from "react-redux";
// import {Geomap} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class DistressScore extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Distress Score</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

DistressScore.defaultProps = {
  slug: "distress-score"
};

export default DistressScore;

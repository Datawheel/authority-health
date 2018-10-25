import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class VisionDifficulty extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Vision Difficulty</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

VisionDifficulty.defaultProps = {
  slug: "vision-difficulty"
};

export default VisionDifficulty;

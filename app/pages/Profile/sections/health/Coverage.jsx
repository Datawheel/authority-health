import React from "react";
// import {connect} from "react-redux";
// import {Treemap} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class Coverage extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Coverage</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Coverage.defaultProps = {
  slug: "coverage"
};

export default Coverage;

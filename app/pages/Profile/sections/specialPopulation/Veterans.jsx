import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class Veterans extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Veterans</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Veterans.defaultProps = {
  slug: "veterans"
};

export default Veterans;

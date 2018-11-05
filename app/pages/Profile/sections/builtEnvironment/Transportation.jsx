import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class Transportation extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Transportation</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Transportation.defaultProps = {
  slug: "transportation"
};

export default Transportation;

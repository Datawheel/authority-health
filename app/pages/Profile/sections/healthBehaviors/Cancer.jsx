import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

class Cancer extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Cancer</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Cancer.defaultProps = {
  slug: "cancer"
};

export default Cancer;

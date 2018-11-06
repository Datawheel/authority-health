import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class Crime extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Crime</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Crime.defaultProps = {
  slug: "crime"
};

export default Crime;

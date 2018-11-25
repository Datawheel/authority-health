import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class Homeless extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Homeless</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Homeless.defaultProps = {
  slug: "homeless"
};

export default Homeless;

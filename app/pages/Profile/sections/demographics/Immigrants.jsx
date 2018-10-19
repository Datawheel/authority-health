import React from "react";
// import {connect} from "react-redux";
// import {Geomap} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class Immigrants extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Child Care</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Immigrants.defaultProps = {
  slug: "child-care"
};

export default Immigrants;

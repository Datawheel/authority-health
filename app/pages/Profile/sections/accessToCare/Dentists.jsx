import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class Dentists extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Dentists</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Dentists.defaultProps = {
  slug: "dentists"
};

export default Dentists;

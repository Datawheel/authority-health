import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class HealthCenters extends SectionColumns {

  render() {

    return (
      <SectionColumns>
        <SectionTitle>Health Centers</SectionTitle>
        <article>

        </article>
      </SectionColumns>
    );

  }
}

HealthCenters.defaultProps = {
  slug: "health-centers"
};
  
export default HealthCenters;

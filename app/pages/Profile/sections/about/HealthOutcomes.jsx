import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

class HealthOutcomes extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Health Outcomes</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

HealthOutcomes.defaultProps = {
  slug: "health-outcomes"
};

export default HealthOutcomes;

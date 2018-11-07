import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class WageDistribution extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Wage Distribution</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

WageDistribution.defaultProps = {
  slug: "wage-distribution"
};

export default WageDistribution;

import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

class ConsumerPriceIndex extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Consumer Price Index</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

ConsumerPriceIndex.defaultProps = {
  slug: "consumer-price-index"
};

export default ConsumerPriceIndex;

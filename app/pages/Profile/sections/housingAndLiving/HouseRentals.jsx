import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class HouseRentals extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>House Rentals</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

HouseRentals.defaultProps = {
  slug: "house-rentals"
};

export default HouseRentals;

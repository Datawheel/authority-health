import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class DomesticPartners extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Domestic Partners</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

DomesticPartners.defaultProps = {
  slug: "domestic-partners"
};

export default DomesticPartners;

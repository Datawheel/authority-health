import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class ReadingAssessment extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Reading Assessment</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

ReadingAssessment.defaultProps = {
  slug: "reading-assessment"
};

export default ReadingAssessment;

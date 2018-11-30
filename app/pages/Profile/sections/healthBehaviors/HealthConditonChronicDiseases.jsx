import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class HealthConditonChronicDiseases extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Health Conditon/Chronic Diseases</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

HealthConditonChronicDiseases.defaultProps = {
  slug: "health-conditon-chronic-diseases"
};

export default HealthConditonChronicDiseases;

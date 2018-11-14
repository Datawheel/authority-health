import React from "react";
import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class Incarceration extends SectionColumns {

  render() {
    const {incarcerationData} = this.props;
    console.log("incarcerationData: ", incarcerationData);

    return (
      <SectionColumns>
        <SectionTitle>Incarceration</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Incarceration.defaultProps = {
  slug: "incarceration"
};

Incarceration.need = [
  fetchData("incarcerationData", "/api/data?measures=Total,Prison,Jail,Jail%2FProbation,Probation,Other&drilldowns=Offense&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  incarcerationData: state.data.incarcerationData
});

export default connect(mapStateToProps)(Incarceration);

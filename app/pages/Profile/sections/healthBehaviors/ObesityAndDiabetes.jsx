import React from "react";
import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

class ObesityAndDiabetes extends SectionColumns {

  render() {

    const {obesityDataValue} = this.props;
    console.log("obesityDataValue: ", obesityDataValue);

    return (
      <SectionColumns>
        <SectionTitle>Obesity and Diabetes</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

ObesityAndDiabetes.defaultProps = {
  slug: "obesity-and-diabetes"
};

ObesityAndDiabetes.need = [
  fetchData("obesityDataValue", "/api/data?measures=Obesity%20Data%20Value&drilldowns=Tract&Year=all")
];

const mapStateToProps = state => ({
  obesityDataValue: state.data.obesityDataValue
});

export default connect(mapStateToProps)(ObesityAndDiabetes);


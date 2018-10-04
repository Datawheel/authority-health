import React from "react";
import {connect} from "react-redux";
// import {Treemap} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class DrugUse extends SectionColumns {


  render() {

    console.log("this.props.smokingDrinkingData: ", this.props.smokingDrinkingData);

    return (
      <SectionColumns>
        <SectionTitle>Drug Use</SectionTitle>
        <article>

        </article>

      </SectionColumns>
    );
  }
}

DrugUse.defaultProps = {
  slug: "drug-use"
};

DrugUse.need = [
  fetchData("smokingDrinkingData", "/api/data?measures=Current%20Smoking%20Data%20Value,Binge%20Drinking%20Data%20Value&City=16000US2621000&Year=all")
];
  
const mapStateToProps = state => ({
  smokingDrinkingData: state.data.smokingDrinkingData
});
  
export default connect(mapStateToProps)(DrugUse);


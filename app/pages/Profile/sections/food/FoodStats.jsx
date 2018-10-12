import React from "react";
import {connect} from "react-redux";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class FoodStats extends SectionColumns {

  render() {
    const {childAdultInsecurityRate} = this.props;

    return (
      <SectionColumns>
        <Stat
          title={"Child Insecurity"}
          value={`${formatAbbreviate(childAdultInsecurityRate.data[0]["Child Food Insecurity Rate"])}%`}
        />
        <Stat
          title={"Adult Insecurity"}
          value={`${formatAbbreviate(childAdultInsecurityRate.data[0]["Adult Food Insecurity Rate"])}%`}
        />
      </SectionColumns>
    );
  }
}

FoodStats.need = [
  fetchData("childAdultInsecurityRate", "/api/data?measures=Adult%20Food%20Insecurity%20Rate,Child%20Food%20Insecurity%20Rate&County=<id>&Year=latest")
];
  
const mapStateToProps = state => ({
  childAdultInsecurityRate: state.data.childAdultInsecurityRate
});
  
export default connect(mapStateToProps)(FoodStats);

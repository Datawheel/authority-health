import React from "react";
import {connect} from "react-redux";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class FoodStats extends SectionColumns {

  render() {
    const {childAdultInsecurityRate} = this.props;

    const childAdultInsecurityData = childAdultInsecurityRate.source[0].measures.map(d => {
      const result = childAdultInsecurityRate.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue[d] !== null) {
          return Object.assign({}, currentValue, {AgeType: d});
        }
        return acc;
      }, null);
      return result;
    });

    return (
      <SectionColumns>
        <Stat
          title={"Child Insecurity"}
          value={`${formatAbbreviate(childAdultInsecurityData[1][childAdultInsecurityData[1].AgeType])}%`}
        />
        <Stat
          title={"Adult Insecurity"}
          value={`${formatAbbreviate(childAdultInsecurityData[0][childAdultInsecurityData[0].AgeType])}%`}
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

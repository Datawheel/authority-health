import React from "react";
import {connect} from "react-redux";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class FoodStats extends SectionColumns {

  render() {
    // const {childAdultInsecurityRate} = this.props;
    // console.log("childAdultInsecurityRate: ", childAdultInsecurityRate);
    console.log("this.props: ", this.props);

    return (
      <SectionColumns>
        <Stat
        // title={`Access in ${currentRaceAndAgeData.County} County`}
        // value={`${formatAbbreviate(currentRaceAndAgeData[this.state.dropdownValue])}%`}
        />
      </SectionColumns>
    );
  }
}

FoodStats.need = [
  fetchData("childAdultInsecurityRate", "/api/data?measures=Adult%20Food%20Insecurity%20Rate,Child%20Food%20Insecurity%20Rate&County=05000US26163&Year=latest")
//   fetchData("abc", "/api/data?measures=SNAP-authorized%20stores,WIC-authorized%20stores&County=<id>&Year=all")
];
  
const mapStateToProps = state => ({
//   abc: state.data
  childAdultInsecurityRate: state.data
});
  
export default connect(mapStateToProps)(FoodStats);

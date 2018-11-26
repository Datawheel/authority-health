import React from "react";
import {connect} from "react-redux";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class Insecurity extends SectionColumns {

  render() {
    const {insecurityRate} = this.props;

    return (
      <SectionColumns>
        <SectionTitle>Insecurity</SectionTitle>
        <Stat
          title={"Child Insecurity"}
          value={`${insecurityRate[0]["Food Insecurity Rate"]}%`}
        />
        <Stat
          title={"Adult Insecurity"}
          value={`${insecurityRate[1]["Food Insecurity Rate"] - insecurityRate[0]["Food Insecurity Rate"]}%`}
        />
      </SectionColumns>
    );
  }
}

Insecurity.need = [
  fetchData("insecurityRate", "/api/data?measures=Food%20Insecurity%20Rate&drilldowns=Category&County=<id>&Year=latest", d => d.data)
];
  
const mapStateToProps = state => ({
  insecurityRate: state.data.insecurityRate
});
  
export default connect(mapStateToProps)(Insecurity);

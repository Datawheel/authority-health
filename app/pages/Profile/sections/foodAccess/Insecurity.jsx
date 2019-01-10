import React from "react";
import {connect} from "react-redux";

import {fetchData, SectionColumns} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

class Insecurity extends SectionColumns {

  render() {
    const {insecurityRate} = this.props;
    const isInsecurityRateDataAvailableForCurrentGeography = insecurityRate.source[0].substitutions.length === 0;
    const childInsecurity = insecurityRate.data[0];
    const adultInsecurity = insecurityRate.data[1];

    return (
      <div className="section-title-stat-inner">
        <SectionColumns>
          <article>
            {isInsecurityRateDataAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">Showing data for {insecurityRate.data[0].Geography}.</div>}
            <Stat
              title={"Child Insecurity"}
              year={childInsecurity.Year}
              value={`${childInsecurity["Food Insecurity Rate"]}%`}
            />
            <Stat
              title={"Adult Insecurity"}
              year={adultInsecurity.Year}
              value={`${adultInsecurity["Food Insecurity Rate"] - childInsecurity["Food Insecurity Rate"]}%`}
            />
          </article>
        </SectionColumns>
      </div>
    );
  }
}

Insecurity.need = [
  fetchData("insecurityRate", "/api/data?measures=Food Insecurity Rate&drilldowns=Category&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  insecurityRate: state.data.insecurityRate
});

export default connect(mapStateToProps)(Insecurity);

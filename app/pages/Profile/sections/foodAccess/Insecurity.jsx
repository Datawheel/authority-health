import React from "react";
import {connect} from "react-redux";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import Stat from "components/Stat";

class Insecurity extends SectionColumns {

  render() {
    const {insecurityRate} = this.props;
    const isInsecurityRateDataAvailableForCurrentGeography = insecurityRate.source[0].substitutions.length === 0;
    const childInsecurity = insecurityRate.data[0];
    const adultInsecurity = insecurityRate.data[1];
    const adultInsecurityRate = adultInsecurity["Food Insecurity Rate"] - childInsecurity["Food Insecurity Rate"];

    return (
      <div className="section-title-stat-inner">
        <SectionColumns>
          <SectionTitle>Insecurity</SectionTitle>
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
              value={`${adultInsecurityRate}%`}
            />
            <p>Food insecurity refers to <a href="https://www.ers.usda.gov/topics/food-nutrition-assistance/food-security-in-the-us.aspx">USDA’s measure</a> of lack of access, at times, to enough food for an active, healthy life for all household members and limited or uncertain availability of nutritionally adequate foods.</p>
            <p>In {childInsecurity.Year}, the food insecurity rate was {childInsecurity["Food Insecurity Rate"]}% of all children and {adultInsecurityRate}% of all adults in {childInsecurity.Geography}.</p>
          </article>
          <div></div> {/* // adds empty div to for alignment of above text */}
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

import React from "react";
import {connect} from "react-redux";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

class FoodInsecurity extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      sources: [],
      insecurityRate: this.props.insecurityRate
    };
  }

  componentDidMount() {
    this.setState({sources: updateSource(this.state.insecurityRate.source, this.state.sources)});
  }

  render() {
    const {insecurityRate} = this.props;
    const isInsecurityRateDataAvailableForCurrentGeography = insecurityRate.source[0].substitutions.length === 0;
    const childInsecurity = insecurityRate.data[0];
    const adultInsecurity = insecurityRate.data[1];
    const location = insecurityRate.data[0].Geography;
    const adultInsecurityRate = adultInsecurity["Food Insecurity Rate"] - childInsecurity["Food Insecurity Rate"];

    return (
      <div className="section-title-stat-inner">
        <SectionColumns>
          <SectionTitle>Food Insecurity</SectionTitle>
          <article>
            <Stat
              title={"Child Insecurity"}
              year={childInsecurity.Year}
              value={`${childInsecurity["Food Insecurity Rate"]}%`}
              qualifier={`of the children in ${location}`}
            />
            <p>In {childInsecurity.Year}, {childInsecurity["Food Insecurity Rate"]}% of the children and {adultInsecurityRate}% of the adults in {location} had food insecurity.</p>
            <p>Food insecurity refers to <a href="https://www.ers.usda.gov/topics/food-nutrition-assistance/food-security-in-the-us.aspx">USDA’s measure</a> of lack of access, at times, to enough food for an active, healthy life for all household members and limited or uncertain availability of nutritionally adequate foods.</p>

            {!isInsecurityRateDataAvailableForCurrentGeography &&
              <Disclaimer>Data is shown for {location}</Disclaimer>
            }
            <SourceGroup sources={this.state.sources} />
          </article>
          <Stat
            title={"Adult Insecurity"}
            year={adultInsecurity.Year}
            value={`${adultInsecurityRate}%`}
            qualifier={`of the adults in ${location}`}
          />

          {/* added empty div for proper alignment of above text  */}
          <div></div>
        </SectionColumns>
      </div>
    );
  }
}

FoodInsecurity.defaultProps = {
  slug: "food-insecurity"
};

FoodInsecurity.need = [
  fetchData("insecurityRate", "/api/data?measures=Food Insecurity Rate&drilldowns=Category&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  insecurityRate: state.data.insecurityRate
});

export default connect(mapStateToProps)(FoodInsecurity);

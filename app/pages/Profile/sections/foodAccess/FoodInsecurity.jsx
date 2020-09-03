import React from "react";
import {connect} from "react-redux";
import {formatAbbreviate} from "d3plus-format";
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

    // Find adult insecurity with the help of following calculations:
    // subtract child insecure population from overall insecure population to get adult insecure population (280,290)
    // subtract child total population from overall total population to get adult total population (1,340,199)
    // adult insecure rate = adult insecure population / adult total population * 100 (280,290 /1,340,199 * 100 = 20.91%)
    const adultInsecurePopulation = insecurityRate.data[1]["Estimated Food Insecure Population"] - insecurityRate.data[0]["Estimated Food Insecure Population"];
    const adultTotalPopulation = insecurityRate.data[1].Population - insecurityRate.data[0].Population;

    const adultInsecurityRate = formatAbbreviate(adultInsecurePopulation / adultTotalPopulation * 100);
    const adultInsecurity = insecurityRate.data[1];

    const location = insecurityRate.data[0].Geography;

    return (
      <div className="section-title-stat-inner">
        <section className="section">
          <SectionTitle>Food Insecurity</SectionTitle>
          <article>
            {!isInsecurityRateDataAvailableForCurrentGeography &&
              <Disclaimer>Data is only available for {location}</Disclaimer>
            }
            <Stat
              title={"Child Insecurity"}
              year={childInsecurity.Year}
              value={`${childInsecurity["Food Insecurity Rate"]}%`}
              qualifier={`of the children under 18 in ${location}`}
            />
            <Stat
              title={"Adult Insecurity"}
              year={adultInsecurity.Year}
              value={`${adultInsecurityRate}%`}
              qualifier={`of the adults in ${location}`}
            />
            <p>In {childInsecurity.Year}, {childInsecurity["Food Insecurity Rate"]}% of the children under 18 and {adultInsecurityRate}% of the adults in {location} had food insecurity.</p>
            <p>Food security means access by all people at all times to enough food for an active, healthy life. More information about food security can be found on the <a href="https://www.ers.usda.gov/topics/food-nutrition-assistance/food-security-in-the-us.aspx">USDA’s website</a>.</p>
            <SourceGroup sources={this.state.sources} />
          </article>
        </section>
      </div>
    );
  }
}

FoodInsecurity.defaultProps = {
  slug: "food-insecurity"
};

FoodInsecurity.need = [
  fetchData("insecurityRate", "/api/data?measures=Food Insecurity Rate,Population,Estimated Food Insecure Population&drilldowns=Category&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  insecurityRate: state.data.insecurityRate
});

export default connect(mapStateToProps)(FoodInsecurity);

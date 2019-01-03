import React from "react";
import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

class EmploymentGrowth extends SectionColumns {

  render() {

    const {percentChangeInEmploymemt} = this.props;
    console.log("percentChangeInEmploymemt: ", percentChangeInEmploymemt);

    return (
      <SectionColumns>
        <SectionTitle>Employment Growth</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

EmploymentGrowth.defaultProps = {
  slug: "employment-growth"
};

EmploymentGrowth.need = [
  fetchData("percentChangeInEmploymemt", "/api/data?measures=Percent Change in Employment&drilldowns=Zip Code&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  percentChangeInEmploymemt: state.data.percentChangeInEmploymemt
});

export default connect(mapStateToProps)(EmploymentGrowth);

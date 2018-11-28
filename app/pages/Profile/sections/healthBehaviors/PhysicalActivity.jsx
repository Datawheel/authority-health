import React from "react";
import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class PhysicalActivity extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Physical Activity</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

PhysicalActivity.defaultProps = {
  slug: "physical-activity"
};


PhysicalActivity.need = [
  fetchData("physicalActivity", "/api/data?measures=Physical%20Health%20Data%20Value,Physical%20Inactivity%20Data%20Value&drilldowns=Tract&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  occupancyData: state.data.occupancyData
});

export default connect(mapStateToProps)(PhysicalActivity);

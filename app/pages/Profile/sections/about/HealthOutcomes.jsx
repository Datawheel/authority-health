import React from "react";
import {connect} from "react-redux";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

class HealthOutcomes extends SectionColumns {

  render() {
    const {topHealthStats} = this.props;

    return (
      <SectionColumns>
        <SectionTitle>Health Outcomes</SectionTitle>
        <article>
          {topHealthStats.map(item => 
            <Stat key={item.measure}
              title={item.measure}
              year={item.latestYear}
              value={item.value}
            />
          )}
        </article>
      </SectionColumns>
    );
  }
}

HealthOutcomes.defaultProps = {
  slug: "health-outcomes"
};

HealthOutcomes.need = [
  fetchData("topHealthStats", "/api/stats/<id>", d => d.healthTopics)
];

const mapStateToProps = state => ({
  topHealthStats: state.data.topHealthStats
});

export default connect(mapStateToProps)(HealthOutcomes);

import React from "react";
import {connect} from "react-redux";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import Stat from "../../../../components/Stat";


class SocioeconomicOutcomes extends SectionColumns {

  render() {
    const {topSocialDeterminants} = this.props;

    return (
      <SectionColumns>
        <SectionTitle>Socioeconomic Outcomes</SectionTitle>
        <article>
          {topSocialDeterminants.map(item => 
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

SocioeconomicOutcomes.defaultProps = {
  slug: "socioeconomic-outcomes"
};

SocioeconomicOutcomes.need = [
  fetchData("topSocialDeterminants", "/api/stats/<id>", d => d.socialDeterminants)
];

const mapStateToProps = state => ({
  topSocialDeterminants: state.data.topSocialDeterminants
});

export default connect(mapStateToProps)(SocioeconomicOutcomes);

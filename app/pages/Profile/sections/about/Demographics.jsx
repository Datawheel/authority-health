import React from "react";
import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

class Demographics extends SectionColumns {

  render() {
    const {population} = this.props;
    console.log("population: ", population);

    return (
      <SectionColumns>
        <SectionTitle>Demographics</SectionTitle>
        <article>
        </article>
      </SectionColumns>
    );
  }
}

Demographics.defaultProps = {
  slug: "demographics"
};

Demographics.need = [
  fetchData("population", "https://niagara.datausa.io/api/data?measures=Population&Geography=<id>&year=all")
];

const mapStateToProps = state => ({
  population: state.data.population
});

export default connect(mapStateToProps)(Demographics);

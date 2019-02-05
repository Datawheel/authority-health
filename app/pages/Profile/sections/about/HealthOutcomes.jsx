import React from "react";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const findMaxYearData = data => {
  let maxYear = data[0].years;
  let maxData = data[0];
  data.forEach(d => {
    if (data.years > maxYear) {
      maxYear = d.years;
      maxData = d;
    }
  });
  return maxData;
};

class HealthOutcomes extends SectionColumns {

  render() {
    const {meta, topHealthStats} = this.props;

    const maxYearData = findMaxYearData(topHealthStats);

    const statsData = topHealthStats.filter(d => d.measure !== maxYearData.measure);

    const geoId = meta.id;

    return (
      <SectionColumns>
        <SectionTitle>Health Outcomes</SectionTitle>
        <article>
          <Stat
            title={statsData[0].measure}
            year={statsData[0].latestYear}
            value={statsData[0].value}
          />
          <Stat
            title={statsData[1].measure}
            year={statsData[1].latestYear}
            value={statsData[1].value}
          />
        </article>

        <LinePlot config={{ 
          data: `/api/data?measures=${maxYearData.measure}&Geography=${geoId}&Year=all`,
          discrete: "x",
          height: 200,
          groupBy: "Geography",
          x: maxYearData.yearDimension ? "End Year" : "Year",
          y: maxYearData.measure,
          yConfig: {
            title: maxYearData.measure
          },
          tooltipConfig: {tbody: [["Year", d => maxYearData.yearDimension ? d["End Year"] : d.Year], ["Share", d => d[maxYearData.measure]]]}
        }}
        dataFormat={resp => resp.data}
        />
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
  meta: state.data.meta,
  topHealthStats: state.data.topHealthStats
});

export default connect(mapStateToProps)(HealthOutcomes);

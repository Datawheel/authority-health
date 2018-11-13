import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
import places from "../../../../utils/places";

class WageDistribution extends SectionColumns {

  render() {

    const {wageDistributionData} = this.props;

    // wageDistributionData has data for places all over in USA. Filter data for the places in the Wayne county.
    const wageDistributionInWayneCounty = wageDistributionData.filter(d => places.includes(d["ID Place"]));

    // Find the top data for the most recent year.
    const recentYearWageDistribution = {};
    nest()
      .key(d => d.Year)
      .entries(wageDistributionInWayneCounty)
      .forEach(group => {
        group.key >= wageDistributionInWayneCounty[0].Year ? Object.assign(recentYearWageDistribution, group) : {};
      });
    recentYearWageDistribution.values.sort((a, b) => b["Wage GINI"] - a["Wage GINI"]);
    const topWageDistribution = recentYearWageDistribution.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Wage Distribution</SectionTitle>
        <article>
          {/* Top stats and short paragraph about Wage distribution. */}
          <Stat
            title={`Top Wage Dsitribution in ${topWageDistribution.Year}`}
            value={`${topWageDistribution.Place} ${formatAbbreviate(topWageDistribution["Wage GINI"])}`}
          />
          <p>The Geomap here shows the Wage distribution across the cities in the Wayne county.</p>
          <p>In {topWageDistribution.Year}, {topWageDistribution.Place} had the top Wage Distribution of {formatAbbreviate(topWageDistribution["Wage GINI"])}.</p>
        </article>

        {/* Draw Geomap to show wage distribution for each place in the Wayne county. */}
        <Geomap config={{
          data: wageDistributionInWayneCounty,
          groupBy: "ID Place",
          colorScale: "Wage GINI",
          time: "Year",
          label: d => d.Place,
          height: 400,
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d["Wage GINI"])]]},
          topojson: "/topojson/place.json",
          topojsonFilter: d => places.includes(d.id)
        }}
        />
      </SectionColumns>
    );
  }
}

WageDistribution.defaultProps = {
  slug: "wage-distribution"
};

WageDistribution.need = [
  fetchData("wageDistributionData", "https://joshua-tree.datausa.io/api/data?measures=Wage%20GINI&drilldowns=Place&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  wageDistributionData: state.data.wageDistributionData
});

export default connect(mapStateToProps)(WageDistribution);

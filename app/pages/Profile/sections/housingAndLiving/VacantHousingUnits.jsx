import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";
const formatPopulation = d => `${formatAbbreviate(d)}%`;

class VacantHousingUnits extends SectionColumns {

  render() {

    const {occupancyData} = this.props;
    console.log("occupancyData: ", occupancyData);

    // Get the health center data for latest year.
    const recentYearOccupancyData = {};
    nest()
      .key(d => d.Year)
      .entries(occupancyData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= occupancyData[0].Year ? Object.assign(recentYearOccupancyData, group) : {};
      });

    return (
      <SectionColumns>
        <SectionTitle>Vacant Housing Units</SectionTitle>
        <article>
        </article>
        <LinePlot config={{
          data: occupancyData,
          discrete: "x",
          height: 400,
          groupBy: "Occupancy Status",
          x: "Year",
          xConfig: {
            title: "Year"
          },
          y: "share",
          yConfig: {
            tickFormat: d => formatPopulation(d),
            title: "Population"
          },
          tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

VacantHousingUnits.defaultProps = {
  slug: "vacant-housing-units"
};


VacantHousingUnits.need = [
  fetchData("occupancyData", "/api/data?measures=Population&drilldowns=Occupancy%20Status&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  occupancyData: state.data.occupancyData
});

export default connect(mapStateToProps)(VacantHousingUnits);

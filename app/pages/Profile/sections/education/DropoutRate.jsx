import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import zipcodes from "../../../../utils/zipcodes";

const formatPercentage = d => `${formatAbbreviate(d * 100)}%`;

class DropoutRate extends SectionColumns {

  render() {

    const {highSchoolDropoutRate} =  this.props;

    // Find top High School DropoutRate for the recent year.
    highSchoolDropoutRate.sort((a, b) => b["High School Dropout Rate"] - a["High School Dropout Rate"]);
    const topDropoutRate = highSchoolDropoutRate[0];

    return (
      <SectionColumns>
        <SectionTitle>Dropout Rate</SectionTitle>
        <article>
          {/* Top stats about High School Dropout Rate. */}
          <Stat
            title="Zip code with highest dropout rate"
            year={topDropoutRate.Year}
            value={topDropoutRate.Zip}
            qualifier={formatPercentage(topDropoutRate["High School Dropout Rate"])}
          />
          <p>In {topDropoutRate.Year}, zip code {topDropoutRate.Zip} had the highest dropout rate ({formatPercentage(topDropoutRate["High School Dropout Rate"])}).</p>
          <p>The following map shows the dropout rate for areas by zip code in Wayne County.</p>
        </article>

        {/* Draw Geomap to show dropout rate for each zip code in the Wayne county */}
        <Geomap config={{
          data: highSchoolDropoutRate,
          groupBy: "Zip",
          colorScale: "High School Dropout Rate",
          colorScaleConfig: {
            axisConfig: {tickFormat: d => formatPercentage(d)}
          },
          label: d => d.Zip,
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d["High School Dropout Rate"])]]},
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
          topojsonId: d => d.properties.ZCTA5CE10
        }}
        />
      </SectionColumns>
    );
  }
}

DropoutRate.defaultProps = {
  slug: "dropout-rate"
};

DropoutRate.need = [
  fetchData("highSchoolDropoutRate", "/api/data?measures=Total Population,High School Dropout Rate&drilldowns=Zip&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  highSchoolDropoutRate: state.data.highSchoolDropoutRate
});

export default connect(mapStateToProps)(DropoutRate);

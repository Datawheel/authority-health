import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";
import zipcodes from "../../../../utils/zipcodes";

class EmploymentGrowth extends SectionColumns {

  render() {

    const {percentChangeInEmploymemt} = this.props;

    return (
      <SectionColumns>
        <SectionTitle>Employment Growth</SectionTitle>
        <article>
        </article>

        {/* Draw Geomap to show health center count for each zip code in the Wayne county */}
        <Geomap config={{
          data: percentChangeInEmploymemt,
          groupBy: "Zip Code",
          colorScale: "Percent Change in Employment",
          colorScaleConfig: {
            axisConfig: {tickFormat: d => `${d}%`}
          },
          label: d => d["Zip Code"],
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Employment Growth", d => `${d["Percent Change in Employment"]}%`]]},
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
          topojsonId: d => d.properties.ZCTA5CE10
        }}
        />
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

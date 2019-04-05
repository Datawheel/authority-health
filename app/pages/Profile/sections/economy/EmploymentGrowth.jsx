import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import styles from "style.yml";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import zipcodes from "utils/zipcodes";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

class EmploymentGrowth extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {percentChangeInEmploymemt} = this.props;
    const topEmploymentRateData = percentChangeInEmploymemt.sort((a, b) => b["Percent Change in Employment"] - a["Percent Change in Employment"])[0];

    return (
      <SectionColumns>
        <SectionTitle>Employment Growth</SectionTitle>
        <article>
          <Stat
            title={"Zip Code with the largest employment growth"}
            year={topEmploymentRateData.Year}
            value={topEmploymentRateData.Zip}
            qualifier={`(${formatAbbreviate(topEmploymentRateData["Percent Change in Employment"])}%)`}
          />

          <p>In {topEmploymentRateData.Year}, the zip code in Wayne County with the largest employment growth was {topEmploymentRateData.Zip} ({formatAbbreviate(topEmploymentRateData["Percent Change in Employment"])}%).</p>
          <p>The following map shows the employment growth for all zip codes in Wayne County.</p>
          <Contact slug={this.props.slug} />
          <SourceGroup sources={this.state.sources} />
        </article>

        {/* Draw Geomap to show health center count for each zip code in the Wayne county */}
        <Geomap config={{
          data: "/api/data?measures=Percent Change in Employment&drilldowns=Zip&Year=all",
          groupBy: "ID Zip",
          colorScale: "Percent Change in Employment",
          colorScaleConfig: {
            axisConfig: {tickFormat: d => `${d}%`},
            color: [styles["danger-dark"], styles["light-3"], styles["success-dark"]]
          },
          label: d => d.Zip,
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Employment Growth", d => `${formatAbbreviate(d["Percent Change in Employment"])}%`]]},
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
          topojsonId: d => d.properties.ZCTA5CE10
        }}
        dataFormat={resp => {
          this.setState({sources: updateSource(resp.source, this.state.sources)});
          return resp.data;
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
  fetchData("percentChangeInEmploymemt", "/api/data?measures=Percent Change in Employment&drilldowns=Zip&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  percentChangeInEmploymemt: state.data.percentChangeInEmploymemt
});

export default connect(mapStateToProps)(EmploymentGrowth);

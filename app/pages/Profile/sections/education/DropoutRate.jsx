import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import styles from "style.yml";

import Contact from "components/Contact";
import Stat from "components/Stat";
import zipcodes from "utils/zipcodes";
import Disclaimer from "components/Disclaimer";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatPercentage = d => `${formatAbbreviate(d * 100)}%`;

const formatGeomapZipLabel = (d, meta, zipToPlace) => {
  const cityName = zipToPlace[d["ID Zip"]];
  return cityName === undefined ? d.Zip : `${d.Zip}, ${cityName}`;
};

class DropoutRate extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {meta, topStats, highSchoolDropoutRate} =  this.props;
    const {zipToPlace} = topStats;

    // Find top High School DropoutRate for the recent year.
    highSchoolDropoutRate.sort((a, b) => b["High School Dropout Rate"] - a["High School Dropout Rate"]);
    const topDropoutRate = highSchoolDropoutRate[0];

    return (
      <SectionColumns>
        <SectionTitle>Dropout Rate</SectionTitle>
        <article>
          <Disclaimer>Data is shown at the zip level</Disclaimer>
          {/* Top stats about High School Dropout Rate. */}
          <Stat
            title="highest high school dropout rate"
            year={topDropoutRate.Year}
            value={topDropoutRate.Zip}
            qualifier={`${formatPercentage(topDropoutRate["High School Dropout Rate"])} of the population in this zip code`}
          />
          <p>In {topDropoutRate.Year}, zip code {topDropoutRate.Zip} had the highest high school dropout rate ({formatPercentage(topDropoutRate["High School Dropout Rate"])}).</p>
          <p>The following map shows the high school dropout rate by zip code in Wayne County.</p>

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ "/api/data?measures=Total Population,High School Dropout Rate&drilldowns=Zip&Year=all" }
            title="Map of Dropout Rate" />

          {/* Draw Geomap to show dropout rate for each zip code in the Wayne county */}
          <Geomap ref={comp => this.viz = comp} config={{
            data: "/api/data?measures=Total Population,High School Dropout Rate&drilldowns=Zip&Year=all",
            groupBy: "Zip",
            colorScale: "High School Dropout Rate",
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)},
              // dropping out is bad
              color: [
                styles["danger-light"],
                styles.danger,
                styles["danger-dark"]
              ]
            },
            label: d => formatGeomapZipLabel(d, meta, zipToPlace),
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d["High School Dropout Rate"])]]},
            topojson: "/topojson/zipcodes.json",
            topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
            topojsonId: d => d.properties.ZCTA5CE10
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return resp.data;
          }}
          />
        </div>
      </SectionColumns>
    );
  }
}

DropoutRate.defaultProps = {
  slug: "dropout-rate"
};

DropoutRate.need = [
  fetchData("highSchoolDropoutRate", "/api/data?measures=Total Population,High School Dropout Rate&drilldowns=Zip&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  highSchoolDropoutRate: state.data.highSchoolDropoutRate
});

export default connect(mapStateToProps)(DropoutRate);

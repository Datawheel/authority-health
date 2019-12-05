import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import styles from "style.yml";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import Disclaimer from "components/Disclaimer";
import zipcodes from "utils/zipcodes";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatGeomapZipLabel = (d, meta, zipToPlace) => {
  const cityName = zipToPlace[d["ID Zip"]];
  return cityName === undefined ? d.Zip : `${d.Zip}, ${cityName}`;
};

class EmploymentGrowth extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {meta, topStats, percentChangeInEmploymemt} = this.props;
    const {zipToPlace} = topStats;
    const topEmploymentRateData = percentChangeInEmploymemt.sort((a, b) => b["Percent Change in Employment"] - a["Percent Change in Employment"])[0];

    return (
      <SectionColumns>
        <SectionTitle>Employment Growth</SectionTitle>
        <article>
          <Disclaimer>Data is only available at the zip level</Disclaimer>
          <Stat
            title={"Zip Code with the largest employment growth"}
            year={topEmploymentRateData.Year}
            value={topEmploymentRateData.Zip}
            qualifier={`(${formatAbbreviate(topEmploymentRateData["Percent Change in Employment"])}%)`}
          />

          <p>In {topEmploymentRateData.Year}, the zip code in Wayne County with the largest employment growth was {topEmploymentRateData.Zip} ({formatAbbreviate(topEmploymentRateData["Percent Change in Employment"])}%).</p>
          <p>The following map shows the employment growth for all zip codes in Wayne County.</p>

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ "/api/data?measures=Percent Change in Employment&drilldowns=Zip&Year=all" }
            title="Map of Employment Growth" />

          {/* Draw Geomap to show health center count for each zip code in the Wayne county */}
          <Geomap ref={comp => this.viz = comp } config={{
            data: "/api/data?measures=Percent Change in Employment&drilldowns=Zip&Year=all",
            groupBy: "Zip",
            label: d => formatGeomapZipLabel(d, meta, zipToPlace),
            colorScale: "Percent Change in Employment",
            colorScaleConfig: {
              axisConfig: {tickFormat: d => `${formatAbbreviate(d)}%`},
              color: [
                styles["danger-dark"],
                styles["terra-cotta-light"],
                styles["light-2"],
                styles["success-light"],
                styles["success-dark"]
              ]
            },
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
        </div>
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
  meta: state.data.meta,
  topStats: state.data.topStats,
  percentChangeInEmploymemt: state.data.percentChangeInEmploymemt
});

export default connect(mapStateToProps)(EmploymentGrowth);

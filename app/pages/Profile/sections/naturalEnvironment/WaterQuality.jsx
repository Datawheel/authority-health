import React from "react";
import {connect} from "react-redux";
import {Geomap, LinePlot} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatData = d => {
  console.log("d: ", d);
  if (d === "unavailable") return 0;
  if (d === "normal") return 1;
  if (d === "excessive") return 2;
  return -1;
};

const getLeadStats = excessiveLeadData => {
  const stats = [];
  excessiveLeadData.forEach(d => stats.push(<Stat
    title={`Excessive Lead in ${d.Year}`}
    value={`${d.Tract}`}
  />));
  return stats;
};

const getMercuryStats = excessiveMercuryData => {
  const stats = [];
  excessiveMercuryData.forEach(d => stats.push(<Stat
    title={`Excessive Mercury in ${d.Year}`}
    value={`${d.Tract}`}
  />));
  return stats;
};

class WaterQuality extends SectionColumns {

  render() {

    const {waterQualityData} = this.props;
    // console.log("waterQualityData: ", waterQualityData);


    const filteredData = waterQualityData.data.filter(d => d["ID Tract"].startsWith("14000US26163"));
    console.log("filteredData: ", filteredData);

    const excessiveLeadData = filteredData.filter(d => d["Lead Level"] === "excessive");
    console.log("excessiveLeadData: ", excessiveLeadData);

    const excessiveMercuryData = filteredData.filter(d => d["Mercury Level"] === "excessive");
    console.log("excessiveMercuryData: ", excessiveMercuryData);

    const leadStats = getLeadStats(excessiveLeadData);
    const mercuryStats = getMercuryStats(excessiveMercuryData);

    return (
      <SectionColumns>
        <SectionTitle>Water Quality</SectionTitle>
        <article>
          {leadStats}
          {mercuryStats}
        </article>

        {/* Geomap to show Lead and Mercury level in water for all tracts in the Wayne County. */}
        <Geomap config={{
          data: waterQualityData.data,
          groupBy: "ID Tract",
          // colorScale: d => formatData(d["Lead Level"]),
          shapeConfig: {Path: {fill: d => d["Lead Level"] === "excessive" ? "red" : "transparent"}},
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Value", d => d["Lead Level"]]]},
          topojson: "/topojson/tract.json"
          // topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        />

        {/* <LinePlot config={{
          data: filteredData,
          discrete: "x",
          height: 250,
          groupBy: "ID Tract",
          legend: false,
          baseline: 0,
          x: "Year",
          xConfig: {
            title: "Year"
          },
          y: d => formatData(d["Lead Level"]),
          yConfig: {
            title: "Lead Level"
          },
          tooltipConfig: {tbody: [["Value", d => d["Lead Level"]]]}
        }}
        /> */}
      </SectionColumns>
    );
  }
}

WaterQuality.defaultProps = {
  slug: "water-quality"
};

WaterQuality.need = [
  fetchData("waterQualityData", "/api/data?measures=Lead%20Level,Mercury%20Level&drilldowns=Tract&Year=all")
];

const mapStateToProps = state => ({
  waterQualityData: state.data.waterQualityData
});

export default connect(mapStateToProps)(WaterQuality);

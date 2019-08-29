import React from "react";
import {connect} from "react-redux";
import Vizbuilder from "@datawheel/canon-vizbuilder";
import places from "../../utils/places";
import zipcodes from "../../utils/zipcodes";
import {badMeasures} from "d3plus.js";
import colors from "style.yml";
import "./Visualize.css";

const measureConfig = {};
badMeasures.forEach(measure => {
  measureConfig[measure] = {
    colorScaleConfig: {
      color: colors.danger
    }
  };
});

const negativeMeasures = [
  "Percent Change in Health Center Uninsured Patient Population (1-Year)"
];

negativeMeasures.forEach(measure => {
  measureConfig[measure] = {
    colorScaleConfig: {
      color: [
        colors["danger-dark"],
        colors.danger,
        colors["danger-light"],
        colors.white
      ]
    }
  };
});

const divergingMeasures = [
  "Percent Change in Employment",
  "Percent Change in Establishments",
  "Percent Change in Health Center Medicare and Private Insurance Patients (1-Year)",
  "Percent Change in Health Center Medicare and Private Insurance Patients (2-Year)",
  "Percent Change in Health Center Patients (1-Year)",
  "Percent Change in Health Center Patients (2-Year)"
];

divergingMeasures.forEach(measure => {
  measureConfig[measure] = {
    colorScaleConfig: {
      color: [
        colors.danger,
        colors["danger-light"],
        colors.white,
        colors["success-light"],
        colors.success
      ]
    }
  };
});

class Visualize extends React.Component {

  render() {

    const {charts} = this.props.vizbuilder;
    const {cube} = this.props.vizbuilder.query;

    if (cube) {
      if (cube.name === "UDS Mapper - Heatlh Centers") {
        this.props.vizbuilder.charts = charts.filter(d => d.chartType !== "lineplot");
      }
    }

    return <div className="vizbuilder-container">
      <Vizbuilder
        src={[
          "https://ah-cedar-api.datawheel.us/"
          // "https://acs-api.datausa.io/"
        ]}
        defaultGroup={[
          "Coverage Status.Coverage Status",
          "Gender.Gender",
          "Sex.Sex",
          "Age.Age",
          "Race.Race",
          "Hours.Hours",
          "Specialty.Specialty",
          "Disability.Disability",
          "ELL.ELL",
          "NSLP.NSLP",
          "Parents Education.Parents Education",
          "Level of School.Level of School",
          "Category.Sub-category",
          "Category.Category",
          "Assitance Type.Assistance Type",
          "Public Assistance or Snap.Public Assistance or Snap",
          "Geography.Zip",
          "Geography.Zip Region",
          "Geography.Tract",
          "Geography.Place"
        ]}
        defaultMeasure="Number of Food Stores"
        measureConfig={measureConfig}
        tableLogic={cubes => {
          const cube = cubes.find(d => d.name.match(/_5/));
          return cube || cubes[0];
        }}
        config={{
          colorScalePosition: "bottom",
          detectResizeDelay: 100,
          height: undefined,
          width: undefined,
          zoomScroll: true
        }}
        topojson={{
          "County": {
            topojson: "/topojson/county.json",
            topojsonFilter: d => d.id.startsWith("05000US26"),
            topojsonId: d => d.id
          },
          "Place": {
            topojson: "/topojson/place.json",
            topojsonFilter: d => places.includes(d.id),
            topojsonId: d => d.id
          },
          "Tract": {
            topojson: "/topojson/tract.json",
            topojsonFilter: d => d.id.startsWith("14000US26163"),
            topojsonId: d => d.id
          },
          "Zip": {
            topojson: "/topojson/zipcodes.json",
            topojsonFilter: d => {
              const {vizbuilder} = this.props;
              const acs = vizbuilder && vizbuilder.query.cube ? vizbuilder.query.cube.name.indexOf("acs_") === 0 : false;
              return acs ? true : zipcodes.includes(d.properties.ZCTA5CE10);
            },
            topojsonId: d => `86000US${d.properties.ZCTA5CE10}`
          },
          "Zip Region": {
            topojson: "/topojson/zipregions.json",
            topojsonId: d => d.properties.REGION,
            topojsonFilter: () => true
          }
        }}
        visualizations={[
          "treemap",
          "geomap",
          "barchart",
          "lineplot",
          "histogram",
          "stacked"
        ]}
      />
    </div>;
  }

}

export default connect(state => ({vizbuilder: state.vizbuilder}))(Visualize);

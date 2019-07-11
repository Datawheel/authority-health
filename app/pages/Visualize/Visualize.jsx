import React from "react";
import {connect} from "react-redux";
import Vizbuilder from "@datawheel/canon-vizbuilder";
import places from "../../utils/places";
import zipcodes from "../../utils/zipcodes";
import "./Visualize.css";

class Visualize extends React.Component {

  render() {

    return <div className="vizbuilder-container">
      <Vizbuilder
        src={[
          "https://ah-cedar-api.datawheel.us/"
          // "https://acs-api.datausa.io/"
        ]}
        defaultGroup={[
          "Geography.Zip",
          "Geography.Zip Region",
          "Geography.Place",
          "Geography.Tract",
          "Gender.Gender",
          "Age.Age"
        ]}
        defaultMeasure="Number of Food Stores"
        tableLogic={cubes => {
          const cube = cubes.find(d => d.name.match(/_5/));
          return cube || cubes[0];
        }}
        config={{
          colorScalePosition: "bottom",
          detectResizeDelay: 100,
          shapeConfig: {
            hoverOpacity: 1
          },
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
          "geomap",
          "treemap",
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

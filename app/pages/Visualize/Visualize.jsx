import React from "react";
import Vizbuilder from "@datawheel/canon-vizbuilder";
import places from "../../utils/places";
import zipcodes from "../../utils/zipcodes";
import "./Visualize.css";

export default class Visualize extends React.Component {
  render() {
    return <Vizbuilder
      src={[
        "https://ah-birch-api.datawheel.us/"
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
      measureConfig={{}}
      topojson={{
        "County": {
          topojson: "/topojson/county.json",
          topojsonFilter: d => d.id.startsWith("05000US26")
        },
        "Place": {
          topojson: "/topojson/place.json",
          topojsonFilter: d => places.includes(d.id)
        },
        "Tract": {
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        },
        "Zip": {
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
          topojsonId: d => d.properties.ZCTA5CE10
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
    />;
  }
}

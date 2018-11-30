import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class HealthConditonChronicDiseases extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Arthritis"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {arthritisData} = this.props;
    console.log("arthritisData: ", arthritisData);
    const {dropdownValue} = this.state;

    return (
      <SectionColumns>
        <SectionTitle>Health Conditon/Chronic Diseases</SectionTitle>
        <article>
        </article>

        {/* Gepmap to show Property Values for all tracts in the Wayne County. */}
        <Geomap config={{
          data: arthritisData,
          groupBy: "ID Tract",
          colorScale: "Arthritis Data Value",
          label: d => d.Tract,
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Value", d => `${formatPercentage(d["Arthritis Data Value"])}`]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        />
      </SectionColumns>
    );
  }
}

HealthConditonChronicDiseases.defaultProps = {
  slug: "health-conditon-chronic-diseases"
};

HealthConditonChronicDiseases.need = [
  fetchData("arthritisData", "/api/data?measures=Arthritis%20Data%20Value,Population%20Count&drilldowns=Tract&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  arthritisData: state.data.arthritisData
});

export default connect(mapStateToProps)(HealthConditonChronicDiseases);

import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class ObesityAndDiabetes extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Obesity Data Value"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {obesityDataValue} = this.props;
    console.log("obesityDataValue: ", obesityDataValue);

    const {dropdownValue} = this.state;
    const dropdownList = obesityDataValue.source[0].measures;

    // const topDropdownValueTract = healthConditionData.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Obesity and Diabetes</SectionTitle>
        <article>
          {/* Create a dropdown for different types of health conditions. */}
          <select onChange={this.handleChange}>
            {dropdownList.map((item, i) => <option key={i} value={item}>{item}</option>)}
          </select>
          
        </article>

        {/* Geomap to show health condition data for selected dropdown value for all tracts in the Wayne County. */}
        <Geomap config={{
          data: obesityDataValue.data,
          groupBy: "ID Tract",
          colorScale: dropdownValue,
          label: d => d.Tract,
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Value", d => `${formatPercentage(d[dropdownValue])}`]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        />
      </SectionColumns>
    );
  }
}

ObesityAndDiabetes.defaultProps = {
  slug: "obesity-and-diabetes"
};

ObesityAndDiabetes.need = [
  fetchData("obesityDataValue", "/api/data?measures=Obesity%20Data%20Value&drilldowns=Tract&Year=all")
];

const mapStateToProps = state => ({
  obesityDataValue: state.data.obesityDataValue
});

export default connect(mapStateToProps)(ObesityAndDiabetes);


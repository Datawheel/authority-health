import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class PreventiveCare extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Annual Checkup Data Value"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {preventiveCareData} = this.props;
    console.log("preventiveCareData: ", preventiveCareData);

    const {dropdownValue} = this.state;
    const dropdownList = preventiveCareData.source[0].measures;

    const topDropdownValueTract = preventiveCareData.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Preventive Care</SectionTitle>
        <article>
          {/* Create a dropdown for different types of preventive care. */}
          <select onChange={this.handleChange}>
            {dropdownList.map((item, i) => <option key={i} value={item}>{item}</option>)}
          </select>

          <Stat
            title={`Majority ${dropdownValue} in ${topDropdownValueTract.Year}`}
            value={`${topDropdownValueTract.Tract} ${formatPercentage(topDropdownValueTract[dropdownValue])}`}
          />

          <p>The Geomap here shows {dropdownValue} for Tracts in the Wayne county, MI.</p>
          <p>In {topDropdownValueTract.Year}, top {dropdownValue} was {formatPercentage(topDropdownValueTract[dropdownValue])} in {topDropdownValueTract.Tract}.</p>
        </article>

        {/* Geomap to show Preventive care data for selected dropdown Value for all tracts in the Wayne County. */}
        <Geomap config={{
          data: preventiveCareData.data,
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

PreventiveCare.defaultProps = {
  slug: "preventive-care"
};

PreventiveCare.need = [
  fetchData("preventiveCareData", "/api/data?measures=Annual%20Checkup%20Data%20Value,Core%20preventive%20services%20for%20older%20men%20Data%20Value,Core%20preventive%20services%20for%20older%20women%20Data%20Value,Dental%20Visit%20Data%20Value,Colorectal%20Cancer%20Screening%20Data%20Value,Pap%20Smear%20Test%20Data%20Value,Mammography%20Data%20Value,Cholesterol%20Screening%20Data%20Value&drilldowns=Tract&Year=all")
];

const mapStateToProps = state => ({
  preventiveCareData: state.data.preventiveCareData
});

export default connect(mapStateToProps)(PreventiveCare);

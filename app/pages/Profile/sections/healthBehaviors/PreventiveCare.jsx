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

    const {preventiveCareData, preventiveCareWeightedData} = this.props;
    console.log("preventiveCareWeightedData: ", preventiveCareWeightedData);

    const {dropdownValue} = this.state;
    const dropdownList = preventiveCareData.source[0].measures.slice();
    preventiveCareWeightedData.source[0].measures.forEach(d => {
      dropdownList.push(d);
    });

    // Check if the selected dropdown values are from the preventiveCareWeightedData.
    const isPreventativeCareWeightedValueSelected = dropdownValue === "Had Flu Vaccine Yes Weighted Percent" ||
    dropdownValue === "Had Pneumonia Vaccine Yes Weighted Percent" ||
    dropdownValue === "Had Routine Checkup Last Year Yes Weighted Percent" ||
    dropdownValue === "FOBT or Endoscopy Yes Weighted Percent";

    const topDropdownValueTract = preventiveCareData.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Preventive Care</SectionTitle>
        <article>
          {/* Create a dropdown for different types of preventive care. */}
          <select onChange={this.handleChange}>
            {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
          </select>

          <Stat
            title={`Majority ${dropdownValue} in ${topDropdownValueTract.Year}`}
            value={`${topDropdownValueTract.Tract} ${formatPercentage(topDropdownValueTract[dropdownValue])}`}
          />

          <p>The Geomap here shows {dropdownValue} for Tracts in the Wayne county, MI.</p>
          <p>In {topDropdownValueTract.Year}, top {dropdownValue} was {formatPercentage(topDropdownValueTract[dropdownValue])} in {topDropdownValueTract.Tract}.</p>
        </article>

        {/* Geomap to show Preventive care data for selected dropdown Value. */}
        {isPreventativeCareWeightedValueSelected 
          ? <Geomap config={{
            data: preventiveCareWeightedData.data,
            groupBy: "ID County",
            colorScale: dropdownValue,
            label: d => d.County,
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Value", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/county.json",
            topojsonFilter: d => d.id.startsWith("05000US26")
          }}
          />
          : <Geomap config={{
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
          />}
      </SectionColumns>
    );
  }
}

PreventiveCare.defaultProps = {
  slug: "preventive-care"
};

PreventiveCare.need = [
  fetchData("preventiveCareData", "/api/data?measures=Annual%20Checkup%20Data%20Value,Core%20preventive%20services%20for%20older%20men%20Data%20Value,Core%20preventive%20services%20for%20older%20women%20Data%20Value,Dental%20Visit%20Data%20Value,Colorectal%20Cancer%20Screening%20Data%20Value,Pap%20Smear%20Test%20Data%20Value,Mammography%20Data%20Value,Cholesterol%20Screening%20Data%20Value&drilldowns=Tract&Year=all"),
  fetchData("preventiveCareWeightedData", "/api/data?measures=Had%20Flu%20Vaccine%20Yes%20Weighted%20Percent,Had%20Pneumonia%20Vaccine%20Yes%20Weighted%20Percent,Had%20Routine%20Checkup%20Last%20Year%20Yes%20Weighted%20Percent,FOBT%20or%20Endoscopy%20Yes%20Weighted%20Percent&drilldowns=End%20Year,County")
];

const mapStateToProps = state => ({
  preventiveCareData: state.data.preventiveCareData,
  preventiveCareWeightedData: state.data.preventiveCareWeightedData
});

export default connect(mapStateToProps)(PreventiveCare);

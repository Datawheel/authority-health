import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

class PreventiveCare extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      dropdownValue: "Annual Checkup",
      preventiveCareWeightedData: [],
      preventiveCareData: this.props.preventiveCareData,
      isPreventativeCareWeightedValueSelected: false
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    if (dropdownValue === "Had Flu Vaccine" ||
    dropdownValue === "Had Pneumonia Vaccine" ||
    dropdownValue === "Had Routine Checkup Last Year" ||
    dropdownValue === "FOBT or Endoscopy" ||
    dropdownValue === "HIV Tested") { 
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=latest`) // MiBRFS - All Years
        .then(resp => {
          this.setState({
            preventiveCareWeightedData: resp.data.data,
            isPreventativeCareWeightedValueSelected: true,
            dropdownValue
          });
        }); 
    }
    else {
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Tract&Year=latest`)
        .then(resp => {
          this.setState({
            preventiveCareData: resp.data.data,
            isPreventativeCareWeightedValueSelected: false,
            dropdownValue
          });
        });
    }
  }

  render() {
    const {dropdownValue, preventiveCareData, preventiveCareWeightedData, isPreventativeCareWeightedValueSelected} = this.state;
    const dropdownList = ["Annual Checkup", "Core Preventive Services for Older Men", "Core Preventive Services for Older Women", 
      "Dental Visit", "Colorectal Cancer Screening", "Pap Smear Test", "Mammography", "Cholesterol Screening", "Taking Blood Pressure Medication", "Had Flu Vaccine", 
      "Sleep Less Than 7 Hours", "Had Pneumonia Vaccine", "Had Routine Checkup Last Year", "FOBT or Endoscopy", "HIV Tested"];

    // Find recent year top data for the selected dropdown value.
    const topDropdownData = isPreventativeCareWeightedValueSelected ? preventiveCareWeightedData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0] : preventiveCareData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Preventive Care</SectionTitle>
        <article>
          {isPreventativeCareWeightedValueSelected ? <div className="disclaimer">Data only available for zip regions.</div> : <div className="disclaimer">Data only available for census tracts.</div>}
          {/* Create a dropdown for different types of preventive care. */}
          <label className="pt-label pt-inline" htmlFor="preventive-care-dropdown">
            Show data for
            <div className="pt-select">
              <select id="preventive-care-dropdown" onChange={this.handleChange}>
                {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </label>

          {/* Show top stats for the dropdown selected. */}
          <Stat
            title={"Location with highest share"}
            year={isPreventativeCareWeightedValueSelected ? topDropdownData["End Year"] : topDropdownData.Year}
            value={isPreventativeCareWeightedValueSelected ? topDropdownData["Zip Region"] : topDropdownData.Tract}
            qualifier={isPreventativeCareWeightedValueSelected ? `${formatPercentage(topDropdownData[dropdownValue], true)} of population of this zip region` : `${formatPercentage(topDropdownData[dropdownValue])} of population of this census tract`}
          />

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          {isPreventativeCareWeightedValueSelected
            ? <p>In {topDropdownData["End Year"]}, {formatPercentage(topDropdownData[dropdownValue], true)} of population of zip region {topDropdownData["Zip Region"]} had the highest share of {dropdownValue} out of all zip regions in Wayne County.</p>
            : <p>In {topDropdownData.Year}, {formatPercentage(topDropdownData[dropdownValue])} of population of {topDropdownData.Tract} had the highest share of {dropdownValue.toLowerCase()} out of all tracts in Detroit, Livonia, Dearborn and Westland.</p>
          }
          {isPreventativeCareWeightedValueSelected
            ? <p>The map here shows the {dropdownValue.toLowerCase()} for zip regions in Wayne County.</p>
            : <p>The map here shows the {dropdownValue.toLowerCase()} for census tracts in Detroit, Livonia, Dearborn and Westland.</p>
          }
          <Contact slug={this.props.slug} />
        </article>

        {/* Geomap to show Preventive care data for selected dropdown Value. */}
        {isPreventativeCareWeightedValueSelected
          ? <Geomap config={{
            data: `/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=all`,
            groupBy: "ID Zip Region",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d, true)}
            },
            label: d => d["Zip Region"],
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Preventive Care", `${dropdownValue}`], ["Share", d => `${formatPercentage(d[dropdownValue], true)}`]]},
            topojson: "/topojson/zipregions.json",
            topojsonId: d => d.properties.REGION,
            topojsonFilter: () => true
          }}
          dataFormat={resp => resp.data}
          />
          : <Geomap config={{
            data: `/api/data?measures=${dropdownValue}&drilldowns=Tract&Year=all`,
            groupBy: "ID Tract",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.Tract,
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Preventive Care", `${dropdownValue}`], ["Share", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/tract.json",
            topojsonId: d => d.id,
            topojsonFilter: d => d.id.startsWith("14000US26163")
          }}
          dataFormat={resp => resp.data}
          />}
      </SectionColumns>
    );
  }
}

PreventiveCare.defaultProps = {
  slug: "preventive-care"
};

PreventiveCare.need = [
  fetchData("preventiveCareData", "/api/data?measures=Annual Checkup&drilldowns=Tract&Year=latest", d => d.data) // 500 Cities
];

const mapStateToProps = state => ({
  preventiveCareData: state.data.preventiveCareData 
});

export default connect(mapStateToProps)(PreventiveCare);

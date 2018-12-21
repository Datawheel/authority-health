import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
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

    // Include all the measures from preventiveCareData and preventiveCareWeightedData in the dropdown list.
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

    // Find recent year top data for the selceted dropdown value.
    const recentYearWeightedData = {};
    nest()
      .key(d => d["End Year"])
      .entries(preventiveCareWeightedData.data)
      .forEach(group => {
        group.key >= preventiveCareWeightedData.data[0]["End Year"] ? Object.assign(recentYearWeightedData, group) : {};
      });
    const topDropdownWeightedData = recentYearWeightedData.values[0];

    const topDropdownValueTract = preventiveCareData.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Preventive Care</SectionTitle>
        <article>
          {/* Create a dropdown for different types of preventive care. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {/* Show top stats for the dropdown selected. */}
          {isPreventativeCareWeightedValueSelected
            ? <Stat
              title={"Location with highest share"}
              year={topDropdownWeightedData.Year}
              value={topDropdownWeightedData.County}
              qualifier={formatPercentage(topDropdownWeightedData[dropdownValue])}
            />
            : <Stat
              title={"Location with highest share"}
              year={topDropdownValueTract.Year}
              value={topDropdownValueTract.Tract}
              qualifier={formatPercentage(topDropdownValueTract[dropdownValue])}
            />
          }

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          {isPreventativeCareWeightedValueSelected
            ? <p>In {topDropdownWeightedData["End Year"]}, {topDropdownWeightedData.County} had the highest share of {dropdownValue} ({formatPercentage(topDropdownWeightedData[dropdownValue])}) out of all the counties in Michigan.</p>
            : <p>In {topDropdownValueTract.Year}, {topDropdownValueTract.Tract} had the highest share of {dropdownValue.toLowerCase()} ({formatPercentage(topDropdownValueTract[dropdownValue])}) out of all the tracts in Wayne County.</p>
          }
          {isPreventativeCareWeightedValueSelected
            ? <p>The map here shows the {dropdownValue.toLowerCase()} for all counties in Michigan.</p>
            : <p>The map here shows the {dropdownValue.toLowerCase()} for all tracts in Wayne County, MI.</p>
          }
        </article>

        {/* Geomap to show Preventive care data for selected dropdown Value. */}
        {isPreventativeCareWeightedValueSelected
          ? <Geomap config={{
            data: preventiveCareWeightedData.data,
            groupBy: "ID County",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.County,
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Preventive Care", `${dropdownValue}`], ["Share", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/county.json",
            topojsonFilter: d => d.id.startsWith("05000US26")
          }}
          />
          : <Geomap config={{
            data: preventiveCareData.data,
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
  fetchData("preventiveCareData", "/api/data?measures=Annual Checkup Data Value,Core preventive services for older men Data Value,Core preventive services for older women Data Value,Dental Visit Data Value,Colorectal Cancer Screening Data Value,Pap Smear Test Data Value,Mammography Data Value,Cholesterol Screening Data Value&drilldowns=Tract&Year=all"),
  fetchData("preventiveCareWeightedData", "/api/data?measures=Had Flu Vaccine Yes Weighted Percent,Had Pneumonia Vaccine Yes Weighted Percent,Had Routine Checkup Last Year Yes Weighted Percent,FOBT or Endoscopy Yes Weighted Percent&drilldowns=End Year,County")
];

const mapStateToProps = state => ({
  preventiveCareData: state.data.preventiveCareData,
  preventiveCareWeightedData: state.data.preventiveCareWeightedData
});

export default connect(mapStateToProps)(PreventiveCare);

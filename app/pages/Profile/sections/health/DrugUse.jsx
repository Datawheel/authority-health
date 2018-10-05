import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class DrugUse extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Current Smoking Data Value"};
  }

  // Handler function for dropdown onChange.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {allTractSmokingDrinkingData} = this.props;
    const drugTypes = allTractSmokingDrinkingData.source[0].measures;

    const allTractSmokingData = allTractSmokingDrinkingData.data.slice(0);
    allTractSmokingData.sort((a, b) => b[drugTypes[0]] - a[drugTypes[0]]);
    const topTractSmokingData = allTractSmokingData[0];

    const allTractDrinkingData = allTractSmokingDrinkingData.data.slice(0);
    allTractDrinkingData.sort((a, b) => b[drugTypes[1]] - a[drugTypes[1]]);
    const topTractDrinkingData = allTractDrinkingData[0];

    const dropdownValues = item => <option value={item}>{item}</option>;

    return (
      <SectionColumns>
        <SectionTitle>Drug Use</SectionTitle>
        <article>
          {/* Create a dropdown for drug types. */}
          <select onChange={this.handleChange}>{drugTypes.map(dropdownValues)}</select>
          {this.state.dropdownValue === drugTypes[0]
            ? <Stat
              title={`${topTractSmokingData.Tract}`}
              value={`${formatAbbreviate(topTractSmokingData[this.state.dropdownValue])}%`}
            />
            : <Stat
              title={`${topTractDrinkingData.Tract}`}
              value={`${formatAbbreviate(topTractDrinkingData[this.state.dropdownValue])}%`}
            />
          }

          {this.state.dropdownValue === drugTypes[0]
            ? <p>{topTractSmokingData.Tract} had highest smoking rate of {topTractSmokingData[drugTypes[0]]}% in the year {topTractSmokingData["ID Year"]}</p>
            : <p>{topTractDrinkingData.Tract} had highest drinking rate of {topTractDrinkingData[drugTypes[1]]}% in the year {topTractDrinkingData["ID Year"]}</p>
          }

        </article>

        {/* Create a Geomap based on the dropdown choice. */}
        <Geomap config={{
          data: `/api/data?measures=${this.state.dropdownValue.replace(/\s/g, "%20")}&drilldowns=Tract&Year=latest`,
          groupBy: "ID Tract",
          colorScale: this.state.dropdownValue,
          label: d => d.Tract,
          height: 400,
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d[this.state.dropdownValue])]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        dataFormat={resp => resp.data}
        />
      </SectionColumns>
    );
  }
}

DrugUse.defaultProps = {
  slug: "drug-use"
};

DrugUse.need = [
  fetchData("allTractSmokingDrinkingData", "/api/data?measures=Current%20Smoking%20Data%20Value,Binge%20Drinking%20Data%20Value&drilldowns=Tract&Year=latest")
];
  
const mapStateToProps = state => ({
  allTractSmokingDrinkingData: state.data.allTractSmokingDrinkingData
});
  
export default connect(mapStateToProps)(DrugUse);


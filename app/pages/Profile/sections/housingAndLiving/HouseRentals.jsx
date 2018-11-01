import React from "react";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";
// import places from "../../../../utils/places";

class HouseRentals extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Child"};
  }

  render() {

    const {rentAmountData} = this.props;
    console.log("rentAmountData: ", rentAmountData);

    return (
      <SectionColumns>
        <SectionTitle>House Rentals</SectionTitle>
        <article>
        </article>
        {/* Create a Geomap based on the dropdown choice. */}
        <LinePlot config={{
          // data: "/api/data?measures=Construction%20Date&drilldowns=Place&Year=all",
          data: rentAmountData,
          discrete: "x",
          height: 400,
          groupBy: "ID County",
          label: d => d.Year,
          x: "Year",
          xConfig: {
            title: "Year"
          },
          y: "Rent Amount",
          yConfig: {
            tickFormat: d => formatAbbreviate(d),
            title: "Rent amount"
          },
          tooltipConfig: {tbody: [["Value", d => `$${formatAbbreviate(d["Rent Amount"])}`]]}
        }}
        />
      </SectionColumns>
    );
  }
}

HouseRentals.defaultProps = {
  slug: "house-rentals"
};

HouseRentals.need = [
  fetchData("rentAmountData", "/api/data?measures=Rent%20Amount&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  rentAmountData: state.data.rentAmountData
});
  
export default connect(mapStateToProps)(HouseRentals);


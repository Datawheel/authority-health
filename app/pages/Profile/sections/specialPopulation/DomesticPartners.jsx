import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;
const formatPartnerLabel = d => d.replace("&", "w/");

class DomesticPartners extends SectionColumns {

  render() {
    const {domesticPartnersData} = this.props;

    const domesticPartnersDataAvailable = domesticPartnersData.length !== 0;

    if (domesticPartnersDataAvailable) {
      const filteredDomesticPartnersData = domesticPartnersData.filter(d => d["ID Sex of Partner"] !== 4);
      const recentDomesticPartnersData = {};
      nest()
        .key(d => d.Year)
        .entries(filteredDomesticPartnersData)
        .forEach(group => {
          const total = sum(group.values, d => d["Unmarried Partner Households"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Unmarried Partner Households"] / total * 100 : d.share = 0);
          group.key >= filteredDomesticPartnersData[0].Year ? Object.assign(recentDomesticPartnersData, group) : {};
        });
      recentDomesticPartnersData.values.sort((a, b) => b.share - a.share);
      const topData = recentDomesticPartnersData.values[0];

      return (
        <SectionColumns>
          <SectionTitle>Domestic Partners</SectionTitle>
          <article>
            {/* Show top stats for each domestic partner type */}
            <Stat
              title="Most common Partnership"
              year={topData.Year}
              value={formatPartnerLabel(topData["Sex of Partner"])}
              qualifier={formatPopulation(topData.share)}
            />
            <p>In {topData.Year}, most common domestic partnership in {topData.Geography} was {formatPartnerLabel(topData["Sex of Partner"]).toLowerCase()} ({formatPopulation(topData.share)}).</p>
            <p>The chart here shows the types of domestic partners and the corresponding share for each type.</p>
          </article>

          {/* BarChart for Domestic Partner types. */}
          <BarChart config={{
            data: filteredDomesticPartnersData,
            discrete: "x",
            height: 400,
            groupBy: "Sex of Partner",
            label: d => formatPartnerLabel(d["Sex of Partner"]),
            legend: false,
            x: "Sex of Partner",
            y: "share",
            time: "Year",
            xConfig: {
              labelRotation: false,
              tickFormat: d => formatPartnerLabel(d),
              title: "Types of Domestic Partners"
            },
            yConfig: {tickFormat: d => formatPopulation(d)},
            xSort: (a, b) => a["ID Sex of Partner"] - b["ID Sex of Partner"],
            shapeConfig: {label: false},
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)], ["Location", d => d.Geography]]}
          }}
          />
        </SectionColumns>
      );
    }
    else return <div></div>;
  }
}

DomesticPartners.defaultProps = {
  slug: "domestic-partners"
};

DomesticPartners.need = [
  fetchData("domesticPartnersData", "/api/data?measures=Unmarried Partner Households&drilldowns=Sex of Partner&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  domesticPartnersData: state.data.domesticPartnersData
});

export default connect(mapStateToProps)(DomesticPartners);

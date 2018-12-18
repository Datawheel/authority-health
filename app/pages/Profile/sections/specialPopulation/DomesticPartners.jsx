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
    const filteredDomesticPartnersData = domesticPartnersData.filter(d => d["ID Sex of Partner"] !== 4);

    const recentDomesticPartnersData = {};
    nest()
      .key(d => d.Year)
      .entries(filteredDomesticPartnersData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
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
          <p>In {topData.Year}, most common domestic partnership in {topData.Geography} County was {formatPartnerLabel(topData["Sex of Partner"]).toLowerCase()} ({formatPopulation(topData.share)}).</p>
          <p>The chart here shows the types of domestic partners w/ corresponding share for each type. {}</p>
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
          time: "ID Year",
          xConfig: {
            labelRotation: false,
            tickFormat: d => formatPartnerLabel(d),
            title: "Types of Domestic Partners"
          },
          yConfig: {tickFormat: d => formatPopulation(d)},
          xSort: (a, b) => a["ID Sex of Partner"] - b["ID Sex of Partner"],
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Share", d => formatPopulation(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

DomesticPartners.defaultProps = {
  slug: "domestic-partners"
};

DomesticPartners.need = [
  fetchData("domesticPartnersData", "/api/data?measures=Population&drilldowns=Sex of Partner&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  domesticPartnersData: state.data.domesticPartnersData
});

export default connect(mapStateToProps)(DomesticPartners);

import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class DomesticPartners extends SectionColumns {

  render() {
    const {domesticPartnersData} = this.props;

    // Get the domestic partners data for latest year.
    const recentDomesticPartnersData = {};
    nest()
      .key(d => d.Year)
      .entries(domesticPartnersData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= domesticPartnersData[0].Year ? Object.assign(recentDomesticPartnersData, group) : {};
      });
    const data = domesticPartnersData.filter(d => d["ID Sex of Partner"] !== 4);

    const topFilteredData = recentDomesticPartnersData.values.filter(d => d["ID Sex of Partner"] !== 4);
    topFilteredData.sort((a, b) => b["ID Sex of Partner"] - a["ID Sex of Partner"]);
    const topData = topFilteredData[0];

    return (
      <SectionColumns>
        <SectionTitle>Domestic Partners</SectionTitle>
        <article>
          {/* Show top stats for each domestic partner type */}
          <Stat
            title={`Top Domestic Partner in ${topData.Year}`}
            value={`${topData["Sex of Partner"]} ${formatPopulation(topData.share)}`}
          />
          <p>In {topData.Year}, the top Domestic Partners were {topData["Sex of Partner"]} with {formatPopulation(topData.share)} in the {topData.County} county.</p>
          <p>The Bar Chart here shows the types of domestic partners and corresponding percentage for each type. {}</p>
        </article>
        <BarChart config={{
          data,
          discrete: "x",
          height: 400,
          groupBy: "Sex of Partner",
          legend: false,
          x: d => d["Sex of Partner"],
          y: "share",
          time: "ID Year",
          xConfig: {labelRotation: false},
          yConfig: {tickFormat: d => formatPopulation(d)},
          xSort: (a, b) => a["ID Sex of Partner"] - b["ID Sex of Partner"],
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
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
  fetchData("domesticPartnersData", "/api/data?measures=Population&drilldowns=Sex%20of%20Partner&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  domesticPartnersData: state.data.domesticPartnersData
});

export default connect(mapStateToProps)(DomesticPartners);

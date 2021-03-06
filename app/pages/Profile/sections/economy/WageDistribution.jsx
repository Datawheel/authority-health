import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import rangeFormatter from "utils/rangeFormatter";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

const formatWageDistributionData = wageDistributionData => {
  nest()
    .key(d => d.Year)
    .entries(wageDistributionData)
    .forEach(group => {
      const total = sum(group.values, d => d["Household Income"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Household Income"] / total * 100 : d.share = 0);
    });
  return wageDistributionData;
};

const wageGiniComparison = (currentLevelGini, nationalLevelGini) => {
  if (currentLevelGini < nationalLevelGini) return ["higher than", "less"];
  else if (currentLevelGini > nationalLevelGini) return ["lower than", "more"];
  else return ["equal to", ""];
};

class WageDistribution extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {meta, wageDistributionData, wageGinidata, nationalWageGini} = this.props;

    const wageDistributionDataAvailable = wageDistributionData.length !== 0;
    const wageGinidataAvailable = wageGinidata.length !== 0;
    const wageGini = wageGinidata[0]["Wage GINI"] < 0 || wageGinidata[0]["Wage GINI"] > 1 ? "N/A" : wageGinidata[0]["Wage GINI"];

    return (
      <SectionColumns>
        <SectionTitle>Wage Distribution</SectionTitle>
        <article>
          {/* Top stats and short paragraph about Wage Gini. */}
          <Stat
            title="Wage GINI"
            year={wageGinidataAvailable ? wageGinidata[0].Year : ""}
            value={wageGinidataAvailable ? wageGini : "N/A"}
            qualifier={wageGinidataAvailable ? `in ${wageGinidata[0].Geography}` : ""}
          />

          {wageGinidataAvailable ? <p>In {wageGinidata[0].Year}, the income inequality in {wageGinidata[0].Geography} was {wageGini}, using the GINI coefficient. {}
            This was {wageGiniComparison(nationalWageGini[0]["Wage GINI"], wageGini)[0]} the national average of {nationalWageGini[0]["Wage GINI"]}. {}
          In other words, wages are distributed {wageGiniComparison(nationalWageGini[0]["Wage GINI"], wageGini)[1]} evenly in Detroit, MI in comparison to the national average.</p> : ""}

          <p>The GINI index measures the extent to which the distribution of income among individuals or households within an economy deviates from a perfectly equal distribution. Values range from 0 to 1, with 0 being perfect equality (every household earns equal income), and 1 being absolute inequality (one household earns all the income).</p>

          {wageDistributionDataAvailable ? <p>The following chart shows the household income buckets and share for each bucket in {wageDistributionData[0].Geography}.</p> : ""}

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `https://acs.datausa.io/api/data?measures=Household Income&drilldowns=Household Income Bucket&Geography=${meta.id}&Year=all` }
            title="Chart of Wage Distribution" />

          {/* Draw Barcahrt to show wage distribution for each place in the Wayne county. */}
          {wageDistributionDataAvailable
            ? <BarChart ref={comp => this.viz = comp} config={{
              data: `https://acs.datausa.io/api/data?measures=Household Income&drilldowns=Household Income Bucket&Geography=${meta.id}&Year=all`,
              discrete: "x",
              height: 400,
              legend: false,
              groupBy: "Household Income Bucket",
              x: "Household Income Bucket",
              y: "share",
              time: "Year",
              xSort: (a, b) => a["ID Household Income Bucket"] - b["ID Household Income Bucket"],
              xConfig: {
                tickFormat: d => rangeFormatter(d)
              },
              yConfig: {
                tickFormat: d => formatPopulation(d),
                title: "Share"
              },
              shapeConfig: {
                label: false
              },
              title: "Household Income Distribution",
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatWageDistributionData(resp.data);
            }}
            /> : null}
        </div>
      </SectionColumns>
    );
  }
}

WageDistribution.defaultProps = {
  slug: "wage-distribution"
};

WageDistribution.need = [
  fetchData("wageDistributionData", "https://acs.datausa.io/api/data?measures=Household Income&drilldowns=Household Income Bucket&Geography=<id>&Year=latest", d => d.data),
  fetchData("wageGinidata", "https://acs.datausa.io/api/data?measures=Wage GINI&Geography=<id>&Year=latest", d => d.data),
  fetchData("nationalWageGini", "https://acs.datausa.io/api/data?measures=Wage GINI&Geography=01000US&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  wageDistributionData: state.data.wageDistributionData,
  wageGinidata: state.data.wageGinidata,
  nationalWageGini: state.data.nationalWageGini
});

export default connect(mapStateToProps)(WageDistribution);

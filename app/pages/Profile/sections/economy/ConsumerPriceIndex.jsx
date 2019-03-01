import React from "react";
import {connect} from "react-redux";
import {format} from "d3-format";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import styles from "style.yml";
import Contact from "components/Contact";
import Stat from "components/Stat";
import growthCalculator from "utils/growthCalculator";

const commas = format(".2f");

class ConsumerPriceIndex extends SectionColumns {

  render() {

    const {consumerPriceIndexData} = this.props;

    const data = [];
    consumerPriceIndexData.data.forEach(d => {
      consumerPriceIndexData.source[0].measures.forEach(category => {
        if (d[category] !== null) {
          data.push(Object.assign({}, d, {Category: category}));
        }
      });
    });

    // Calculate the percentage growth CPI for current and the previous year.
    const cpiGrowth = formatAbbreviate(growthCalculator(data[0]["Average CPI"], data[3]["Average CPI"]));

    return (
      <SectionColumns>
        <SectionTitle>Consumer Price Index</SectionTitle>
        <article>
          <Stat
            title="Average CPI"
            year={data[0].Year}
            value={formatAbbreviate(data[0]["Average CPI"])}
          />
          <Stat
            title="Midwest CPI"
            year={data[0].Year}
            value={formatAbbreviate(data[0]["Average CPI (Midwest)"])}
          />
          <Stat
            title="National CPI"
            year={data[0].Year}
            value={formatAbbreviate(data[0]["Average CPI (Nation)"])}
          />
          <p>
            In {data[0].Year}, the average CPI for the Detroit-Warren-Dearborn, MI metro area was {formatAbbreviate(data[0]["Average CPI"])},
            which was less than the midwest CPI ({formatAbbreviate(data[0]["Average CPI (Midwest)"])}) and also less than the national CPI ({formatAbbreviate(data[0]["Average CPI (Nation)"])}).
            Between {data[3].Year} and {data[0].Year} the average CPI of the Detroit-Warren-Dearborn, MI metro area {cpiGrowth < 0 ? "reduced" : "increased"} from {formatAbbreviate(data[3]["Average CPI"])} to {formatAbbreviate(data[0]["Average CPI"])},
            {cpiGrowth < 0 ? " a decline" : " an increase"} of {cpiGrowth < 0 ? cpiGrowth * -1 : cpiGrowth}%.
          </p>
          <p>The following chart shows the average consumer price index for the Detroit-Warren-Dearborn, MI metro area compared to the midwest region and nation.</p>
          <Contact slug={this.props.slug} />
        </article>

        {/* Create a LinePlot. */}
        <LinePlot config={{
          data,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Category",
          x: "Year",
          y: d => d[d.Category],
          yConfig: {
            tickFormat: d => formatAbbreviate(d)
          },
          shapeConfig: {
            Line: {stroke: d => d.Category === "Average CPI" ? styles["majorelle-dark"] : styles["majorelle-light"]}
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Consumer Price Index", d => commas(d[d.Category])]]}
        }}
        />
      </SectionColumns>
    );
  }
}

ConsumerPriceIndex.defaultProps = {
  slug: "consumer-price-index"
};

ConsumerPriceIndex.need = [
  fetchData("consumerPriceIndexData", "/api/data?measures=Average CPI,Average CPI (Nation),Average CPI (Midwest)&drilldowns=Year")
];

const mapStateToProps = state => ({
  consumerPriceIndexData: state.data.consumerPriceIndexData
});

export default connect(mapStateToProps)(ConsumerPriceIndex);

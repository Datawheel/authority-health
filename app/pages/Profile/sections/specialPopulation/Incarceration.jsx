import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Glossary from "components/Glossary";
import Options from "components/Options";

const definitions = [
  {term: "Assaultive Offence Includes", definition: "Homicide, Robbery, Criminal Sexual Conduct  (CSC), Assault, Arson, Other Sex Offense, Burglary, Weapons Possession, etc."},
  {term: "Non-Assaultive Offence Includes", definition: "Larceny, Fraud, Forgery/Embezzle, Motor Vehicle, Malicious Destruction, Drugs, Operating Under the Influence of Liquor (OUIL), etc."},
  {term: "Probation", definition: "A term of supervision afforded either a convicted felon or a convicted misdemeanant by a court as an alternative to prison or jail, although some judges may sentence offenders to a combination of both probation and jail or boot camp."},
  {term: "Prison", definition: "A correctional facility where offenders serve a felony sentence imposed by the court under the supervision of the Michigan Department of Corrections."},
  {term: "Jail", definition: " A county institution that houses persons awaiting trial, unsentenced felons and misdemeanants, and sentenced misdemeanants and felons."}
];

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatName = data => {
  if (Array.isArray(data)) return data.map(d => d.replace("Incarceration", "").trim());
  return data.replace("Incarceration", "").trim();
};

const formatIncarcerationData = incarcerationData => {
  // Format data for Incarceration data Barchart and stats.
  const data = [];
  incarcerationData.data.forEach(d => {
    incarcerationData.source[0].measures.forEach(punishment => {
      if (d[punishment] !== null) {
        data.push(Object.assign({}, d, {Punishment: punishment}));
      }
    });
  });

  // Filter out "Total Incarcerations" from the Incarceration data.
  const filteredData = data.filter(d => d.Punishment !== "Total Incarcerations");
  nest()
    .key(d => d.Year)
    .entries(filteredData)
    .forEach(group => {
      const total = sum(group.values, d => d[d.Punishment]);
      group.values.forEach(d => d.share = d[d.Punishment] / total * 100);
    });
  // Find top recent year Incarceration data.
  const topIncarcerationData = filteredData.sort((a, b) => b.share - a.share)[0];
  return [filteredData, topIncarcerationData];
};

class Incarceration extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {
    const {meta, incarcerationData, allOffenceData, allPunishmentData} = this.props;

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isIncarcerationDataAvailableForCurrentGeography = incarcerationData.source[0].substitutions.length === 0;

    const topIncarcerationData = formatIncarcerationData(incarcerationData)[1];

    // Find top most offence for recent year.
    nest()
      .key(d => d.Year)
      .entries(allOffenceData)
      .forEach(group => {
        const total = sum(group.values, d => d["Total Incarcerations"]);
        group.values.forEach(d => d.share = d["Total Incarcerations"] / total * 100);
      });
    allOffenceData.sort((a, b) => b.share - a.share);
    const topOffenceData = allOffenceData[0];

    // Find top most Punishment data.
    const punishmentdata = [];
    allPunishmentData.data.forEach(d => {
      allPunishmentData.source[0].measures.forEach(punishment => {
        if (d[punishment] !== null) {
          punishmentdata.push(Object.assign({}, d, {Punishment: punishment}));
        }
      });
    });
    nest()
      .key(d => d.Punishment)
      .entries(punishmentdata)
      .forEach(group => {
        group.values.forEach(d => d.share = d[d.Punishment] / d["Total Incarcerations"] * 100);
      });
    const filteredPunishmetData = punishmentdata.filter(d => d.Punishment !== "Total Incarcerations");
    const topPunishmentData = filteredPunishmetData.sort((a, b) => b.share - a.share)[0];

    return (
      <SectionColumns>
        <SectionTitle>Incarceration</SectionTitle>
        <article>
          {!isIncarcerationDataAvailableForCurrentGeography &&
            <Disclaimer>Data is only available for {incarcerationData.data[0].Geography}</Disclaimer>
          }
          <Stat
            title="Most common crime"
            year={topOffenceData.Year}
            value={`${topOffenceData.Offense}`}
            qualifier={`(${formatPercentage(topOffenceData.share)})`}
          />
          <Stat
            title="Most common punishment"
            year={topPunishmentData.Year}
            value={`${formatName(topPunishmentData.Punishment)}`}
            qualifier={`(${formatPercentage(topPunishmentData.share)})`}
          />
          <p>In {topIncarcerationData.Year}, the most common crime in {topIncarcerationData.Geography} was {topOffenceData.Offense.toLowerCase()} ({formatPercentage(topOffenceData.share)}), and the most common punishment was {formatName(topPunishmentData.Punishment).toLowerCase()} ({formatPercentage(topPunishmentData.share)}).</p>
          <p>This chart shows the percentages of punishments broken down by offense type for all convicted crimes in {topIncarcerationData.Geography}.</p>

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Total Incarcerations,Prison Incarceration,Jail Incarceration,Jail/Probation Incarceration,Probation Incarceration,Other Incarceration&drilldowns=Offense&Geography=${meta.id}&Year=all` }
            title="Chart of Incarceration" />

          {/* Draw a Barchart to show Incarceration data. */}
          <BarChart ref={comp => this.viz = comp} config={{
            data: `/api/data?measures=Total Incarcerations,Prison Incarceration,Jail Incarceration,Jail/Probation Incarceration,Probation Incarceration,Other Incarceration&drilldowns=Offense&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 400,
            stacked: true,
            label: d => `${d.Offense}`,
            groupBy: "Offense",
            x: d => formatName(d.Punishment),
            y: "share",
            time: "Year",
            yConfig: {tickFormat: d => formatPercentage(d)},
            xConfig: {labelRotation: false},
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Punishment", d => formatName(d.Punishment)], ["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return formatIncarcerationData(resp)[0]; // pass resp and not resp.data since we access .data in the formatIncarcerationData() function.
          }}
          />
        </div>
      </SectionColumns>
    );
  }
}

Incarceration.defaultProps = {
  slug: "incarceration"
};

Incarceration.need = [
  fetchData("incarcerationData", "/api/data?measures=Total Incarcerations,Prison Incarceration,Jail Incarceration,Jail/Probation Incarceration,Probation Incarceration,Other Incarceration&drilldowns=Offense&Geography=<id>&Year=latest"),
  fetchData("allOffenceData", "/api/data?measures=Total Incarcerations&drilldowns=Offense&Geography=<id>&Year=latest", d => d.data),
  fetchData("allPunishmentData", "/api/data?measures=Total Incarcerations,Prison Incarceration,Jail Incarceration,Jail/Probation Incarceration,Probation Incarceration,Other Incarceration&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  incarcerationData: state.data.incarcerationData,
  allOffenceData: state.data.allOffenceData,
  allPunishmentData: state.data.allPunishmentData
});

export default connect(mapStateToProps)(Incarceration);

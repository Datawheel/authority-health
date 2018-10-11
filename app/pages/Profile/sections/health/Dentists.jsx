import React from "react";
import {connect} from "react-redux";

import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatAge = d => rangeFormatter(d);
const formatName = d => {
  const nameArr = d.split(",");
  return nameArr.reduce((acc, currValue, i) => i === 0 ? "" : acc.concat(currValue), "").trim();
};

class Dentists extends SectionColumns {

  render() {
    const {dentistsTypes} = this.props;
    const data = dentistsTypes.source[0].measures.map(d => {
      const result = dentistsTypes.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue[d] !== null) {
          return Object.assign({}, currentValue, {"Dentist Type": d});
        }
        return acc;
      }, null);
      return result;
    });

    return (
      <SectionColumns>
        <SectionTitle>Dentists</SectionTitle>
        <article>
          <Stat 
            title={"Number of Male Dentists with NPI"}
            value={data[0]["Dentists, Male w/NPI"]}
          />
          <p></p>
          <BarChart config={{
            data: "/api/data?measures=%23%20Active%20Dentists%20less%20than%2035,%23%20Active%20Dentists%2035,%23%20Active%20Dentists%2045,%23%20Active%20Dentists%2055,%23%20Active%20Dentists%2065%20or%20more,%23%20Active%20Dentists%20Age%20Unknown&Year=all",
            discrete: "x",
            height: 400,
            groupBy: "Age",
            x: d => d.Age,
            y: d => d[d.Age],
            time: "ID Year",
            legend: false,
            xSort: (a, b) => a["ID Age"] - b["ID Age"],
            xConfig: {
              labelRotation: false,
              tickFormat: d => formatAge(d) === "None" ? "Unkn" : formatAge(d)
            },
            shapeConfig: {label: false},
            tooltipConfig: {tbody: [["Value", d => d[d.Age]]]}
          }}
          dataFormat={resp => {
            const data = [];
            nest()
              .key(d => d.Year)
              .entries(resp.data)
              .forEach(group => {
                resp.source[0].measures.map((d, i) => {
                  const result = group.values.reduce((acc, currentValue) => {
                    if (acc === null && currentValue[d] !== null) {
                      return Object.assign({}, currentValue, {"Age": d, "ID Age": i});
                    }
                    return acc;
                  }, null);
                  data.push(result);
                });
              });
            return data;
          }}
          />
        </article>

        <BarChart config={{
          data,
          discrete: "y",
          height: 500,
          groupBy: "Dentist Type",
          legend: false,  
          x: d => d[d["Dentist Type"]],
          y: d => d["Dentist Type"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => formatAbbreviate(d)
          },
          yConfig: {tickFormat: d => formatName(d)},
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => d[d["Dentist Type"]]]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Dentists.defaultProps = {
  slug: "dentists"
};

Dentists.need = [
  fetchData("dentistsTypes", "/api/data?measures=Dentists%2C%20Male%20w%2FNPI,Dentists%2CFemale%20w%2FNPI,Dentists%2C%20Total%2C%20Priv%20Pract%2C%20FT,Dentists%2C%20Total%2C%20Priv%20Pract%2C%20PT,Dent%2C%20Total%20Male%2C%20Priv%20Pract,Dent%2C%20Total%20Female%2C%20Priv%20Pract,Dentists%2C%20No%20Longer%20in%20Practice,Dentists%2C%20State%20or%20Local%20Govt,Dentists%2C%20Grad%20Student%2FResident&Year=all")
];

const mapStateToProps = state => ({
  dentistsTypes: state.data.dentistsTypes
});

export default connect(mapStateToProps)(Dentists);

import React, {Component} from "react";
import "./Stat.css";

export default class Stat extends Component {

  render() {

    const {
      qualifier,
      theme,
      title,
      value,
      year
    } = this.props;

    let themeClass;
    if (theme) {
      themeClass = `${theme}-color`;
    }
    else {
      themeClass = "majorelle-dark-color";
    }

    return (
      <dl className="stat">
        <dt className="stat-label title font-xs">
          { title }
          { year &&
            <span className="stat-label-year"> {year}</span>
          }
        </dt>
        <dd className={`stat-value title ${ themeClass }`}>
          { value &&
            <span className={`${typeof value === "string" && value.length < 30 ? "font-md" : "font-sm"}`}> {value} </span>
          }
          { qualifier &&
            <span className={`stat-value-qualifier ${
              qualifier.length > 20 ? "font-xs" : "font-sm"
            }`}> {qualifier}</span>
          }
        </dd>
      </dl>
    );
  }
}

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
      themeClass = `${theme}-dark-color`;
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
        <dd className={`stat-value title ${ value.length > 30 ? "font-md" : "font-lg" } ${ themeClass }`}>
          { value }
          { qualifier &&
            <span className="stat-value-qualifier font-sm"> ({qualifier})</span>
          }
        </dd>
      </dl>
    );
  }
}

import React, {Component} from "react";
import "./StatGroup.css";

export default class StatGroup extends Component {
  render() {
    const {stats, title, year} = this.props;

    // define list items
    let statsList = stats;
    if (stats) {
      statsList = stats.map(stat =>
        <li
          className={`stat-group-item stat-value title font-md ${ stat.color || "majorelle" }-dark-color` }
          key={stat.title}
        >
          <span className="stat-prepend font-xs u-uppercase">{ stat.title }: </span>
          { stat.value }{" "}
          { stat.qualifier &&
            <span className="stat-value-qualifier font-xs"> {stat.qualifier}</span>
          }
        </li>
      );
    }

    return (
      <div className="stat-group">
        <h3 className="stat-label title font-xs">
          { title || "missing `title` prop in StatGroup.jsx"}
          { year &&
            <span className="stat-label-year"> {year}</span>
          }
        </h3>
        {statsList &&
          <ul className="stat-group-list u-list-reset">
            { statsList }
          </ul>
        }
      </div>
    );
  }
}

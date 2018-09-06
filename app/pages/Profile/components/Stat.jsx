import React, {Component} from "react";
import "./Stat.css";

export default class Stat extends Component {

  render() {

    const {diabetes, title, value} = this.props;

    return (
      <div className="stat">
        <div className="title">{ title }</div>
        <div className="value">Population: { value }</div>
        <div className="value">Diabetes: { diabetes }%</div>
      </div>
    );
  }
}

import React, {Component} from "react";
import "./Stat.css";

export default class Stat extends Component {

  render() {

    const {title, value} = this.props;

    return (
      <div className="stat">
        <div className="title">{ title }</div>
        <div className="value">{ value }</div>
      </div>
    );
  }
}

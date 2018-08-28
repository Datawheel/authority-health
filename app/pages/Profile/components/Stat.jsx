import React, {Component} from "react";
import "./Stat.css";

export default class Stat extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="stat">
        <div className="title">{ this.props.title }</div>
        <div className="value">{ this.props.value }</div>
      </div>
    );
  }
}

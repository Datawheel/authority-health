import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";

class Stat extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {population} = this.props;
    console.log("population from Stat: ", population);

    return (
      <div className="stat">
        <div className="title">{ this.props.title }</div>
      </div>
    );
  }
}

Stat.need = [
  fetchData("population", "https://canon.datausa.io/api/data?measures=Total%20Population&Geography=16000US2684940&year=latest")
];

export default connect(state => ({population: state.data}))(Stat);

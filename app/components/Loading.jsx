import React, {Component} from "react";
import {connect} from "react-redux";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";
import "./Loading.css";

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.
*/
class Loading extends Component {
  render() {
    const {progress, total} = this.props;
    return <NonIdealState
      className="loading"
      title="Please Wait"
      description={ total ? `Loading ${progress} of ${total} Datasets` : undefined }
      visual={ total ? <ProgressBar value={progress / total} /> : undefined } />;
  }
}

export default connect(state => ({
  total: state.loadingProgress.requests,
  progress: state.loadingProgress.fulfilled
}))(Loading);

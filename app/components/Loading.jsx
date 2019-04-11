import React, {Component} from "react";
import {connect} from "react-redux";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";
import "./Loading.css";

class Logos extends Component {
  render() {
    const {progress, total} = this.props;
    return <div>
      <img className="loading-logo-img" src="/images/authority-health-logo.png" srcSet="/images/authority-health-logo.svg 1x" alt=""/>
      <span className="u-visually-hidden">Authority Health</span>
      { total ? <ProgressBar value={progress / total} /> : null }
      <h4 className="pt-non-ideal-state-title">{ total ? `${progress} of ${total} Datasets Loaded` : "Please Wait" }</h4>
      <a className="powered-by" href="https://www.datawheel.us/" target="_blank" rel="noopener noreferrer">
        Powered by <img className="loading-datawheel-img" src="/images/logos/datawheel-logo-mustard.png" srcSet="/images/logos/datawheel-logo-mustard.svg 1x" alt=""/>
      </a>
    </div>;
  }
}

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.
*/
class Loading extends Component {
  render() {
    const {progress, total} = this.props;
    return <NonIdealState
      className="loading"
      visual={ <Logos progress={progress} total={total} /> } />;
  }
}

export default connect(state => ({
  total: state.loadingProgress.requests,
  progress: state.loadingProgress.fulfilled
}))(Loading);

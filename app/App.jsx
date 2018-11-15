import React, {Component} from "react";
import PropTypes from "prop-types";
import MainNav from "./components/MainNav";
import Footer from "./components/Footer";
import "./App.css";

export default class App extends Component {

  getChildContext() {
    return {
      router: this.props.router
    };
  }

  render() {
    const {children} = this.props;

    return (
      <div className="outer-container">
        <MainNav />
        <main className="main-container" role="main">
          { children }
        </main>
        <Footer />
      </div>
    );
  }

}

App.childContextTypes = {
  router: PropTypes.object
};

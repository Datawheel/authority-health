import React, {Component} from "react";

export default class Profile extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {this.props.router.params.geo_id}
      </div>
    );
  }
}

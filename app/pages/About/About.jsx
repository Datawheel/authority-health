import React, {Component} from "react";
import ProfileTileList from "../../components/ProfileTileList";
import "./About.css";

export default class Home extends Component {

  render() {
    return (
      <div className="about">
        <div className="about-hero dark-theme">
          <h1>About the Authority Health Data Portal</h1>
        </div>

        <div className="about-main content">
          <h2>How to use the portal</h2>

          <p>Welcome to the Data Portal for Wayne County! We are pleased to present health and social determinant data for Wayne County and its component cities. On this site you will find profile pages for city and zip code level geographies to easily visualize health outcomes, as well as social, economic, and environmental factors.</p>

          <p>Anyone who is interested in using data to better match programs and services with specific populations, identify mismatches between resources and outcomes, and better serve population health needs in the interest of improving health equity can use this site.</p>

          <h2>For example, the data portal can help:</h2>

          <ul>
            <li>Community members and organizations find data for funding opportunities/grant applications.</li>
            <li>Service providers pinpoint the location of clinics and programs.</li>
            <li>Researchers identify interesting patterns to inform research.</li>
            <li>Public health professionals justify and increase budgets for specific programs.</li>
            <li>Health systems produce IRS-mandated community health needs assessments <em>(CHNAs)</em>.</li>
          </ul>

          <p>Whenever possible, the health-related data is available at the zip code and/or census tract level to allow users to make the most informed decisions for their communities. You can interactively explore the data in three ways:</p>

          <ol>
            <li>mapping at the County (zip code) and City (census tract) levels,</li>
            <li>selecting topics and metrics via a drop-down menu, or</li>
            <li>producing a community report by inputting a city name or zip code.</li>
          </ol>
        </div>
      </div>
    );
  }
}

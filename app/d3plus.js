import styles from "style.yml";

const bad = styles.danger;
const typeface = "Lato, sans-serif";
const defaultFontColor = styles["dark-3"];
const headingFontColor = styles.black;
const fontSizeSm = 12;
const fontSizeLg = 18;

const badMeasures = [
  "Low-Income Not Served by Health Centers",
  "Percent Change in Health Center Uninsured Patient Population (1-Year)",
  "Poverty Rate"
];

export {badMeasures};

// create array of category groupings to loop through
const groupings = [
  "Group",
  "Age Group",
  "Race",
  "Race Group",
  "RaceType",
  "SmokingType",
  "Health Insurance coverage:type",
  "Coverage Type",
  "Sex",
  "Gender",
  "Sex of Partner",
  "Responsibility Length",
  "Offense",
  "Median Rent Amount",
  "Household Income Bucket",
  "Household Income",
  "Level of School",
  "Family type",
  "Period of Service",
  "Type of Crime",
  "Pollutant",
  "Travel Time",
  // Health center demographics
  "American Indian/Alaska Native Health Center Patient Population",
  "Asian Health Center Patient Population",
  "Black Health Center Patient Population",
  "Hispanic Health Center Patient Population",
  "Non-white Health Center Patient Population",
  "White Health Center Patient Population",
  // smoking status
  "Smoking Status Current",
  "Smoking Status Former",
  "Smoking Status Never",
  // air quality
  "Category" // air quality days
];

/** function to lookup & assign color scheme */
function colorLogic(d) {
  // console.log(grouping, d[grouping]);
  // styles[`color-${d[grouping]}`] ? console.log(styles[`color-${d[grouping]}`]) : null;

  // lookup grouping color schemes in style.yml
  for (const grouping of groupings) {
    if (d[grouping]) {
      // console.log(grouping, d[grouping]);
      // console.log(styles[`color-${d[grouping]}`]
      //   ? styles[`color-${d[grouping]}`]
      //   : styles["majorelle-dark"]);
      return styles[`color-${d[grouping]}`]
        ? styles[`color-${d[grouping]}`]
        : styles["majorelle-dark"];
    }
  }

  // if a visualization is totally purple, it probably doesn't yet have a color scheme assigned
  return Object.keys(d).some(v => badMeasures.includes(v)) ? bad : styles["majorelle-dark"];
}

// shared styles for y & x axis
const axisConfig = {
  // main bar lines
  barConfig: {
    "stroke": styles["dark-1"],
    "stroke-width": 1
  },
  // secondary grid lines
  gridConfig: {
    "stroke": styles["light-3"],
    "stroke-width": 0.5
  },
  // axis title labels
  titleConfig: {
    fontFamily: () => typeface,
    fontColor: headingFontColor
  },
  // value labels
  shapeConfig: {
    labelConfig: {
      fontColor: defaultFontColor,
      fontFamily: () => typeface,
      fontMax: fontSizeLg
    }
  },
  // death to ticks
  tickSize: 0
};


// defaults
export default {
  shapeConfig: {
    fill: colorLogic,
    fontFamily: () => typeface,
    labelConfig: {
      fontFamily: () => typeface,
      fontMax: fontSizeLg
    },
    // stacked area
    Area: {
      labelConfig: {
        fontColor: styles.white,
        fontFamily: () => typeface,
        fontMax: fontSizeLg
      }
    },
    // sets all BarChart labels to "styles.white"
    Bar: {
      labelConfig: {
        fontColor: styles.white
      }
    },
    // sets all Pie chart labels to "styles.white"
    Circle: {
      labelConfig: {
        fontColor: styles.white
      }
    },
    // set all Treemap labels to "styles.white"
    Rect: {
      labelConfig: {
        fontColor: styles.white,
        fontMax: 20,
        fontMin: 8,
        fontResize: true,
        padding: 5
      }
    },
    // line charts
    Line: {
      stroke: colorLogic,
      curve: "catmullRom",
      strokeLinecap: "round",
      strokeWidth: 2
    },
    // keep map locations visible; override in pie charts
    Path: {
      fillOpacity: 0.75
    }
  },
  // prevent map scrolljacking
  zoomScroll: false,
  // map color scale key
  colorScaleConfig: {
    // default to green
    color: [
      styles["majorelle-white"],
      styles["majorelle-light"],
      styles["majorelle-medium"],
      styles["majorelle-dark"]
    ],
    // the key itself
    rectConfig: {
      height: 12,
      strokeWidth: 0
    },
    axisConfig: {
      // bar underneath the key
      barConfig: {
        stroke: "transparent",
        strokeWidth: 0
      },
      // death to ticks
      tickSize: 0
    },
    legendConfig: {
      // labels are directly in the shape
      shapeConfig: {
        fontColor: headingFontColor,
        fontFamily: () => typeface,
        fontResize: false,
        maxFont: fontSizeSm,
        height: fontSizeSm,
        width: fontSizeSm,
        // legend icons
        labelConfig: {
          fontColor: defaultFontColor,
          fontFamily: () => typeface
        }
      }
    },
    // scale type
    scale: "jenks"
  },
  // legend defaults
  legendConfig: {
    // labels are directly in the shape
    shapeConfig: {
      fontColor: headingFontColor,
      fontFamily: () => typeface,
      fontResize: false,
      maxFont: fontSizeSm,
      height: fontSizeSm,
      width: fontSizeSm,
      // legend icons
      labelConfig: {
        fontColor: defaultFontColor,
        fontFamily: () => typeface
      }
    }
  },
  innerRadius: 1,
  loadingHTML: `<div style="left: 50%; top: 50%; position: absolute; transform: translate(-50%, -50%);">
  <svg class="cp-viz-spinner" width="60px" height="60px" viewBox="0 0 317 317" xmlns="http://www.w3.org/2000/svg">
    <path class="outer" d="M16.43 157.072c0 34.797 12.578 66.644 33.428 91.277l-11.144 11.141c-23.673-27.496-37.992-63.283-37.992-102.418 0-39.133 14.319-74.921 37.992-102.423l11.144 11.144c-20.85 24.63-33.428 56.481-33.428 91.279z"/>
    <path class="outer" d="M157.793 15.708c34.798 0 66.648 12.58 91.28 33.427l11.143-11.144c-27.502-23.676-63.29-37.991-102.423-37.991-39.132 0-74.919 14.315-102.422 37.991l11.148 11.144c24.627-20.847 56.477-33.427 91.274-33.427"/>
    <path class="outer" d="M299.159 157.072c0 34.797-12.578 66.644-33.43 91.277l11.145 11.141c23.674-27.496 37.992-63.283 37.992-102.418 0-39.133-14.318-74.921-37.992-102.423l-11.145 11.144c20.852 24.63 33.43 56.481 33.43 91.279"/>
    <path class="outer" d="M157.793 298.432c-34.797 0-66.647-12.574-91.274-33.424l-11.148 11.138c27.503 23.682 63.29 37.997 102.422 37.997 39.133 0 74.921-14.315 102.423-37.997l-11.143-11.138c-24.632 20.85-56.482 33.424-91.28 33.424"/>
    <path class="middle" d="M226.59 61.474l-7.889 13.659c24.997 18.61 41.184 48.382 41.184 81.94 0 33.555-16.187 63.329-41.184 81.936l7.889 13.664c29.674-21.394 49.004-56.23 49.004-95.6 0-39.373-19.33-74.21-49.004-95.599"/>
    <path class="middle" d="M157.793 259.169c-52.398 0-95.553-39.485-101.399-90.317h-15.814c5.912 59.524 56.131 106.018 117.213 106.018 17.26 0 33.633-3.742 48.404-10.406l-7.893-13.672c-12.425 5.38-26.114 8.377-40.511 8.377"/>
    <path class="middle" d="M157.793 54.976c14.397 0 28.086 2.993 40.511 8.371l7.893-13.667c-14.771-6.669-31.144-10.412-48.404-10.412-61.082 0-111.301 46.493-117.213 106.021h15.814c5.846-50.831 49.001-90.313 101.399-90.313"/>
    <path class="inner" d="M95.371 164.193c-3.476-30.475 15.471-58.324 43.723-67.097l-1.804-15.842c-36.899 9.931-61.986 45.602-57.524 84.719 4.461 39.115 36.934 68.219 75.122 69.584l-1.806-15.838c-29.504-2.186-54.235-25.054-57.711-55.526"/>
    <path class="inner" d="M162.504 94.425c29.508 2.185 54.235 25.053 57.711 55.529 3.476 30.469-15.466 58.319-43.724 67.096l1.806 15.834c36.898-9.927 61.986-45.598 57.525-84.712-4.461-39.117-36.936-68.223-75.125-69.588l1.807 15.841z"/>
  </svg>
  <strong>Loading</strong>
  <sub style="bottom: 0; display: block; line-height: 1; margin-top: 5px;">
    <a style="color: inherit;" href="https://www.datawheel.us/" target="_blank">
      Built by Datawheel
    </a>
  </sub>
</div>`,
  padPixel: 2,
  // timeline defaults
  timelineConfig: {
    brushing: false,
    buttonHeight: 20,
    buttonPadding: 10,
    // main horizontal bar line
    barConfig: {
      stroke: styles["dark-1"],
      opacity: 0.75
    },
    shapeConfig: {
      // ticks and/or button bg
      fill: styles["light-3"],
      stroke: "none",
      // label and/or button text
      labelConfig: {
        fontColor: defaultFontColor
      }
    }
  },
  titleConfig: {
    fontColor: defaultFontColor,
    fontFamily: () => typeface,
    padding: 0
  },
  totalConfig: {
    fontColor: defaultFontColor,
    fontFamily: () => typeface,
    fontSize: () => fontSizeSm
  },
  // default visualization height
  height: 400,
  // axis defaults (see line 8)
  xConfig: axisConfig,
  yConfig: axisConfig
};

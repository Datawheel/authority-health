module.exports = {
  healthTopics: [
    {measure: "Life Expectancy", depth: ["County", "Tract"], latestYear: "", cube: "NVSS - Life Expectancy"},
    {measure: "Heart Disease", depth: ["County", "Zip Region"], latestYear: "2016", cube: "MiBRFS - All Years"},
    {measure: "Coronary Heart Disease", depth: ["Place", "Tract"], latestYear: "2015", cube: "500 Cities"},
    {measure: "High Blood Pressure", depth: ["Place", "Tract"], latestYear: "2015", cube: "500 Cities"},
    {measure: "High Cholesterol", depth: ["Place", "Tract"], latestYear: "2015", cube: "500 Cities"},
    {measure: "COPD", depth: ["Place", "Tract"], latestYear: "2015", cube: "500 Cities"},
    {measure: "Current Asthma", depth: ["County", "Zip Region"], latestYear: "2016", cube: "MiBRFS - All Years"},
    {measure: "Diabetes", depth: ["Place", "Tract"], latestYear: "2015", cube: "500 Cities"},
    {measure: "Obesity", depth: ["Place", "Tract"], latestYear: "2015", cube: "500 Cities"},
    {measure: "Ever Depressive", depth: ["County", "Zip Region"], latestYear: "2016", cube: "MiBRFS - All Years"},
    {measure: "Poor Mental Health 14 Or More Days", depth: ["County", "Zip Region"], latestYear: "2016", cube: "MiBRFS - All Years"},
    {measure: "Monthly Alcohol Consumption", depth: ["County", "Zip Region"], latestYear: "2016", cube: "MiBRFS - All Years"},
    {measure: "Binge Drinking", depth: ["Place", "Tract"], latestYear: "2015", cube: "500 Cities"},
    {measure: "Current Smoking", depth: ["Place", "Tract"], latestYear: "2015", cube: "500 Cities"}
  ],
  socialDeterminants: [
    {measure: "Distress Score", depth: ["Zip"], latestYear: "2017", cube: "DCI"},
    {measure: "Poverty Rate", depth: ["Zip"], latestYear: "2017", cube: "DCI"},
    {measure: "High School Dropout Rate", depth: ["Zip"], latestYear: "2017", cube: "DCI"},
    {measure: "Wage GINI", depth: ["County", "Place", "Tract", "Zip"], latestYear: "2016", cube: "acs_yg_gini_5"},
    {measure: "Health Centers", depth: ["Zip"], latestYear: "2014", cube: "UDS Mapper - Heatlh Centers"},
    {measure: "Health Center Penetration", depth: ["Zip"], latestYear: "2014", cube: "UDS Mapper - Heatlh Centers"},
    {measure: "Low-Income Health Center Penetration", depth: ["Zip"], latestYear: "2014", cube: "UDS Mapper - Heatlh Centers"},
    {measure: "Uninsured Health Center Penetration", depth: ["Zip"], latestYear: "2014", cube: "UDS Mapper - Heatlh Centers"}
  ]
};
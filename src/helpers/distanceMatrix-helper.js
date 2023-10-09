const { GOOGLE_KEY } = require("../config"),
  fetch = require("node-fetch"),
  distanceMatrixHelper = async ({ mode, transit, to, from }) =>
    fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from}&destinations=${to}&mode=${mode}&units=imperial&transit_mode=${
        transit ? transit : ""
      }&key=${GOOGLE_KEY}`,
      { method: "GET" }
    )
      .then((data) => data.json())
      .catch((error) => error);

module.exports = distanceMatrixHelper;

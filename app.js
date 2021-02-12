const express = require("express");
const app = express();
const https = require("https");
require("dotenv").config();
const port = process.env.PORT || 8000;

const BodyParser = require("body-parser");
app.use(BodyParser.urlencoded({ extended: true }));

const fs = require("fs");
const dataOutput = fs.readFileSync("dataOutput.html", "utf-8");

app.use(express.static('public'))
app.use('/', express.static('public'))

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

  temperature = temperature.replace("{%weatherDes%}", orgVal.weather[0].description);
  temperature = temperature.replace("{%windSpeed%}", orgVal.wind.speed);
  // console.log(orgVal.weather[0].icon);
 
  return temperature;
};

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/dataInput.html");
});

app.post("/weatherdata", function (req, res) {
  const query = req.body.cityName;
  const apiKey = process.env.APIkey;
  const unit = "metric";
  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    query +
    "&APPID=" +
    apiKey +
    "&units=" +
    unit;
  https.get(url, (response) => {
    console.log(response.statusCode);

    response.on("data", (data) => {
      //'data' inbuilt event
      const WeatherObjData = JSON.parse(data);

      const realTimeData = replaceVal(dataOutput, WeatherObjData);
      res.write(realTimeData);
    });
    response.on("end", (err) => {
      if (err) return console.log("connection closed due to errors", err);
      res.end();
    });
  });
});

app.listen(port, function () {
  console.log(`server is running on port number ${port}`);
});

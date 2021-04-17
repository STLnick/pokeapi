const express = require("express");
const app = express();
const {
  corsOptionsRequests,
  corsSimpleRequests,
} = require("./middleware/cors");
const bodyParser = require("body-parser");
const removePoweredBy = require("./middleware/removePoweredBy");

const Pokemon = require("./services/pokemon");

app.options("*", corsOptionsRequests);
app.use(corsSimpleRequests);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(removePoweredBy);

app.post("/pokemon", Pokemon);

module.exports = app;

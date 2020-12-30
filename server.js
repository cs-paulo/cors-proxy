var express = require("express"),
  axios = require("axios"),
  bodyParser = require("body-parser"),
  app = express();

var myLimit = typeof process.argv[2] != "undefined" ? process.argv[2] : "100kb";
console.log("Using limit: ", myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.all("*", async function (req, res, next) {
  // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    req.header("access-control-request-headers")
  );

  if (req.method === "OPTIONS") {
    // CORS Preflight
    res.send();
  } else {
    var targetURL = req.header("Target-URL");
    if (!targetURL) {
      res.send(500, { error: "There is no Target-URL header in the request" });
      return;
    }
    const headers = {};

    // fix no Auth Header crash
    if (req.header("Authorization")) {
      headers["Authorization"] = req.header("Authorization");
    }

    try {
      const result = await axios({
        url: targetURL + req.url,
        method: req.method,
        data: req.body,
        headers,
      });
      if (result && result.data) {
        res.send(result.data);
      } else {
        res.send("fail");
      }
    } catch (e) {
      res.send("fail");
    }
  }
});

app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), function () {
  console.log("Proxy server listening on port " + app.get("port"));
});

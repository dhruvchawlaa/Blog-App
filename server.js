var express = require("express");
var path = require("path");
var app = express();
const { initialize, getAllPosts, getPublishedPosts, getCategories } = require("./blog-service.js");
var posts = require("./data/posts.json");
var categories = require("./data/categories.json");

app.use(express.static("public"));

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}


// ========== Home Page Route ==========
app.get("/", function (req, res) {
  res.redirect("/about");
});

// ========== About Page Route ==========
app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

// ========== Blog Page Route ==========
app.get("/blog", function (req, res) {
  getPublishedPosts().then((data) => {
    res.send(data);
  })
  .catch((err) => {
    res.send("Error reading data");
  })
});

// ========== Posts Page Route ==========
app.get("/posts", function (req, res) {
  getAllPosts().then((data) => {
    res.send(data);
  })
  .catch((err) => {
    res.send("Error reading data");
  })
});

// ========== Categories Page Route ==========
app.get("/categories", function (req, res) {
  getCategories().then((data) => {
    res.send(data);
  })
  .catch((err) => {
    res.send("Error reading data");
  })
});

// ========== 404 Page Route ==========
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/notFound.html"));
});

// ========== Check the initialization and start listening ==========
initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
.catch((err) => {
    res.send("Error reading data")
})
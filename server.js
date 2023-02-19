var express = require("express");
var path = require("path");
var app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById
} = require("./blog-service.js");

app.use(express.static("public"));

var HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: "dltvx2iag",
  api_key: "175944967494452",
  api_secret: "hZwrEsLpS62xuEJDYyV96b7oZZs",
  secure: true,
});

const upload = multer();

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
  getPublishedPosts()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send("Error reading data");
    });
});

// ========== Posts Page Route ==========
app.get("/posts", function (req, res) {
  if (req.query.category) {
    getPostsByCategory(req.query.category)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send("Error reading data");
      });
  } 
  
  else if (req.query.minDate) {
    getPostsByMinDate(req.query.minDate)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send("Error reading data");
      });
  } 
  
  else {
    getAllPosts()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send("Error reading data");
      });
  }
});

// ========== Post by Id route ==========
app.get("/post/:value", (req, res) => {
    getPostById(req.params.value)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send("Error reading data");
      })    
  })

// ========== Categories Page Route ==========
app.get("/categories", function (req, res) {
  getCategories()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send("Error reading data");
    });
});

// ========== Add Posts Page Route ==========
app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

// ========== Post Route ==========
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req)
    .then((uploaded) => {
      req.body.featureImage = uploaded.url;
      let blogPost = {};

      blogPost.body = req.body.body;
      blogPost.title = req.body.title;
      blogPost.postDate = Date.now();
      blogPost.category = req.body.category;
      blogPost.featureImage = req.body.featureImage;
      blogPost.published = req.body.published;

      if (blogPost.title) {
        addPost(blogPost);
      }
      res.redirect("/posts");
    })
    .catch((err) => {
      res.send(err);
    });
});

// ========== 404 Page Route ==========
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/notFound.html"));
});

// ========== Check the initialization and start listening ==========
initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    res.send("Error reading data");
  });

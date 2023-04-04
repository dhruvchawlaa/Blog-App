/*********************************************************************************
 *  WEB322 – Assignment 06
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part
 *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Dhruv Chawla Student ID: 158310219 Date: 04-Apr-2023
 *
 *  Online (Cyclic) Link: https://lively-gray-quail.cyclic.app/
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
const app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const blogData = require("./blog-service");
const authData = require("./auth-service");
const clientSessions = require("client-sessions");
const {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById,
} = require("./blog-service.js");

app.use(express.static("public"));

// Setup client-sessions
app.use(
  clientSessions({
    cookieName: "session",
    secret: "blogapplication_web322",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// This will add the property "activeRoute" to "app.locals" whenever the route changes
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.use(express.urlencoded({ extended: true }));

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);
app.set("view engine", ".hbs");

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
app.get("/", (req, res) => {
  res.redirect("/blog");
});

// ========== About Page Route ==========
app.get("/about", (req, res) => {
  res.render("about");
});

// ========== Blog Page Route ==========
app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogData.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

// Display the latest blog post available by blog post id
app.get("/blog/:id", ensureLogin, async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogData.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blogData.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

// ========== Posts Page Route ==========
app.get("/posts", ensureLogin, (req, res) => {
  if (req.query.category) {
    getPostsByCategory(req.query.category)
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else if (req.query.minDate) {
    getPostsByMinDate(req.query.minDate)
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else {
    getAllPosts()
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
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
    });
});

// ========== Categories Page Route ==========
app.get("/categories", ensureLogin, (req, res) => {
  getCategories()
    .then((data) => {
      data.length > 0
        ? res.render("categories", { categories: data })
        : res.render("categories", { message: "No Results" });
    })
    .catch(() => {
      res.render("categories", { message: "no results" });
    });
});

// ========== Add Categories Route ==========
app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
});

// ========== Add Categories Post Route ==========
app.post("/categories/add", ensureLogin, (req, res) => {
  let catObject = {};
  catObject.category = req.body.category;
  console.log(req.body.category);
  if (req.body.category != "") {
    addCategory(catObject)
      .then(() => {
        res.redirect("/categories");
      })
      .catch(() => {
        console.log("Error!");
      });
  }
});

// ========== Delete Category By ID Route ==========
app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {
      console.log("Unable to remove category / Category not found");
    });
});

// ========== Delete Post By ID Route ==========
app.get("/posts/delete/:id", ensureLogin, (req, res) => {
  deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch(() => {
      console.log("Unable to remove post / Post not found");
    });
});

// ========== Add Posts Page Route ==========
app.get("/posts/add", ensureLogin, (req, res) => {
  getCategories()
    .then((categories) => {
      res.render("addPost", { categories: categories });
    })
    .catch(() => {
      res.render("addPost", { categories: [] });
    });
});

// ========== Add Posts (Post) Route ==========
app.post(
  "/posts/add",
  ensureLogin,
  upload.single("featureImage"),
  (req, res) => {
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
  }
);

// ========== Login Page Route ==========
app.get("/login", (req, res) => {
  res.render("login");
});

// ========== Register Page Route ==========
app.get("/register", (req, res) => {
  res.render("register");
});

// ========== Register Page Route (POST) ==========
app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

// ========== Login Page Route (POST) ==========
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/posts");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

// ========== Logout Page Route ==========
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// ========== User History Page Route ==========
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

// ========== 404 Page Route ==========
app.use((req, res) => {
  res.status(404).render("404");
});

// ========== Check the initialization and start listening ==========
blogData
  .initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    res.send("Error reading data!");
  });

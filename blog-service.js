const fs = require("fs");
var path = require("path");

// Arrays
let posts = [];
path;
let categories = [];

// ========== Read the contents of posts.json and categories.json and store them into arrays ==========
function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, "/data/posts.json"),"utf8",(err, data) => {
        if (err) {
          reject("Unable to read file");
        }
        posts = JSON.parse(data);

        fs.readFile(path.join(__dirname, "/data/categories.json"),"utf8",(err, data) => {
            if (err) {
              reject("Unable to read file");
            }
            categories = JSON.parse(data);

            resolve();
          });
      });
  });
}

// ========== Provides the full array of "posts" objects ==========
function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length == 0) {
      reject("No results returned");
    } else {
      resolve(posts);
    }
  });
}

// ========== Provides an array of "posts" objects whose published property is true ==========
function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    let publishedPosts = [];
    posts.forEach((post) => {
      if (post.published == true) {
        publishedPosts.push(post);
      }
    });

    if (publishedPosts.length == 0) {
      reject("No results returned");
    } else {
      resolve(publishedPosts);
    }
  });
}

// ========== Provide the full array of "category" objects ==========
function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length == 0) {
      reject("No results returned");
    } else {
      resolve(categories);
    }
  });
}

module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories };
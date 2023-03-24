const Sequelize = require("sequelize");
const { gte } = Sequelize.Op;

var sequelize = new Sequelize(
  "tzkgfcnn",
  "tzkgfcnn",
  "fnCGUHwtZwPeAuGWUeFAwfWWU2WWucQy",
  {
    host: "mahmud.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

// ========== Defining a "Post" model ==========
const Post = sequelize.define("Post", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

// ========== Defining a "Category" model ==========
const Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

// This will ensure that our Post model gets a "category" column that will act as a foreign key to the Category model
Post.belongsTo(Category, { foreignKey: "category" });

// ========== Read the contents of posts.json and categories.json and store them into arrays ==========
function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("Unable to sync to the database.");
      });
  });
}

// ========== Provides the full array of "posts" objects ==========
function getAllPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// ========== Provides an array of "posts" objects whose published property is true ==========
function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// ========== Provide the full array of "category" objects ==========
function getCategories() {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// ========== Adding a new post ==========
function addPost(postData) {
  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;
    for (const i in postData) {
      if (postData[i] === "") {
        postData[i] = null;
      }
    }
    postData.postDate = new Date();
    Post.create(postData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to create post");
      });
  });
}

// ========== Get posts by category ==========
function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        category: category,
      },
    })
      .then((data) => {
        console.log(category);
        resolve(data);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// ========== Get posts by minDate ==========
function getPostsByMinDate(minDate) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr),
        },
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// ========== Get posts by ID ==========
function getPostById(id) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        id: id,
      },
    })
      .then((data) => {
        resolve(data[0]);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// ========== Produces posts that are both published and filtered by category ==========
function getPublishedPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        category: category,
        published: true,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// ========== Add new category ==========
function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    for (let i in categoryData) {
      if (categoryData[i] === "") {
        categoryData[i] = null;
      }
    }

    Category.create(categoryData)
      .then((category) => {
        resolve(category);
      })
      .catch(() => {
        reject("Unable to create category");
      });
  });
}

// ========== Delete category by id ==========
function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve("Destroyed");
      })
      .catch(() => {
        reject("Unable to delete category");
      });
  });
}

// ========== Delete post by id ==========
function deletePostById(id) {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve("Destroyed");
      })
      .catch(() => {
        reject("Unable to delete post");
      });
  });
}

module.exports = {
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
};

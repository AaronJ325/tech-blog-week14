const express = require("express");
const router = express.Router();
const isLoggedIn = require("../../utils/is-logged-in");
const sequelize = require("../../models/db/database-connection");
const { Post, User } = require("../../models");

router.get("/", isLoggedIn, (req, res) => {
  Post.findAll({
    where: {
      user_id: req.session.user_id,
    },

    attributes: [
      "id",
      "title",
      "content",
      "createdAt",
      [
        sequelize.literal(
          "(SELECT COUNT (*) FROM comment  WHERE comment.post_id = post.id)"
        ),
        "comment_count",
      ],
    ],
    order: [["createdAt", "DESC"]],
  }).then((userData) => {
    const userPosts = userData.map((post) => post.get({ plain: true })); 
    res.render("dashboard", {
      userPosts,
      loggedIn: req.session.loggedIn,
      username: req.session.username,
    });
  });
});

router.get("/add", isLoggedIn, (req, res) => {
  res.render("add-post", {
    loggedIn: req.session.loggedIn,
    username: req.session.username,
  });
});

router.get("/edit/:id", isLoggedIn, (req, res) => {
  Post.findOne({
    attributes: ["user_id", "title", "content", "createdAt"],
    include: [
      {
        model: User,
        attributes: ["username"],
      },
    ],
    where: {
      id: req.params.id,
    },
  }).then((postData) => {
      if (!postData) {
          res.redirect('/dashboard')
          return
      }
    const post = postData.get({ plain: true });
    res.render("edit-post", {
      post,
      loggedIn: req.session.loggedIn,
      username: req.session.username,
    });
  });
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const PORT = 1234;

app.use(bodyParser.json());

// Connectez-vous à MongoDB
mongoose.connect("mongodb://localhost:27017/reddit");

// Schéma pour les utilisateurs
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: "user" },
});
// Schéma pour les posts
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});
// Schéma pour les commentaires
const commentSchema = new mongoose.Schema({
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
});
// Schéma pour les sous-reddit
const subredditSchema = new mongoose.Schema({
  name: String,
  description: String,
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

const Subreddit = mongoose.model("Subreddit", subredditSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);
const User = mongoose.model("User", userSchema);

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.sendStatus(401);

  jwt.verify(token, "JWT_SECRET", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes d'authentification

// Route pour l'inscription
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
  }
});

// Route pour la connexion
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).send("Utilisateur non trouvé");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Mot de passe incorrect");

  const token = jwt.sign(
    { username: user.username, role: user.role },
    "JWT_SECRET"
  );
  res.json({ token });
});

// Routes protégées par authentification

// Route pour créer un sous-reddit
app.post("/create-subreddit", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const subreddit = new Subreddit({
      name,
      description,
      moderators: [req.user._id],
    });

    await subreddit.save();
    res.status(201).json(subreddit);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route pour créer un post
app.post("/create-post", authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({ title, content, author: req.user._id });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route pour créer un post dans un sous-reddit spécifique
app.post("/create-post/:subredditId", authenticateToken, async (req, res) => {
  try {
    const subredditId = req.params.subredditId;
    const subreddit = await Subreddit.findById(subredditId);
    if (!subreddit) return res.status(404).send("Subreddit non trouvé");

    const { title, content } = req.body;
    const post = new Post({ title, content, author: req.user._id });
    await post.save();

    subreddit.posts.push(post._id);
    await subreddit.save();

    res.status(201).json(post);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route pour modifier un post
app.put("/edit-post/:postId", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findOne({ _id: postId, author: req.user._id });
    if (!post) return res.sendStatus(403);

    post.title = req.body.title;
    post.content = req.body.content;
    await post.save();

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route pour supprimer un post
app.delete("/delete-post/:postId", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findOne({ _id: postId, author: req.user._id });
    if (!post) return res.sendStatus(403);

    await Comment.deleteMany({ post: postId });
    await post.remove();

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route pour créer un commentaire sur un post
app.post("/create-comment/:postId", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).send("Post non trouvé");

    const comment = new Comment({
      content: req.body.content,
      author: req.user._id,
      post: postId,
    });

    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});

import express, { Request, Response } from "express";
import { db } from "./db.js";

const app = express();
const PORT = 3000;

//middlewares
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript World!");
});
//ARTICLES
app.get("/articles", (req: Request, res: Response) => {
  res.json(db.articles);
});

//route parameter with id
app.get("/articles/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const article = db.articles.find((eachArticle) => eachArticle.id === id);
  if (article) {
    res.json(article);
  } else {
    res.status(404).json({ error: "Article not found" });
  }
});

//post: new article
app.post("/articles", (req: Request, res: Response) => {
  //extract these from the request body
  const { title, body, authorId } = req.body;

  //make sure its there
  if (!title || !body || !authorId) {
    return res
      .status(400)
      .json({ error: "Some data from the client is missing" });
  }

  //create new article object
  const newArticle = {
    id: `a${Date.now()}`, //'a' because we need to use Date.now() as id for others
    title: title,
    body: body,
    authorId: authorId,
  };

  //add it to db.
  db.articles.push(newArticle);

  //201: created
  //then we display teh json of newArticle
  res.status(201).json(newArticle);
});

//path/update an article
app.patch("/articles/:id", (req: Request, res: Response) => {
  //find the article by id
  const article = db.articles.find((article) => article.id === req.params.id);

  //make sure it exists
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  //get the new title or body (or both) from req
  const { title, body } = req.body;

  //update the article
  if (title) {
    article.title = title;
  }
  if (body) {
    article.body = body;
  }

  //response
  res.json(article);
});

//USERS
app.get("/users", (req: Request, res: Response) => {
  res.json(db.users);
});

//route parameter with id
app.get("/users/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const user = db.users.find((user) => user.id === id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

//post: new user
app.post("/users", (req: Request, res: Response) => {
  //take name from the client
  const { name } = req.body;

  //verify its there
  if (!name) {
    return res.status(400).json({ error: "Name is missing" });
  }

  //create new user object
  const newUser = {
    id: `u${Date.now()}`,
    name: name,
  };

  //add it
  db.users.push(newUser);

  //output + status code
  res.status(201).json(newUser);
});

app.patch("/users/:id", (req: Request, res: Response) => {
  //which user?
  const user = db.users.find((user) => user.id === req.params.id);

  //does the user exist?
  if (!user) {
    return res.status(404).json({ error: `That user don't exist` });
  }

  //take data from request
  const { name } = req.body;

  //update
  if (name) {
    user.name = name;
  }

  //response
  res.json(user);
});

//COMMENTS
app.get("/comments", (req: Request, res: Response) => {
  res.json(db.comments);
});

//route parameter with id
app.get("/comments/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const comment = db.comments.find((comment) => comment.id === id);
  if (comment) {
    res.json(comment);
  } else {
    res.status(404).json({ error: "Comment not found" });
  }
});

//post: new comment
app.post("/comments", (req: Request, res: Response) => {
  //take data from client
  const { text, authorId, articleId } = req.body;

  //verify its there
  if (!text || !authorId || !articleId) {
    return res.status(400).json({ error: "Data missing" });
  }

  //create comment object
  const newComment = {
    id: `c${Date.now()}`,
    text: text,
    authorId: authorId,
    articleId: articleId,
  };

  //add it
  db.comments.push(newComment);

  //output + status code
  res.status(201).json(newComment);
});

//update comments
app.patch("/comments/:id", (req: Request, res: Response) => {
  //find the comment
  const comment = db.comments.find((comment) => comment.id === req.params.id);

  //verify
  if (!comment) {
    return res.status(404).json({ error: "This comment does not exist" });
  }

  //get text from request
  const { text } = req.body;

  //update
  if (text) {
    comment.text = text;
  }

  //response
  res.json(comment);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

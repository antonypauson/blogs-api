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

app.post('/articles', (req: Request, res: Response) => {
  //extract these from the request body
  const {title, body, authorId} = req.body; 

  //make sure its there
  if (!title || !body || !authorId) {
    return res.status(400).json({error: 'Some data from the client is missing'})
  }

  //create new article object
  const newArticle = {
    id: `${Date.now()}`, 
    title: title,
    body: body, 
    authorId: authorId,
  }; 

  //add it to db. 
  db.articles.push(newArticle); 

  //201: created
  //then we display teh json of newArticle
  res.status(201).json(newArticle)
})

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

//COMMENTS
app.get("/comments", (req: Request, res: Response) => {
  res.json(db.comments);
});

//route parameter with id
app.get("/comments/:id", (req: Request, res: Response) => {
    const id = req.params.id; 
    const comment = db.comments.find(comment => comment.id === id); 
    if (comment) {
        res.json(comment); 
    } else {
        res.status(404).json({error: "Comment not found"})
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

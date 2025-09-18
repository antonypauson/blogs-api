import { Request, Response,Router } from "express";
import { db } from "../db.js";

const router = Router(); 

//USERS
router.get("/", (req: Request, res: Response) => {
  const users = db.users.map(user => {
    //find all the articles of the user
    const articles = db.articles.filter(article => article.authorId === user.id); 

    //find all the comments of the user
    const comments = db.comments.filter(comments => comments.authorId === user.id); 

  return (
    {
      type: "users", 
      id: user.id, 
      attributes: {
        name: user.name
      }, 
      relationships: {
        articles: {
          data: articles.map(articles => ({
            type: "articles", 
            id: articles.id,
          }))
        }, 
        comments: {
          data: comments.map(comment => (
            {
              type: "comments", 
              id: comment.id
            }
          ))
        }
      }
    }
  )})
  res.json({data: users});
});

//route parameter with id
router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const user = db.users.find((user) => user.id === id);
  if (user) {
    //find articles of the user
    const articles = db.articles.filter(article => article.authorId === id); 
    //find comments of the user
    const comments = db.comments.filter(comment => comment.authorId === id); 
    const formattedUser = {
      type: 'users', 
      id: user.id, 
      attributes: {
        name: user.name
      }, 
      relationships: {
        articles: {
          data: articles.map(article => (
            {
              type: "articles", 
              id: article.id
            }
          ))
        }, 
        comments: {
          data: comments.map(comment => (
            {
              type: "comments", 
              id: comment.id
            }
          )) 
        }
      }
    }
    res.json({data: formattedUser});
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

//post: new user
router.post("/", (req: Request, res: Response) => {
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

router.patch("/:id", (req: Request, res: Response) => {
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

//delete a user
router.delete('/:id', (req: Request, res: Response) => {
  //get that user
  const user = db.users.find(user => user.id === req.params.id); 

  //verify
  if (!user) {
    return res.status(404).json({error: 'Requested User does not exist'});
  }

  //delete from array
  db.users = db.users.filter(user => user.id !== req.params.id); 

  //resposne
  res.status(204).send(); 
})

export default router; 
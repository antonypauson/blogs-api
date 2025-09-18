import { Request, Response, Router } from "express";
import { db } from "../db.js";

const router = Router(); 

//COMMENTS
router.get("/", (req: Request, res: Response) => {
  const comments = db.comments.map(comment => {
    //find the article of the comment
    const article = db.articles.find(article => article.id === comment.articleId);

    //find the user of the comment (author)
    const author = db.users.find(user => user.id === comment.authorId); 

    return (
    {
      type: "comments", 
      id: comment.id, 
      attributes: {
        text: comment.text
      }, 
      relationships: {
        //if the author doesn't exist, its null
        author: {
          data: author ? 
          {
            type: "users",
            id: author.id
          } : null
        }, 
        article: {
          data: article ? 
          {
            type: "articles", 
            id: article.id
          } : null
        }
      }
    }
  )})
  res.json({data: comments});
});

//route parameter with id
router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const comment = db.comments.find((comment) => comment.id === id);
  if (comment) {
    //find the article of the comment
    const article = db.articles.find(article => article.id === comment.articleId);

    //find the user of the comment (author)
    const author = db.users.find(user => user.id === comment.authorId); 
    const formattedComment = {
      type: "comments", 
      id: comment.id, 
      attributes: {
        text: comment.text
      }, 
      relationships: {
        author: {
          data: author ? 
          {
            type: "users", 
            id: author.id
          } : null
        }, 
        article: {
          data: article ? 
          {
            type: "articles", 
            id: article.id
          } : null
        }
      }
    }
    res.json({data: formattedComment});
  } else {
    res.status(404).json({ error: "Comment not found" });
  }
});

//post: new comment
router.post("/", (req: Request, res: Response) => {
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
router.patch("/:id", (req: Request, res: Response) => {
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

//delete comment
router.delete('/:id', (req: Request, res: Response) => {
  //get that comment
  const comment = db.comments.find(comment => comment.id === req.params.id); 

  //verify 
  if (!comment) {
    return res.status(404).json({'error': "Requested comment does not exists"}); 
  }

  //remove it
  db.comments = db.comments.filter(comment => comment.id !== req.params.id); 

  //response
  res.status(204).send(); 
})

export default router; 
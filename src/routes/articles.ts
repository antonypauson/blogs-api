import { Router, Request, Response } from "express";
import { db } from "../db.js";

const router = Router(); 
//ARTICLES
router.get("/", (req: Request, res: Response) => {
  const articles = db.articles.map(article => {
  //find all the comments from "comments"
  const comments = db.comments.filter(comment => comment.articleId === article.id)
    return (
    {
      type: 'articles', 
      id: article.id,
      attributes: {
        title: article.title, 
        body: article.body, 
      }, 
      //RELATIONSHIPS
      relationships: {
      //author can be found directly 
      // {id: 'a1', title: 'How I made Amazon', body: 'Amazon found opens about how he made the biggest online retialer in the world', authorId: '1'}
      author: {
        data: {
          type: "users", 
          id: article.authorId
        }
      },
      //comments we got from "comments"
      comments: {
        data: 
          comments.map(comment => (
            {
              type: "comments", 
              id: comment.id,
            }
          ))
      },      
      }
    }) 
  }); 

  res.json({data: articles}); 
});

//route parameter with id
router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const article = db.articles.find((eachArticle) => eachArticle.id === id);
  const comments = db.comments.filter(comment => comment.articleId === id); 
  if (article) {
    const formattedArticle = {
      type: 'articles', 
      id:  article.id, 
      attributes: {
        title: article.title, 
        body: article.body,
      },
      //RELATIONSHIPS
      relationships: {
        //AUTHOR
        author: {
          data: {
            type: "users", 
            id: article.authorId
          }
        },
        //COMMENTS
        comments: {
          data: 
          comments.map(comment => (
            {
              type: "comments", 
              id: comment.id
            }
          ))
        }
      },
    }

    res.json({data: formattedArticle});
  } else {
    res.status(404).json({ error: "Article not found" });
  }
});

//post: new article
router.post("/", (req: Request, res: Response) => {
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
router.patch("/:id", (req: Request, res: Response) => {
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

//delete an article
router.delete('/:id', (req: Request, res: Response) => {
  //find the article
  const article = db.articles.find(article => article.id === req.params.id); 

  //verify
  if (!article) {
    return res.status(404).json({error: 'Requested Article does not exist'}); 
  }

  //filter it out
  //but also making it the new articles
  db.articles = db.articles.filter(article => article.id !== req.params.id); 


  //response is NO CONTENT anymore
  res.status(204).send(); 

})

export default router; 
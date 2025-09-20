import { Router, Request, Response } from "express";
import { db } from "../db.js";

interface Resource {
  type: string; 
  id: string; 
  attributes: object; 
}

const router = Router(); 
//ARTICLES
router.get("/", (req: Request, res: Response) => {
  //?include
  const include = req.query.include; 
  const allIncluded: Resource[] = []; 

  const articles = db.articles.map(article => {
  //find all the comments from "comments"
  const comments = db.comments.filter(comment => comment.articleId === article.id)

  if (typeof include === 'string') {
    //if include 'author'
    if (include.includes('author')) {
      const author = db.users.find(user => user.id === article.authorId); 

      if (author) {
        allIncluded.push ({
          type: 'users', 
          id: author.id, 
          attributes: {
            name: author.name
          }
        })
      }
    }

    if (include.includes('comments')) {
      //if include 'comments'
      allIncluded.push (...comments.map(comment => ({
        type: 'comments', 
        id: comment.id, 
        attributes: {
          text: comment.text
        }
      })))
    }


  }
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

  //there can be duplicates
  //so lets remove it using Map
  const includeMap = new Map(); 

  allIncluded.forEach(each => {
    const key = `${each.id}`; 
    if (!includeMap.has(key)) {
      includeMap.set(key, each); 
    }
  })
  const included = Array.from(includeMap.values());
  // console.log('De-duplicated included:', included); 

  const response: {data: any; included?: any[]} = {
    data: articles, 
  }

  if (included.length > 0) {
    response.included = included; 
  }

  res.json(response); 
});

//route parameter with id
router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const article = db.articles.find((eachArticle) => eachArticle.id === id);
  const comments = db.comments.filter(comment => comment.articleId === id); 

  //?include
  const include = req.query.include; 
  const included = []; 


  if (article) {
    //if 'author' is the one included
    if (typeof include === 'string' && include.includes('author')) {
      const author = db.users.find(user => user.id === article.authorId); 
      if (author) {
        included.push({
          type: 'users', 
          id: author.id, 
          attributes: {
            name: author.name
          }
        })
      }
    }

    //if 'comments' is the one included
    if (typeof include === 'string' && include.includes('comments')) {
      const comments = db.comments.filter(comment => comment.articleId === article.id); 
      if (comments) {
        comments.forEach(comment => included.push(
          {
            type: 'comments', 
            id: comment.id, 
            attributes: {
              text: comment.text
            }
          }
        ))
      }
    }

    

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

    //defining how the 'response' will look like
    const response: {data: any; included?: any[]} = {
      data: formattedArticle, 
    }

    //add included array if its there. 
    if (included.length > 0) {
      response.included = included; 
    }

    res.json(response);

  } else {
    res.status(404).json({ error: "Article not found" });
  }
});

//post: new article
router.post("/", (req: Request, res: Response) => {
  //extract attributes + relationships from the req.body.data
  const { attributes, relationships } = req.body.data;

  //make sure everything is there
  if (!attributes || 
    !relationships || 
    !attributes.title ||
    !attributes.body ||
    !relationships.author ||
    !relationships.author.data
  ) {
    return res
      .status(400)
      .json({ error: "data from the client is missing" });
  }

  //create new article object
  const newArticle = {
    id: `a${Date.now()}`, //'a' because we need to use Date.now() as id for others
    title: attributes.title,
    body: attributes.body,
    authorId: relationships.author.data.id,
  };

  //add it to db.
  db.articles.push(newArticle);

  //how this newArticle's json look
  const newArticleJSONData = {
    type: 'articles', 
    id: newArticle.id, 
    attributes: {
      title: newArticle.title, 
      body: newArticle.body
    }, 
    relationships: {
      author: {
        data: {
          type: 'users', 
          id: newArticle.authorId
        }
      }
    }
  }
  //201: created
  //then we display the json of newArticle
  res.status(201).json({data: newArticleJSONData});
});

//path/update an article
router.patch("/:id", (req: Request, res: Response) => {
  //find the article by id
  const article = db.articles.find((article) => article.id === req.params.id);

  //make sure it exists
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  //get from req.body.data
  const { attributes} = req.body.data;

  //update the article
  if (attributes &&
    attributes.title
  ) {
    article.title = attributes.title;
  }
  if (attributes &&
    attributes.body
  ) {
    article.body = attributes.body;
  }

  //find all the comments
  const comments = db.comments.filter(comment => comment.articleId === article.id); 

  //json:api response
  const formattedArticle = {
    type: "articles", 
    id: article.id, 
    attributes: {
      title: article.title,
      body: article.body
    }, 
    relationships: {
      author: {
        data: {
          type: "users", 
          id: article.authorId
        }
      }, 
      comments: {
        data: comments.map(comment => ({
          type: "comments", 
          id: comment.id
        }))
      }
    }
  }

  //response
  res.json({data: formattedArticle});
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
import express, { Request, Response } from "express";
import { db } from "./db.js";
import articlesRouter from './routes/articles.js'; 
import userRouter from './routes/users.js'; 
import commentRouter from './routes/comments.js'; 


const app = express();
const PORT = 3000;

//middlewares
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript World!");
});

app.use('/articles', articlesRouter); 

app.use('/users', userRouter); 

app.use('/comments', commentRouter); 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

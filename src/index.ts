import express, { Request, Response } from "express";
import { db } from "./db.js";

const app = express();
const PORT = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript World!");
});

app.get("/articles", (req: Request, res: Response) => {
    res.json(db.articles); 
});

app.get("/users", (req: Request, res: Response) => {
    res.json(db.users); 
})

app.get("/comments", (req: Request, res: Response) => {
    res.json(db.comments); 
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

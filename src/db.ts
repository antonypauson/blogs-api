//INTERACES
export interface User {
  id: string;
  name: string;
}

export interface Article {
  id: string;
  title: string;
  body: string;
  authorId: string; // This links to a User
}

export interface Comment {
  id: string;
  text: string;
  authorId: string; // This links to a User
  articleId: string; // This links to an Article
}

//raw data
const users: User[] = [
    { id: '1', name: 'Jeff'}, 
    { id: '2', name: 'Jem'}
]

const articles: Article[] = [ 
    {id: 'a1', title: 'How I made Amazon', body: 'Amazon found opens about how he made the biggest online retialer in the world', authorId: '1'},
    {id: 'a2', title: 'Jem Finch speaks up', body: 'Jem Finch, the kid who was attacked by late Bob Ewell speaks up on what happened on the town paegent day', authorId: '2'},  
]

const comments: Comment[] = [
    {id: 'c1', text: 'Nice one Jeff', authorId: '2', articleId: 'a1'},
    {id: 'c2', text: 'Happy that you survived Jem!', authorId: '1', articleId: 'a2'},
]

//export
export const db = {
    users, articles, comments
}


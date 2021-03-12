const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { response } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    
    const { username } = request.headers;

    const user = users.find(user => user.username === username);
  
    if(!user){
      return response.status(400).json({ error: "User not found" });
    }

    request.user = user;

    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExists = users.some(
        (users) => users.username === username
        );

        if (userAlreadyExists) {
            return response.status(400).json({ error: "User already exists!" });
        }
    users.push({
      name,
      username,
      id: uuidv4(),
      todos: []
    });

    return response.status(201).send();

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todosOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todosOperation);

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const { user } = request;

  const todos = user.todos.find((todos) => todos.id === id);

  if (!todos) {
    return response.status(404).json({ error: "Todos not found" });
  }

  todos.title = title;
  todos.deadline = deadline;

  return response.status(201).send(todos);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todos = user.todos.find((todos) => todos.id === id);

  if (!todos) {
    return response.status(404).json({ error: "Todos not found" });
  }

  todos.done = true;

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todos = user.todos.find((todos) => todos.id === id);

  if (!todos) {
    return response.status(404).json({ error: "Todos not found" });
  }

  users.splice(user, 1);

  return response.status(200).json(users);
});

module.exports = app;
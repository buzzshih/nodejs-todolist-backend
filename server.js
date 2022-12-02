const Joi = require("joi");
const express = require("express");
const app = express();
const path = require("path");
const db = require("./src/db");
// const cors = require("cors");
require("dotenv").config();

app.use(express.json());

console.log(process.env.ENV);

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.get("/api/todos", db.getTodos);

app.get("/api/todos/:id", db.getTodoById);

app.post("/api/todos", db.createTodo);

app.put("/api/todos/:id", db.updateTodo);

app.put("/api/todosDone/:id", db.updateTodoDone);

app.delete("/api/todos/:id", db.deleteTodo);

const port = process.env.port || 3000;

app.listen(port, () => console.log(`listen to ${port} port`));

const validateTodo = (_todo) => {
  const schema = Joi.object().keys({
    todo: Joi.string().min(1).required(),
  });

  return schema.validate(_todo);
};

const pg = require("pg");
const Joi = require("joi");
require("dotenv").config();

const devConfig = {
  host: process.env.DB_HOST,

  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DE_NAME,
  port: process.env.DB_PORT,
  // ssl: true,
};
const prodConfig = process.env.devConfig;

const DB_Config = process.env.ENV === "dev" ? devConfig : prodConfig;

const client = new pg.Client(DB_Config);
client.connect((err) => {
  if (err) throw err;
  else {
    console.log("database is connect !");
  }
});

const queryTodos = `SELECT * FROM public.todolist`;
const queryTodoById = `SELECT * FROM public.todolist Where id=$1`;
const createTodoSql = `INSERT INTO todolist (todo) VALUES ($1) RETURNING *`;
const deleteTodoSql = `DELETE FROM todolist WHERE id = $1`;
const updateTodoSql = `UPDATE todolist SET  todo=$2  WHERE id=$1`;
const updateTodoDoneSql = `UPDATE todolist SET  done=$2  WHERE id=$1`;

console.log("process.env.ENV", process.env.ENV);

const getTodos = (required, response) => {
  client.query(queryTodos, (error, res) => {
    if (error) throw error;
    response.status(200).send(res.rows);
  });
};

const getTodoById = (required, response) => {
  const id = parseInt(required.params.id);
  client.query(queryTodoById, [id], (error, res) => {
    if (error) return response.status(400).send(error);
    if (res.rows.length < 1)
      return response.status(404).send("The id does not exist in the database ");
    response.status(200).send(res.rows);
  });
};

const createTodo = (required, response) => {
  const { todo } = required.body;

  const schema = Joi.object().keys({
    todo: Joi.string().min(1).required(),
  });
  const result = schema.validate(required.body);
  const { error } = result;
  if (error) return response.status(400).send(error.details[0].message);

  client.query(createTodoSql, [todo], (error, res) => {
    if (error) return response.status(201).send(error);
    response.send(...res.rows);
  });
};

const deleteTodo = (required, response) => {
  const id = parseInt(required.params.id);
  console.log(id);
  client.query(deleteTodoSql, [id], (error, res) => {
    if (error) return response.status(400).send("The id does not exist in the database!");
    response.status(200).send(`Todos deleted with ID: ${id}`);
  });
};

const updateTodo = (required, response) => {
  const { todo } = required.body;
  const id = parseInt(required.params.id);

  const schema = Joi.object().keys({
    todo: Joi.string().min(1).required(),
  });

  const result = schema.validate(required.body);
  const { error } = result;
  if (error) return response.status(400).send(error.details[0].message);

  client.query(updateTodoSql, [id, todo], (error, res) => {
    if (error) return response.status(400).send(error.message);
    response.status(200).send(`Todos modified with ID: ${id}`);
    // response.status(200).send(required.params);
  });
};

const updateTodoDone = (required, response) => {
  const { done } = required.body;
  const id = parseInt(required.params.id);

  const schema = Joi.object().keys({
    done: Joi.boolean().required(),
  });

  const result = schema.validate(required.body);
  const { error } = result;
  if (error) return response.status(400).send(error.details[0].message);

  client.query(updateTodoDoneSql, [id, done], (error, res) => {
    if (error) return response.status(400).send(error.message);
    response.status(200).send(`Todo State modified  with ID: ${id}`);
    // response.status(200).send(required.params);
  });
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  updateTodoDone,
  deleteTodo,
};

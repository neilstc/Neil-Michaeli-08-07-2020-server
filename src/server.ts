import express from "express";
import moment from "moment";
import cors from "cors";
import { Todo } from "./types";
import fs from 'fs'
import sqlite3 from "sqlite3";



const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const todos: Todo[] = [
  {
    id: 0, text: "Finish The Last Of Us 2", completed: false,
    targetDate: moment(new Date()).format("YYYY-MM-DD")
  },
  {
    id: 1, text: "tell my dog that she's the best", completed: false,
    targetDate: moment(new Date()).format("YYYY-MM-DD")
  },
  {
    id: 2, text: "rate It's Always Sunny in Philadelphia 10", completed: false,
    targetDate: moment(new Date()).format("YYYY-MM-DD")
  },
  {
    id: 3, text: "prepare the album's tracks for mix", completed: false,
    targetDate: moment(new Date()).format("YYYY-MM-DD")
  },
];


try {
  if (!fs.existsSync("TodoDB.db")) {
    initDb();
  }
} catch (e) {
  console.log(e);
}

// get all todos
app.get("/users/:username/todos", (req, res) => {
  let todo: Todo;
  const db = new sqlite3.Database("TodoDB.db");
  db.all("SELECT * FROM todos", (err, rows) => {
    res.send(rows);
  });
  db.close();

});

// get a specific todo by id
app.get("/users/:username/todos/:id", (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database("TodoDB.db");
  let todo: Todo;
  db.get(`SELECT * FROM todos WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(404).send("something went wrong");
      return;
    }
    todo = { id: row.id, text: row.text, completed: row.completed, targetDate: row.targetDate };
    console.log(todo);
    res.send(todo);
  });
  db.close();
});

// delete contant - working
app.delete("/users/:username/todos/:id", (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database("TodoDB.db");
  db.run(`DELETE FROM todos WHERE id = ?`,
    [id]);
  db.close();
  res.send("deleted");
});

// update an existing todo
app.put("/users/:username/todos/:id", (req, res) => {
  console.log(req.body);
  const { id, text, targetDate, completed } = req.body;
  if (parseInt(id, 10) < 0) {
    res.status(404).send("id does not exist!");
    return;
  } else {
    console.log("attemp to update");
    const db = new sqlite3.Database("TodoDB.db");
    db.run(
      `UPDATE todos
      SET   text = ?,
        completed = ?,
        targetDate = ?
      WHERE id = ?`,
      [text, completed, targetDate, id]);
    db.close();
    res.send("updated");
  }

});

// post a todo
app.post("/users/:username/todos", (req, res) => {
  const { text, targetDate } = req.body;
  const newid = todos.length;
  const todo: Todo = { id: newid, text, completed: false, targetDate };
  const db = new sqlite3.Database("TodoDB.db");

  db.run(`INSERT INTO todos (id, text, completed, targetDate)
  VALUES (?, ?, ?, ?)`,
    [newid, todo.text, todo.completed, todo.targetDate]);
  res.send("Inserted");
  db.close();
});

const port = 4000;
app.get("/", (req, res) => {
  res.send("Home directory");
});

app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});


function initDb() {
  const db = new sqlite3.Database("TodoDB.db");
  db.serialize(() => {
    db.run("CREATE TABLE todos (id INT, text TEXT, completed BOOLEAN, targetDate TEXT)");
    let stmt = db.prepare("INSERT INTO todos VALUES(?,?,?,?)");
    for (let i = 0; i < todos.length; i++) {
      let id = todos[i].id;
      let text = todos[i].text;
      let completed = todos[i].completed;
      let targetDate = todos[i].targetDate;
      stmt.run(id, text, completed, targetDate);

    };
    stmt.finalize();
  });
  db.close();
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moment_1 = require("moment");
const cors_1 = require("cors");
const app = express_1.default();
app.use(express_1.default.json());
app.use(cors_1.default());
let todos = [
    { id: 0, text: "walk", complete: false, targetDate: moment_1.default(new Date()).format("YYYY-MM-DD") },
    { id: 1, text: "run", complete: true, targetDate: moment_1.default(new Date()).format("YYYY-MM-DD") },
    { id: 2, text: "watch tv", complete: true, targetDate: moment_1.default(new Date()).format("YYYY-MM-DD") },
    { id: 3, text: "tlus2", complete: false, targetDate: moment_1.default(new Date()).format("YYYY-MM-DD") },
];
//1.
app.get("/users/:username/todos", (req, res) => {
    res.send(todos);
});
app.delete("/users/:username/todos/:id", (req, res) => {
    const { id } = req.params;
    let targetTodo = todos.find(c => c.id === parseInt(id, 10));
    if (!targetTodo) {
        res.status(404).send("TODO NOT FOUND - INVALID ID");
    }
    else {
        const targetIndex = todos.indexOf(targetTodo);
        todos.splice(targetIndex, 1);
        res.send(`Deleted todo ${targetIndex}`);
    }
});
app.post("/user/:username/todos/:id", (req, res) => {
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
//# sourceMappingURL=app.js.map
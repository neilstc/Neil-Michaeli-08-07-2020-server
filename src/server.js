"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var moment_1 = __importDefault(require("moment"));
var cors_1 = __importDefault(require("cors"));
var fs_1 = __importDefault(require("fs"));
var sqlite3_1 = __importDefault(require("sqlite3"));
var app = express_1.default();
app.use(express_1.default.json());
app.use(cors_1.default());
app.use(express_1.default.urlencoded({ extended: false }));
var todos = [
    {
        id: 0, text: "Finish The Last Of Us 2", completed: false,
        targetDate: moment_1.default(new Date()).format("YYYY-MM-DD")
    },
    {
        id: 1, text: "tell my dog that she's the best", completed: false,
        targetDate: moment_1.default(new Date()).format("YYYY-MM-DD")
    },
    {
        id: 2, text: "rate It's Always Sunny in Philadelphia 10", completed: false,
        targetDate: moment_1.default(new Date()).format("YYYY-MM-DD")
    },
    {
        id: 3, text: "prepare the album's tracks for mix", completed: false,
        targetDate: moment_1.default(new Date()).format("YYYY-MM-DD")
    },
];
try {
    if (!fs_1.default.existsSync("TodoDB.db")) {
        initDb();
    }
}
catch (e) {
    console.log(e);
}
// get all todos
app.get("/users/:username/todos", function (req, res) {
    var todo;
    var db = new sqlite3_1.default.Database("TodoDB.db");
    db.all("SELECT * FROM todos", function (err, rows) {
        res.send(rows);
    });
    db.close();
});
// get a specific todo by id
app.get("/users/:username/todos/:id", function (req, res) {
    var id = req.params.id;
    var db = new sqlite3_1.default.Database("TodoDB.db");
    var todo;
    db.get("SELECT * FROM todos WHERE id = ?", [id], function (err, row) {
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
app.delete("/users/:username/todos/:id", function (req, res) {
    var id = req.params.id;
    var db = new sqlite3_1.default.Database("TodoDB.db");
    db.run("DELETE FROM todos WHERE id = ?", [id]);
    db.close();
    res.send("deleted");
});
// update an existing todo
app.put("/users/:username/todos/:id", function (req, res) {
    console.log(req.body);
    var _a = req.body, id = _a.id, text = _a.text, targetDate = _a.targetDate, completed = _a.completed;
    if (parseInt(id, 10) < 0) {
        res.status(404).send("id does not exist!");
        return;
    }
    else {
        console.log("attemp to update");
        var db = new sqlite3_1.default.Database("TodoDB.db");
        db.run("UPDATE todos\n      SET   text = ?,\n        completed = ?,\n        targetDate = ?\n      WHERE id = ?", [text, completed, targetDate, id]);
        db.close();
        res.send("updated");
    }
});
// post a todo
app.post("/users/:username/todos", function (req, res) {
    var _a = req.body, text = _a.text, targetDate = _a.targetDate;
    var newid = todos.length;
    var todo = { id: newid, text: text, completed: false, targetDate: targetDate };
    var db = new sqlite3_1.default.Database("TodoDB.db");
    db.run("INSERT INTO todos (id, text, completed, targetDate)\n  VALUES (?, ?, ?, ?)", [newid, todo.text, todo.completed, todo.targetDate]);
    res.send("Inserted");
    db.close();
});
var port = 4000;
app.get("/", function (req, res) {
    res.send("Home directory");
});
app.listen(port, function (err) {
    if (err) {
        return console.error(err);
    }
    return console.log("server is listening on " + port);
});
function initDb() {
    var db = new sqlite3_1.default.Database("TodoDB.db");
    db.serialize(function () {
        db.run("CREATE TABLE todos (id INT, text TEXT, completed BOOLEAN, targetDate TEXT)");
        var stmt = db.prepare("INSERT INTO todos VALUES(?,?,?,?)");
        for (var i = 0; i < todos.length; i++) {
            var id = todos[i].id;
            var text = todos[i].text;
            var completed = todos[i].completed;
            var targetDate = todos[i].targetDate;
            stmt.run(id, text, completed, targetDate);
        }
        ;
        stmt.finalize();
    });
    db.close();
}

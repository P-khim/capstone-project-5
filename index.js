import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import pg from "pg";
const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_note",
  password: "k0967748747",
  port: 5432,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM books ORDER BY ID ASC";
    const result = await db.query(query);
    const output = result.rows;
    res.render("index.ejs", { output: output });
  } catch (error) {
    console.log(error);
    res.render("index.ejs", { output: [] });
  }
});

app.get("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = "SELECT * FROM books WHERE id = $1";
    const result = await db.query(query, [id]);
    const book = result.rows[0];
    res.render("update.ejs", { book });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description } = req.body;
    const query = "UPDATE books SET title = $1, description = $2 WHERE id = $3";
    const values = [title, description, id];
    await db.query(query, values);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = "DELETE FROM books WHERE id = $1";
    await db.query(query, [id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.post("/search", async (req, res) => {
  const input = req.body.input;
  const apiUrl = "http://openlibrary.org/search.json?q=" + input;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const output = data.docs;
    res.render("search.ejs", { output });
  } catch (error) {
    console.log(error);
    res.render("search.ejs", { output: [] });
  }
});

app.get("/cover/:coverId", async (req, res) => {
  try {
    const coverId = req.params.coverId;
    const coverUrl = `http://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    console.log("Clicked book cover URL:", coverUrl);
    res.redirect(coverUrl);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/add/:coverId", async (req, res) => {
  try {
    const coverId = req.params.coverId;
    const coverUrl = `http://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    res.render("add.ejs", { coverUrl });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/save", async (req, res) => {
  try {
    const { coverUrl, title, description } = req.body;
    const timestamp = new Date();
    const query =
      "INSERT INTO books (book_url, title, description, creation_date) VALUES ($1, $2, $3, $4)";
    const values = [coverUrl, title, description, timestamp];
    await db.query(query, values);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

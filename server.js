const express = require("express");
const path = require("path");
const fs = require("fs");
const uuid = require("./helpers/uuid");
const {
  readFromFile,
  readAndAppend,
  writeToFile,
} = require('./helpers/fsUtils');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

//html routes
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// //api routes
app.get("/api/notes", (req, res) => {
  //log request to terminal
  console.log(`${req.method} request received to get notes`);
  //display notes data to client
  fs.readFile("./db/notes.json", "utf-8", (err, arrayOfNotes) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error loading notes data");
    } else {
      res.status(200).json(JSON.parse(arrayOfNotes));
    }
  });
});

app.post("/api/notes", (req, res) => {
  //destructuring assignment for items in req.body
  const { title, text } = req.body;
  //if both note components are present
  if (title && text) {
    //variable for note object to be saved
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    fs.readFile("./db/notes.json", function (err, data) {
      if (err) throw err;

      //define array for collecting notes in JSON data
      var arrayOfNotes = JSON.parse(data);
      arrayOfNotes.push(newNote);

      //write newNote to a JSON file
      fs.writeFile("./db/notes.json", JSON.stringify(arrayOfNotes), (err) =>
        err
          ? console.error(err)
          : console.log(
              `Note for ${newNote.title} has been written to JSON file`
            )
      );
    });

    const response = {
      status: "success",
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  }
});

app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;
  readFromFile("./db/notes.json")
    .then((data) => JSON.parse(data))
    .then((json) => {
      // Make a new array of all tips except the one with the ID provided in the URL
      const result = json.filter((note) => note.id !== noteId);

      // Save that array to the filesystem
      writeToFile("./db/notes.json", result);

      // Respond to the DELETE request
      res.json(`Note ${noteId} has been deleted 🗑️`);
    });
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);

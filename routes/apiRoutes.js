const app = require("express");
// const path = require("path");
const uuid = require("../helpers/uuid");
const {
  readFromFile,
  writeToFile,
  readAndAppend,
} = require("../helpers/fsUtils");

module.exports = (app) => {
  //GET route to retrieve notes from api database
  app.get("/api/notes", (req, res) => {
    //log request to terminal
    console.log(`${req.method} request received to get notes`);
    //display notes data to client
    readFromFile("./db/notes.json")
      .then((data) => res.status(200).json(JSON.parse(data)))
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error loading notes data");
      });
  });

  //post route to submit notes to api database
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

      readAndAppend(newNote, "./db/notes.json");

      const response = {
        status: "success",
        body: newNote,
      };

      console.log(response);
      res.status(201).json(response);
    }
  });

  //delete route to delete notes from api database
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
};

import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util.js";
import fs from "fs";

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

app.get("/filteredimage", async (req, res) => {
  try {
    const { image_url } = req.query || {};

    //1. validate the image_url query
    if (!image_url) {
      return res.status(400).send({ message: "image not found" });
    }

    //2. call filterImageFromURL(image_url) to filter the image
    const filteredpath = await filterImageFromURL(image_url);

    if (!filteredpath) {
      return res
        .status(422)
        .send({ message: "unable to process image for filtering" });
    }

    // 3. send the resulting file in the response
    return res.status(200).sendFile(filteredpath, () => {
      //4. deletes any files on the server on finish of the response
      deleteLocalFiles([filteredpath]);
    });
  } catch(err) {
    return res
    .status(422)
    .send({ message: "unable to process image for filtering" });
  }
});

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});

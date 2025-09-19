const express = require("express");
const port = 8080;
const app = express();
const sqlite3 = require("sqlite3");
const dbFile = "my-project-db.sqlite3.db";
const db = new sqlite3.Database(dbFile);
const { engine } = require("express-handlebars");

//HANDLEBARS
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.static("public"));

// MODEL //missing pictures
const projects = [
  {
    id: "1",
    name: "Counting people with a camera",
    type: "Research",
    desc: "The purpose of this project is to count people passing through a corridor and to know how many are in the room at a certain time.",
    year: 2022,
    dev: "Python and OpenCV (Computer vision) library",
    url: "/img/counting.png",
  },
  {
    id: "2",
    name: "Visualisation of 3D medical images",
    type: "Research",
    desc: "The project makes a 3D model of the analysis of the body of a person and displays the detected health problems. It is useful for doctors to view in 3D their patients and the evolution of a disease.",
    year: 2012,
    url: "/img/medical.png",
  },
  {
    id: "3",
    name: "Multiple questions system",
    type: "Teaching",
    desc: "During the lockdowns in France, this project was useful to test the students online with a Quizz system.",
    year: 2021,
    url: "/img/qcm07.png",
  },
  {
    id: "4",
    name: "Image comparison with the Local Dissmilarity Map",
    desc: "The project is about finding and quantifying the differences between two images of the same size. The applications were numerous: satellite imaging, medical imaging,...",
    year: 2020,
    type: "Research",
    url: "/img/diaw02.png",
  },
  {
    id: "5",
    name: "Management system for students' internships",
    desc: "This project was about the creation of a database to manage the students' internships.",
    year: 2012,
    type: "Teaching",
    url: "/img/management.png",
  },
  {
    id: "6",
    name: "Magnetic Resonance Spectroscopy",
    desc: "Analysis of signals and images from Magnetic Resonance Spectroscopy and Imaging.",
    year: 2013,
    type: "Research",
    url: "/img/yu00.png",
  },
  {
    id: "7",
    name: "Signal Analysis for Detection of Epileptic Deseases",
    desc: "This project was about the detection of epileptic problems in signals.",
    year: 2019,
    type: "research",
    url: "/img/youssef00.png",
  },
];

app.get("/", function (req, res) {
  //res.send("Hello World");
  res.render("home.handlebars");
});

app.get("/about", (req, res) => {
  res.render("cv.handlebars");
});

app.get("/contact", (req, res) => {
  res.render("contact.handlebars");
});

app.get("/projects", (req, res) => {
  const model = { projects: projects };
  res.render("projects.handlebars", model);
});

app.listen(port, () => {
  console.log(`Server up and running on http://localhost:${port}...`);
});

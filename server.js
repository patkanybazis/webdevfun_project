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

//MIDDLEWARES
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//------------------------------------------
//USER FUNCTIONS
//------------------------------------------

function initTableSkills(mydb) {
  // MODEL for skills
  const skills = [
    {
      id: "1",
      name: "PHP",
      type: "Programming language",
      desc: "Programming with PHP on the server side.",
      level: 4,
    },
    {
      id: "2",
      name: "Python",
      type: "Programming language",
      desc: "Programming with Python.",
      level: 4,
    },
    {
      id: "3",
      name: "Java",
      type: "Programming language",
      desc: "Programming with Java.",
      level: 2,
    },
    {
      id: "4",
      name: "ImageJ",
      type: "Framework",
      desc: "Java Framework for Image Processing.",
      level: 2,
    },
    {
      id: "5",
      name: "Javascript",
      type: "Programming language",
      desc: "Programming with Javascript on the client side.",
      level: 4,
    },
    {
      id: "6",
      name: "Node",
      type: "Programming language",
      desc: "Programming with Javascript on the server side.",
      level: 4,
    },
    {
      id: "7",
      name: "Express",
      type: "Framework",
      desc: "A framework for programming Javascript on the server side.",
      level: 4,
    },
    {
      id: "8",
      name: "Scikit-image",
      type: "Library",
      desc: "A library for Image Processing with Python.",
      level: 3,
    },
    {
      id: "9",
      name: "OpenCV",
      type: "Library",
      desc: "A library for Image Processing with Python.",
      level: 4,
    },
    {
      id: "10",
      name: "LaTeX",
      type: "Description language",
      desc: "A language to describe and build professional documents.",
      level: 5,
    },
    {
      id: "11",
      name: "HTML",
      type: "Description language",
      desc: "A language to create web pages.",
      level: 4,
    },
    {
      id: "12",
      name: "CSS",
      type: "Description language",
      desc: "A language to apply styles to web pages.",
      level: 4,
    },
    {
      id: "13",
      name: "C",
      type: "Programming language",
      desc: "The historical language of the Linux/Unix kernels.",
      level: 3,
    },
    {
      id: "14",
      name: "C++",
      type: "Programming language",
      desc: "A fast high level programming language.",
      level: 1,
    },
    {
      id: "15",
      name: "SQL",
      type: "Query language",
      desc: "The relational database language to access data (CRUD).",
      level: 4,
    },
  ];

  //create table skills at startup
  mydb.run(
    "CREATE TABLE skills (sid INTEGER PRIMARY KEY AUTOINCREMENT, sname TEXT NOT NULL, sdesc TEXT NOT NULL, stype TEXT NOT NULL, slevel INT)",
    (error) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        console.log("---> Table projects created");
        //inserts skills
        skills.forEach((OneSkill) => {
          db.run(
            "INSERT INTO skills (sname, sdesc, stype, slevel) VALUES (?, ?, ?, ?)",
            [OneSkill.name, OneSkill.desc, OneSkill.type, OneSkill.level],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("Line added into the skills table!");
              }
            }
          );
        });
      }
    }
  );
}

function initTableProjects(mydb) {
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

  //create table projects at startup
  mydb.run(
    "CREATE TABLE projects (pid INTEGER PRIMARY KEY AUTOINCREMENT, pname TEXT NOT NULL, pyear INTEGER NOT NULL, pdesc TEXT NOT NULL, ptype TEXT NOT NULL, pImgURL TEXT NOT NULL)",
    (error) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        console.log("---> Table projects created");
        //inserts projects
        projects.forEach((OneProject) => {
          db.run(
            "INSERT INTO projects (pname, pdesc, ptype, pyear, pImgURL) VALUES (?, ?, ?, ?, ?)",
            [
              OneProject.name,
              OneProject.desc,
              OneProject.type,
              OneProject.year,
              OneProject.url,
            ],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("Line added into the projects table!");
              }
            }
          );
        });
      }
    }
  );
}

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
  db.all("SELECT * FROM projects", function (error, projectsFromDB) {
    if (error) {
      console.log("ERROR: ", error);
    } else {
      const model = { projects: projectsFromDB };
      res.render("projects.handlebars", model);
    }
  });
});

app.get("/skills", (req, res) => {
  db.all("SELECT * FROM skills", function (error, listOfSkills) {
    if (error) {
      console.log("ERROR: ", error);
    } else {
      const model = { skills: listOfSkills };
      res.render("skills.handlebars", model);
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login.handlebars");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  //verification
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }
  res.send(`Received: Username - ${username}, Password - ${password}`);
});

app.listen(port, function () {
  initTableSkills(db);
  initTableProjects(db);
  console.log(`Server up and running on http://localhost:${port}...`);
});

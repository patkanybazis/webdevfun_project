const express = require("express");
const port = 8080;
const app = express();
const sqlite3 = require("sqlite3");
const dbFile = "my-project-db.sqlite3.db";
const db = new sqlite3.Database(dbFile);
const { engine } = require("express-handlebars");
const bcrypt = require("bcrypt");
const session = require("express-session");
const connectSqlite3 = require("connect-sqlite3");

//const adminPasswordHash =
//"$2b$12$D8vMHr3ev5gFGG1Qf4JQMeow3GUG7ZmAfITlXqEIAgg.iiQPs.pDK";

//STORE SESSIONS IN THE DATABASE
const SqliteStore = connectSqlite3(session);
//DEFINE THE SESSION
app.use(
  session({
    store: new SqliteStore({ db: "sessions-db.db" }),
    saveUninitialized: false,
    resave: false,
    secret: "This123Is@Another#456GreatSecret678%Sentence",
  })
);

//HANDLEBARS
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

//MIDDLEWARES
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
//make the session available in all handlebar files at once
app.use((request, response, next) => {
  response.locals.session = request.session;
  next();
});

//------------------------------------------
//USER FUNCTIONS
//------------------------------------------

//USERS TABLE
function initTableUsers(mydb) {
  //create table users at startup
  mydb.run(
    "CREATE TABLE users (uid INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, isAdmin INTEGER DEFAULT 0)",
    (error) => {
      if (error) {
        console.log("ERROR creating users table: ", error);
      } else {
        console.log("---> Table users created");

        //admin user with hashed password
        const adminPasswordHash =
          "$2b$12$D8vMHr3ev5gFGG1Qf4JQMeow3GUG7ZmAfITlXqEIAgg.iiQPs.pDK";

        mydb.run(
          "INSERT INTO users (username, password_hash, isAdmin) VALUES (?, ?, ?)",
          ["admin", adminPasswordHash, 1],
          (error) => {
            if (error) {
              console.log("ERROR inserting admin user: ", error);
            } else {
              console.log("Admin user added to users table!");
            }
          }
        );

        //regular user
        bcrypt.hash("password", 12, (err, hash) => {
          if (err) {
            console.log("Error hashing user password");
          } else {
            mydb.run(
              "INSERT INTO users (username, password_hash, isAdmin) VALUES (?, ?, ?)",
              ["user", hash, 0],
              (error) => {
                if (error) {
                  console.log("ERROR inserting regular user: ", error);
                } else {
                  console.log("Regular user added to users table!");
                }
              }
            );
          }
        });
      }
    }
  );
}

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

//---LOGIN FORM
app.get("/login", (req, res) => {
  res.render("login");
});

/*--LOGIN PROCESSING
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  //verification
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }
  res.send(`Received: Username - ${username}, Password - ${password}`);
})*/

//--LOGIN PROCESSING
app.post("/login", (request, response) => {
  console.log(
    `Here comes the data received from the form on the client: ${request.body.un} - ${request.body.pw}`
  );
  /* if (request.body.un === "admin") {
    bcrypt.compare(request.body.pw, adminPasswordHash, (err, result) => {
      if (err) {
        console.log("Error in password comparison");
        const model = { error: "Error in password comparison" }; //chatgpt helped add "const" to model
        response.render("login", model);
      } else if (result) {
        request.session.isLoggedIn = true;
        request.session.un = request.body.un;
        request.session.isAdmin = true;
        console.log(
          "---> SESSION INFORMATION:",
          JSON.stringify(request.session)
        );
        response.render("loggedin");
      } else {
        console.log("Wrong password");
        const model = { error: "Wrong password! Please try again." };
        response.render("login", model);
      }
    });
  } else {
    console.log("Wrong username");
    const model = { error: "Wrong username! Please try again." };
    response.render("login", model);
  }*/

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [request.body.un],
    (error, user) => {
      if (error) {
        console.log("Database error: ", error);
        const model = { error: "Database error occurred" };
        response.render("login", model);
      } else if (!user) {
        console.log("Wrong username");
        const model = { error: "Wrong username! Please try again." };
        response.render("login", model);
      } else {
        // User found, check password
        bcrypt.compare(request.body.pw, user.password_hash, (err, result) => {
          if (err) {
            console.log("Error in password comparison");
            const model = { error: "Error in password comparison" };
            response.render("login", model);
          } else if (result) {
            // Password is correct
            request.session.isLoggedIn = true;
            request.session.un = user.username;
            request.session.isAdmin = user.isAdmin === 1;
            console.log(
              "---> SESSION INFORMATION:",
              JSON.stringify(request.session)
            );
            response.render("loggedin");
          } else {
            console.log("Wrong password");
            const model = { error: "Wrong password! Please try again." };
            response.render("login", model);
          }
        });
      }
    }
  );
});

//Hash password
function hashPassword(pw, saltRounds) {
  bcrypt.hash(pw, saltRounds, function (err, hash) {
    if (err) {
      console.error("---> Error hashing password:", err);
    } else {
      console.log(`---> Hashed password: ${hash}`);
    }
  });
}

//--LOGOUT PROCESSING
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error while destroying session:", err);
      res.redirect("/");
    } else {
      console.log("Logged out...");
      res.redirect("/");
    }
  });
});

//--LISTEN TO INCOMING REQUESTS
app.listen(port, function () {
  hashPassword("wdf#2025", 12);
  initTableSkills(db);
  initTableProjects(db);
  initTableUsers(db);
  console.log(`Server up and running on http://localhost:${port}...`);
});

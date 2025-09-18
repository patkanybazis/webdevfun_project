const express = require("express");
const port = 8080;
const app = express();
const sqlite3 = require("sqlite3");
const dbFile = "my-project-db.sqlite3.db";
const db = new sqlite3.Database(dbFile);

app.use(express.static(__dirname)); //by mr. gpt cus the css was not working

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/cv", function (req, res) {
  res.sendFile(
    __dirname +
      "C:\\Users\\Adri\\OneDrive - Jonkoping University\\Desktop\\project-WDF\\views\\mycv-02.html"
  );
});

app.get("/rawpersons", function (req, res) {
  db.all("SELECT * FROM Person", function (err, rawPersons) {
    if (err) {
      console.log("error: ", err);
    } else {
      console.log("Data found, sending it back to the client...");
      res.send(rawPersons);
    }
  });
});

app.get("/listpersons", function (req, res) {
  db.all("SELECT * FROM Person", function (err, rawPersons) {
    if (err) {
      console.log("Error: ", +err);
    } else {
      listPersonsHTML = "<ul>";
      rawPersons.forEach(function (onePerson) {
        listPersonsHTML += "<li>";
        listPersonsHTML += `${onePerson.fname},`;
        listPersonsHTML += `${onePerson.lname},`;
        listPersonsHTML += `${onePerson.age},`;
        listPersonsHTML += `${onePerson.email},`;
        listPersonsHTML += "</li>";
      });
      listPersonsHTML += "</ul>";
      res.send(listPersonsHTML);
    }
  });
});

app.listen(port, () => {
  console.log(`Server up and running on http://localhost:${port}...`);
});

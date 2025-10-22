/*

Adrienn Rátonyi - raad23tt@student.ju.se

Target grade: 5

Project Web Dev Fun - 2025


Admininistrator login: admin
Administrator password: "wdf#2025" --->
"$2b$12$D8vMHr3ev5gFGG1Qf4JQMeow3GUG7ZmAfITlXqEIAgg.iiQPs.pDK"

Notes:

Some code in this project were generated with the help of ChatGPT
Several images come from the web: google images
Pagination is on the songs page

*/

//--- LOAD THE PACKAGES

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

//STORE SESSIONS IN THE DATABASE
const SqliteStore = connectSqlite3(session);

//DEFINE THE SESSION

app.use(
  session({
    store: new SqliteStore({ db: "sessions-db.db" }),
    saveUninitialized: false,
    resave: false,
    secret: "This123Is@Another#456GreatSecret678%Sentence",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

//HANDLEBARS
app.engine(
  "handlebars",
  engine({
    helpers: {
      eq: (a, b) => a === b,
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
      increment: (v) => Number(v) + 1,
      decrement: (v) => Number(v) - 1,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./views");

//MIDDLEWARES
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
//make the session available in all handlebars files at once
app.use((request, response, next) => {
  response.locals.session = request.session;
  next();
});

function requireLogin(req, res, next) {
  if (req.session && req.session.isLoggedIn) return next();
  return res
    .status(403)
    .render("home.handlebars", { error: "You must be logged in." });
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isLoggedIn && req.session.isAdmin)
    return next();
  return res
    .status(403)
    .render("home.handlebars", { error: "Admin privileges required." });
}

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

//------------------------------------------
//TABLES
//------------------------------------------

// ARTISTS TABLE
function initTableArtists(mydb) {
  // MODEL for artists
  const artists = [
    {
      id: 1,
      name: "The Weeknd",
      genre: "R&B",
      country: "Canada",
      formed_year: 2010,
      bio: "Canadian singer, songwriter, and record producer known for his dark R&B style.",
      image_url: "/img/theweeknd.jpg",
    },
    {
      id: 2,
      name: "Melanie Martinez",
      genre: "Alternative Pop",
      country: "United States",
      formed_year: 2012,
      bio: "American singer-songwriter known for her conceptual albums and unique visual style.",
      image_url: "/img/melaniemartinez.jpg",
    },
    {
      id: 3,
      name: "Lana Del Rey",
      genre: "Dream Pop",
      country: "United States",
      formed_year: 2011,
      bio: "American singer-songwriter known for her cinematic style and nostalgic themes.",
      image_url: "/img/lanadelrey.jpeg",
    },
    {
      id: 4,
      name: "Teddy Swims",
      genre: "Soul",
      country: "United States",
      formed_year: 2019,
      bio: "American singer-songwriter blending R&B, soul, country, and pop music.",
      image_url: "/img/teddyswims.jpeg",
    },
    {
      id: 5,
      name: "Ariana Grande",
      genre: "Pop",
      country: "United States",
      formed_year: 2011,
      bio: "American singer and actress known for her four-octave vocal range.",
      image_url: "/img/arianagrande.jpg",
    },
  ];

  //create table artists at startup
  mydb.run(
    "CREATE TABLE artists (aid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, genre TEXT NOT NULL, country TEXT NOT NULL, formed_year INTEGER, bio TEXT, image_url TEXT, created_by INTEGER, FOREIGN KEY(created_by) REFERENCES users(uid))",
    (error) => {
      if (error) {
        console.log("ERROR creating artists table: ", error);
      } else {
        console.log("---> Table artists created");
        //insert artists
        artists.forEach((oneArtist) => {
          mydb.run(
            `INSERT INTO artists
      (aid, name, genre, country, formed_year, bio, image_url, created_by)
     VALUES (?,   ?,    ?,     ?,       ?,           ?,   ?,         ?)`,
            [
              oneArtist.id,
              oneArtist.name,
              oneArtist.genre,
              oneArtist.country,
              oneArtist.formed_year,
              oneArtist.bio,
              oneArtist.image_url,
              1,
            ],
            (error) => {
              if (error) console.log("ERROR inserting artist:", error);
              else console.log("Artist added:", oneArtist.name);
            }
          );
        });
      }
    }
  );
}

// ALBUMS TABLE
function initTableAlbums(mydb) {
  // MODEL for albums (2/artist)
  const albums = [
    // The Weeknd
    {
      album_id: 1,
      title: "After Hours",
      release_year: 2020,
      artist_id: 1,
      cover_url: "/img/afterhours.png",
      description: "Dark and introspective R&B album",
    },
    {
      album_id: 2,
      title: "Dawn FM",
      release_year: 2022,
      artist_id: 1,
      cover_url: "/img/dawnfm.png",
      description: "Conceptual album with 80s synth-pop influences",
    },

    // Melanie Martinez
    {
      album_id: 3,
      title: "Cry Baby",
      release_year: 2015,
      artist_id: 2,
      cover_url: "/img/crybaby.png",
      description: "Debut album with dark nursery rhyme themes",
    },
    {
      album_id: 4,
      title: "K-12",
      release_year: 2019,
      artist_id: 2,
      cover_url: "/img/k12.jpg",
      description: "Concept album about school and growing up",
    },

    // Lana Del Rey
    {
      album_id: 5,
      title: "Born to Die",
      release_year: 2012,
      artist_id: 3,
      cover_url: "/img/borntodie.png",
      description: "Debut studio album with cinematic pop sound",
    },
    {
      album_id: 6,
      title: "Norman Fucking Rockwell!",
      release_year: 2019,
      artist_id: 3,
      cover_url: "/img/rockwell.png",
      description: "Critically acclaimed album blending rock and pop",
    },

    // Teddy Swims
    {
      album_id: 7,
      title: "Unlearning",
      release_year: 2021,
      artist_id: 4,
      cover_url: "/img/unlearning.jpg",
      description: "Debut EP showcasing soulful vocals",
    },
    {
      album_id: 8,
      title: "Sleep Is For Dreamers",
      release_year: 2022,
      artist_id: 4,
      cover_url: "/img/sleep.jpg",
      description: "Full-length album mixing soul and pop",
    },

    // Ariana Grande
    {
      album_id: 9,
      title: "Thank U, Next",
      release_year: 2019,
      artist_id: 5,
      cover_url: "/img/thankyounext.png",
      description: "Pop album about growth and self-love",
    },
    {
      album_id: 10,
      title: "Positions",
      release_year: 2020,
      artist_id: 5,
      cover_url: "/img/positions.png",
      description: "R&B influenced pop album",
    },
  ];

  //create table albums at startup
  mydb.run(
    "CREATE TABLE albums (album_id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, release_year INTEGER, artist_id INTEGER NOT NULL, cover_url TEXT, description TEXT, created_by INTEGER, FOREIGN KEY(artist_id) REFERENCES artists(aid), FOREIGN KEY(created_by) REFERENCES users(uid))",
    (error) => {
      if (error) {
        console.log("ERROR creating albums table: ", error);
      } else {
        console.log("---> Table albums created");
        //insert albums
        albums.forEach((oneAlbum) => {
          mydb.run(
            `INSERT INTO albums
      (album_id, title, release_year, artist_id, cover_url, description, created_by)
     VALUES (?,         ?,     ?,           ?,         ?,         ?,          ?)`,
            [
              oneAlbum.album_id, // <- explicit id so songs FK match
              oneAlbum.title,
              oneAlbum.release_year,
              oneAlbum.artist_id,
              oneAlbum.cover_url,
              oneAlbum.description,
              1,
            ],
            (error) => {
              if (error) console.log("ERROR inserting album:", error);
              else console.log("Album added:", oneAlbum.title);
            }
          );
        });
      }
    }
  );
}

//SONGS TABLE
function initTableSongs(mydb) {
  // MODEL for songs (10 songs/artist)
  const songs = [
    // The Weeknd (artist_id: 1)
    {
      title: "Blinding Lights",
      duration: "3:20",
      artist_id: 1,
      album_id: 1,
      track_number: 2,
    },
    {
      title: "Save Your Tears",
      duration: "3:35",
      artist_id: 1,
      album_id: 1,
      track_number: 5,
    },
    {
      title: "After Hours",
      duration: "6:01",
      artist_id: 1,
      album_id: 1,
      track_number: 14,
    },
    {
      title: "Heartless",
      duration: "3:18",
      artist_id: 1,
      album_id: 1,
      track_number: 1,
    },
    {
      title: "In Your Eyes",
      duration: "3:57",
      artist_id: 1,
      album_id: 1,
      track_number: 8,
    },
    {
      title: "Take My Breath",
      duration: "3:40",
      artist_id: 1,
      album_id: 2,
      track_number: 1,
    },
    {
      title: "Sacrifice",
      duration: "3:08",
      artist_id: 1,
      album_id: 2,
      track_number: 4,
    },
    {
      title: "Out of Time",
      duration: "3:34",
      artist_id: 1,
      album_id: 2,
      track_number: 6,
    },
    {
      title: "Dawn FM",
      duration: "1:29",
      artist_id: 1,
      album_id: 2,
      track_number: 2,
    },
    {
      title: "Gasoline",
      duration: "3:32",
      artist_id: 1,
      album_id: 2,
      track_number: 3,
    },

    // Melanie Martinez (artist_id: 2)
    {
      title: "Cry Baby",
      duration: "3:35",
      artist_id: 2,
      album_id: 3,
      track_number: 1,
    },
    {
      title: "Dollhouse",
      duration: "3:36",
      artist_id: 2,
      album_id: 3,
      track_number: 2,
    },
    {
      title: "Sippy Cup",
      duration: "3:11",
      artist_id: 2,
      album_id: 3,
      track_number: 3,
    },
    {
      title: "Carousel",
      duration: "3:30",
      artist_id: 2,
      album_id: 3,
      track_number: 4,
    },
    {
      title: "Pity Party",
      duration: "3:09",
      artist_id: 2,
      album_id: 3,
      track_number: 6,
    },
    {
      title: "Wheels on the Bus",
      duration: "3:14",
      artist_id: 2,
      album_id: 4,
      track_number: 1,
    },
    {
      title: "Class Fight",
      duration: "3:05",
      artist_id: 2,
      album_id: 4,
      track_number: 2,
    },
    {
      title: "The Principal",
      duration: "3:31",
      artist_id: 2,
      album_id: 4,
      track_number: 3,
    },
    {
      title: "Show & Tell",
      duration: "3:17",
      artist_id: 2,
      album_id: 4,
      track_number: 4,
    },
    {
      title: "Nurse's Office",
      duration: "3:38",
      artist_id: 2,
      album_id: 4,
      track_number: 5,
    },

    // Lana Del Rey (artist_id: 3)
    {
      title: "Video Games",
      duration: "4:41",
      artist_id: 3,
      album_id: 5,
      track_number: 2,
    },
    {
      title: "Born to Die",
      duration: "4:46",
      artist_id: 3,
      album_id: 5,
      track_number: 3,
    },
    {
      title: "Blue Jeans",
      duration: "3:29",
      artist_id: 3,
      album_id: 5,
      track_number: 4,
    },
    {
      title: "Summertime Sadness",
      duration: "4:25",
      artist_id: 3,
      album_id: 5,
      track_number: 6,
    },
    {
      title: "National Anthem",
      duration: "3:50",
      artist_id: 3,
      album_id: 5,
      track_number: 7,
    },
    {
      title: "Mariners Apartment Complex",
      duration: "4:07",
      artist_id: 3,
      album_id: 6,
      track_number: 1,
    },
    {
      title: "Venice Bitch",
      duration: "9:37",
      artist_id: 3,
      album_id: 6,
      track_number: 2,
    },
    {
      title: "Doin' Time",
      duration: "3:21",
      artist_id: 3,
      album_id: 6,
      track_number: 14,
    },
    {
      title: "The Greatest",
      duration: "5:01",
      artist_id: 3,
      album_id: 6,
      track_number: 12,
    },
    {
      title: "Fuck it I love you",
      duration: "3:39",
      artist_id: 3,
      album_id: 6,
      track_number: 13,
    },

    // Teddy Swims (artist_id: 4)
    {
      title: "Broke",
      duration: "3:12",
      artist_id: 4,
      album_id: 7,
      track_number: 1,
    },
    {
      title: "Picky",
      duration: "2:58",
      artist_id: 4,
      album_id: 7,
      track_number: 2,
    },
    {
      title: "911",
      duration: "3:44",
      artist_id: 4,
      album_id: 7,
      track_number: 3,
    },
    {
      title: "Simple Things",
      duration: "3:21",
      artist_id: 4,
      album_id: 7,
      track_number: 4,
    },
    {
      title: "My Bad",
      duration: "3:15",
      artist_id: 4,
      album_id: 7,
      track_number: 5,
    },
    {
      title: "Bed on Fire",
      duration: "3:33",
      artist_id: 4,
      album_id: 8,
      track_number: 1,
    },
    {
      title: "Stay",
      duration: "3:18",
      artist_id: 4,
      album_id: 8,
      track_number: 2,
    },
    {
      title: "Lose Control",
      duration: "3:45",
      artist_id: 4,
      album_id: 8,
      track_number: 3,
    },
    {
      title: "All of Me",
      duration: "4:12",
      artist_id: 4,
      album_id: 8,
      track_number: 4,
    },
    {
      title: "Someone You Loved",
      duration: "3:02",
      artist_id: 4,
      album_id: 8,
      track_number: 5,
    },

    // Ariana Grande(artist_id: 5)
    {
      title: "thank u, next",
      duration: "3:27",
      artist_id: 5,
      album_id: 9,
      track_number: 1,
    },
    {
      title: "7 rings",
      duration: "2:58",
      artist_id: 5,
      album_id: 9,
      track_number: 2,
    },
    {
      title: "break up with your girlfriend, i'm bored",
      duration: "3:10",
      artist_id: 5,
      album_id: 9,
      track_number: 12,
    },
    {
      title: "NASA",
      duration: "3:02",
      artist_id: 5,
      album_id: 9,
      track_number: 4,
    },
    {
      title: "needy",
      duration: "2:52",
      artist_id: 5,
      album_id: 9,
      track_number: 7,
    },
    {
      title: "positions",
      duration: "2:52",
      artist_id: 5,
      album_id: 10,
      track_number: 1,
    },
    {
      title: "34+35",
      duration: "2:54",
      artist_id: 5,
      album_id: 10,
      track_number: 2,
    },
    {
      title: "motive",
      duration: "2:57",
      artist_id: 5,
      album_id: 10,
      track_number: 3,
    },
    {
      title: "just like magic",
      duration: "2:31",
      artist_id: 5,
      album_id: 10,
      track_number: 4,
    },
    {
      title: "off the table",
      duration: "4:01",
      artist_id: 5,
      album_id: 10,
      track_number: 5,
    },
  ];

  //create table songs at startup
  mydb.run(
    "CREATE TABLE songs (sid INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, duration TEXT NOT NULL, artist_id INTEGER NOT NULL, album_id INTEGER, track_number INTEGER, created_by INTEGER, FOREIGN KEY(artist_id) REFERENCES artists(aid), FOREIGN KEY(album_id) REFERENCES albums(album_id), FOREIGN KEY(created_by) REFERENCES users(uid))",
    (error) => {
      if (error) {
        console.log("ERROR creating songs table: ", error);
      } else {
        console.log("---> Table songs created");
        //insert songs
        songs.forEach((oneSong) => {
          db.run(
            "INSERT INTO songs (title, duration, artist_id, album_id, track_number, created_by) VALUES (?, ?, ?, ?, ?, ?)",
            [
              oneSong.title,
              oneSong.duration,
              oneSong.artist_id,
              oneSong.album_id,
              oneSong.track_number,
              1,
            ],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("Song added to songs table!");
              }
            }
          );
        });
      }
    }
  );
}

//------------------------------------------
//ROUTES
//------------------------------------------

app.get("/", (req, res) => {
  // get 5 songs with album cover and artist name
  const qSongs = `
    SELECT s.sid, s.title, a.cover_url, ar.name AS artist_name
    FROM songs s
    JOIN albums a ON s.album_id = a.album_id
    JOIN artists ar ON s.artist_id = ar.aid
    ORDER BY RANDOM() LIMIT 5
  `;

  // get 5 artists
  const qArtists = `
    SELECT aid, name, genre, image_url
    FROM artists
    ORDER BY RANDOM() LIMIT 5
  `;

  // get 5 albums with artist name
  const qAlbums = `
    SELECT a.album_id, a.title, a.cover_url, ar.name AS artist_name
    FROM albums a
    JOIN artists ar ON a.artist_id = ar.aid
    ORDER BY RANDOM() LIMIT 5
  `;

  db.all(qSongs, [], (e1, songs) => {
    if (e1)
      return res.render("home.handlebars", { error: "Could not load songs" });
    db.all(qArtists, [], (e2, artists) => {
      if (e2)
        return res.render("home.handlebars", {
          error: "Could not load artists",
        });
      db.all(qAlbums, [], (e3, albums) => {
        if (e3)
          return res.render("home.handlebars", {
            error: "Could not load albums",
          });
        res.render("home.handlebars", {
          popularSongs: songs,
          popularArtists: artists,
          popularAlbums: albums,
        });
      });
    });
  });
});

/*------------------*/

app.get("/about", (req, res) => {
  res.render("about.handlebars");
});

app.get("/contact", (req, res) => {
  res.render("contact.handlebars");
});

app.get("/albums", (req, res) => {
  const sql = `
    SELECT 
      a.album_id,
      a.title,
      a.cover_url,
      a.release_year,
      a.description,
      a.artist_id,
      ar.name AS artist_name
    FROM albums a
    LEFT JOIN artists ar ON ar.aid = a.artist_id
    ORDER BY a.title COLLATE NOCASE
  `;
  db.all(sql, [], (err, albums) => {
    if (err)
      return res
        .status(500)
        .render("home.handlebars", { error: "Database error loading albums" });
    res.render("albums.handlebars", { albums, session: req.session });
  });
});

// List songs with pagination and JOIN to show album cover
app.get("/songs", (req, res) => {
  const perPage = 10;
  const page = Math.max(1, parseInt(req.query.page || "1", 10));

  db.get("SELECT COUNT(*) AS c FROM songs", [], (err, row) => {
    if (err)
      return res
        .status(500)
        .render("home.handlebars", { error: "Count failed" });

    const total = row.c || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;

    const sql = `
      SELECT s.sid, s.title, s.duration, s.track_number,
             a.album_id, a.title AS album_title, a.cover_url,
             ar.aid AS artist_id, ar.name AS artist_name
      FROM songs s
      JOIN albums a ON s.album_id = a.album_id
      JOIN artists ar ON s.artist_id = ar.aid
      ORDER BY s.title
      LIMIT ? OFFSET ?
    `;
    db.all(sql, [perPage, offset], (error, rows) => {
      if (error)
        return res
          .status(500)
          .render("home.handlebars", { error: "Query failed" });
      res.render("songs.handlebars", {
        songs: rows,
        pagination: { page, totalPages },
      });
    });
  });
});

app.get("/artists/:aid", (req, res) => {
  const artistId = req.params.aid;
  db.get("SELECT * FROM artists WHERE aid = ?", [artistId], (err, artist) => {
    if (err) return res.status(500).render("home", { error: "Database error" });
    if (!artist) return res.status(404).render("404");
    res.render("one-artist.handlebars", { artist });
  });
});

app.get("/artists", (req, res) => {
  db.all("SELECT * FROM artists ORDER BY name", [], (error, rows) => {
    if (error) {
      return res
        .status(500)
        .render("home.handlebars", { error: "Query failed" });
    }
    res.render("artists.handlebars", { artists: rows });
  });
});

// ---- SONGS CUD, ADMIN ONLY ----

// create form
app.get("/songs/new", requireAdmin, (req, res) => {
  db.all("SELECT aid, name FROM artists ORDER BY name", [], (e1, artists) => {
    if (e1)
      return res
        .status(500)
        .render("home.handlebars", { error: "Artists load failed" });
    db.all(
      "SELECT album_id, title FROM albums ORDER BY title",
      [],
      (e2, albums) => {
        if (e2)
          return res
            .status(500)
            .render("home.handlebars", { error: "Albums load failed" });
        res.render("song-form.handlebars", {
          mode: "create",
          song: {},
          artists,
          albums,
        });
      }
    );
  });
});

// create in DB
app.post("/songs/create", requireAdmin, (req, res) => {
  const { title, duration, artist_id, album_id, track_number } = req.body;
  db.run(
    "INSERT INTO songs (title, duration, artist_id, album_id, track_number, created_by) VALUES (?, ?, ?, ?, ?, ?)",
    [title, duration, artist_id, album_id || null, track_number || null, 1],
    (err) => {
      if (err)
        return res
          .status(500)
          .render("home.handlebars", { error: "Insert failed" });
      res.redirect("/songs");
    }
  );
});

// update form
app.get("/songs/modify/:sid", requireAdmin, (req, res) => {
  const sid = parseInt(req.params.sid, 10);
  db.get("SELECT * FROM songs WHERE sid = ?", [sid], (e0, song) => {
    if (e0)
      return res
        .status(500)
        .render("home.handlebars", { error: "Load failed" });
    if (!song) return res.status(404).render("404.handlebars");
    db.all("SELECT aid, name FROM artists ORDER BY name", [], (e1, artists) => {
      if (e1)
        return res
          .status(500)
          .render("home.handlebars", { error: "Artists load failed" });
      db.all(
        "SELECT album_id, title FROM albums ORDER BY title",
        [],
        (e2, albums) => {
          if (e2)
            return res
              .status(500)
              .render("home.handlebars", { error: "Albums load failed" });
          res.render("song-form.handlebars", {
            mode: "update",
            song,
            artists,
            albums,
          });
        }
      );
    });
  });
});

// update in DB
app.post("/songs/modify/:sid", requireAdmin, (req, res) => {
  const { title, duration, artist_id, album_id, track_number } = req.body;
  db.run(
    "UPDATE songs SET title = ?, duration = ?, artist_id = ?, album_id = ?, track_number = ? WHERE sid = ?",
    [
      title,
      duration,
      artist_id,
      album_id || null,
      track_number || null,
      req.params.sid,
    ],
    (err) => {
      if (err)
        return res
          .status(500)
          .render("home.handlebars", { error: "Update failed" });
      res.redirect("/songs");
    }
  );
});

// delete in DB
app.post("/songs/delete/:sid", requireAdmin, (req, res) => {
  db.run("DELETE FROM songs WHERE sid = ?", [req.params.sid], (err) => {
    if (err)
      return res
        .status(500)
        .render("home.handlebars", { error: "Delete failed" });
    res.redirect("/songs");
  });
});

// One song detail with album and artist info
app.get("/songs/:sid", (req, res) => {
  const sid = parseInt(req.params.sid, 10);
  if (!Number.isFinite(sid)) return res.status(400).render("404.handlebars");

  const sql = `
    SELECT s.*, a.title AS album_title, a.cover_url,
           ar.name AS artist_name
    FROM songs s
    JOIN albums a ON s.album_id = a.album_id
    JOIN artists ar ON s.artist_id = ar.aid
    WHERE s.sid = ?
  `;
  db.get(sql, [sid], (err, song) => {
    if (err)
      return res
        .status(500)
        .render("home.handlebars", { error: "Database error" });
    if (!song) return res.status(404).render("404.handlebars");
    res.render("one-song.handlebars", { song });
  });
});

// ---- ALBUMS CUD, ADMIN ONLY ----

// create form
app.get("/albums/new", requireAdmin, (req, res) => {
  db.all("SELECT aid, name FROM artists ORDER BY name", [], (e1, artists) => {
    if (e1) {
      return res
        .status(500)
        .render("home.handlebars", { error: "Artists load failed" });
    }
    // render empty album object for create mode
    res.render("album-form.handlebars", {
      mode: "create",
      album: {},
      artists,
    });
  });
});

// create in DB
app.post("/albums/create", requireAdmin, (req, res) => {
  const { title, artist_id, release_year, cover_url, description } = req.body;

  db.run(
    `INSERT INTO albums (title, artist_id, release_year, cover_url, description)
     VALUES (?, ?, ?, ?, ?)`,
    [
      title,
      artist_id,
      release_year || null,
      cover_url || null,
      description || null,
    ],
    (err) => {
      if (err) {
        return res
          .status(500)
          .render("home.handlebars", { error: "Insert failed" });
      }
      res.redirect("/albums");
    }
  );
});

// update form
app.get("/albums/modify/:album_id", requireAdmin, (req, res) => {
  const albumId = parseInt(req.params.album_id, 10);

  db.get("SELECT * FROM albums WHERE album_id = ?", [albumId], (e0, album) => {
    if (e0) {
      return res
        .status(500)
        .render("home.handlebars", { error: "Load failed" });
    }
    if (!album) return res.status(404).render("404.handlebars");

    db.all("SELECT aid, name FROM artists ORDER BY name", [], (e1, artists) => {
      if (e1) {
        return res
          .status(500)
          .render("home.handlebars", { error: "Artists load failed" });
      }

      res.render("album-form.handlebars", {
        mode: "update",
        album,
        artists,
      });
    });
  });
});

//update in db
app.post("/albums/modify/:album_id", requireAdmin, (req, res) => {
  const albumId = parseInt(req.params.album_id, 10);
  const { title, artist_id, release_year, cover_url, description } = req.body;

  db.run(
    `UPDATE albums
       SET title = ?, artist_id = ?, release_year = ?, cover_url = ?, description = ?
     WHERE album_id = ?`,
    [
      title,
      artist_id,
      release_year || null,
      cover_url || null,
      description || null,
      albumId,
    ],
    (err) => {
      if (err) {
        return res
          .status(500)
          .render("home.handlebars", { error: "Update failed" });
      }
      res.redirect("/albums");
    }
  );
});

//delete in db
app.post("/albums/delete/:album_id", requireAdmin, (req, res) => {
  const albumId = parseInt(req.params.album_id, 10);

  db.run("DELETE FROM albums WHERE album_id = ?", [albumId], (err) => {
    if (err) {
      return res
        .status(500)
        .render("home.handlebars", { error: "Delete failed" });
    }
    res.redirect("/albums");
  });
});

// ---- USERS CUD, ADMIN ONLY----

// list users
app.get("/admin/users", requireAdmin, (req, res) => {
  db.all(
    "SELECT uid, username, isAdmin FROM users ORDER BY username",
    [],
    (err, users) => {
      if (err)
        return res
          .status(500)
          .render("home.handlebars", { error: "Users query failed" });
      res.render("users.handlebars", { users });
    }
  );
});

// show create user form
app.get("/admin/users/new", requireAdmin, (req, res) => {
  res.render("user-form.handlebars", { mode: "create", user: {} });
});

// create user, hash password
app.post("/admin/users/create", requireAdmin, (req, res) => {
  const { username, password } = req.body;
  const isAdmin = req.body.isAdmin ? 1 : 0;

  if (!username || !password) {
    return res.status(400).render("user-form.handlebars", {
      mode: "create",
      user: {},
      error: "Username and password are required.",
    });
  }

  bcrypt.hash(password, 12, (err, hash) => {
    if (err)
      return res
        .status(500)
        .render("home.handlebars", { error: "Hash failed" });
    db.run(
      "INSERT INTO users (username, password_hash, isAdmin) VALUES (?, ?, ?)",
      [username, hash, isAdmin],
      (e) =>
        e
          ? res
              .status(500)
              .render("home.handlebars", { error: "Insert user failed" })
          : res.redirect("/admin/users")
    );
  });
});

// show edit user form
app.get("/admin/users/modify/:uid", requireAdmin, (req, res) => {
  db.get(
    "SELECT uid, username, isAdmin FROM users WHERE uid = ?",
    [req.params.uid],
    (err, user) => {
      if (err)
        return res
          .status(500)
          .render("home.handlebars", { error: "Load user failed" });
      if (!user) return res.status(404).render("404.handlebars");
      res.render("user-form.handlebars", { mode: "update", user });
    }
  );
});

// update user, optional password change
app.post("/admin/users/modify/:uid", requireAdmin, (req, res) => {
  const { username, password } = req.body;
  const isAdmin = req.body.isAdmin ? 1 : 0;

  if (!username) {
    return res.status(400).render("user-form.handlebars", {
      mode: "update",
      user: { uid: req.params.uid, username, isAdmin },
      error: "Username is required.",
    });
  }

  const doUpdate = (hash) => {
    const sql = hash
      ? "UPDATE users SET username = ?, isAdmin = ?, password_hash = ? WHERE uid = ?"
      : "UPDATE users SET username = ?, isAdmin = ? WHERE uid = ?";
    const params = hash
      ? [username, isAdmin, hash, req.params.uid]
      : [username, isAdmin, req.params.uid];

    db.run(sql, params, (e) =>
      e
        ? res
            .status(500)
            .render("home.handlebars", { error: "Update user failed" })
        : res.redirect("/admin/users")
    );
  };

  if (password && password.trim().length > 0) {
    bcrypt.hash(password, 12, (err, hash) =>
      err
        ? res.status(500).render("home.handlebars", { error: "Hash failed" })
        : doUpdate(hash)
    );
  } else {
    doUpdate(null);
  }
});

// delete user
app.post("/admin/users/delete/:uid", requireAdmin, (req, res) => {
  db.run("DELETE FROM users WHERE uid = ?", [req.params.uid], (e) =>
    e
      ? res
          .status(500)
          .render("home.handlebars", { error: "Delete user failed" })
      : res.redirect("/admin/users")
  );
});

//---LOGIN FORM
app.get("/login", (req, res) => {
  res.render("login");
});

//--LOGIN PROCESSING
app.post("/login", (request, response) => {
  console.log(
    `Here comes the data received from the form on the client: ${request.body.un} - ${request.body.pw}`
  );

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

//--HASH PASSWORD
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

//--404 ERROR HANDLING
app.use((req, res) => {
  res.status(404).render("404.handlebars");
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .render("home.handlebars", { error: "Internal server error." });
});

//--LISTEN TO INCOMING REQUESTS
app.listen(port, function () {
  hashPassword("wdf#2025", 12);
  initTableUsers(db);
  initTableArtists(db);
  initTableAlbums(db);
  initTableSongs(db);
  console.log(`Server up and running on http://localhost:${port}...`);
});

// const MongoClientPromise = require('./mongodb')
const { connectToDB, getDB } = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const data = require("./MOCK_DATA");
const ObjectId = require("mongodb").ObjectId;

// Init App & middleware
const app = express();
app.use(cors());
app.use(express.json());
// DB connection
let db;
connectToDB((err) => {
  if (!err) {
    const server = app.listen(3001, () => {
      console.log("App listening on port", server.address().port);
    });
    db = getDB();
  }
});

// A lazy way to seed the database. There must be some mockup data present on the root of the project.

// setTimeout(() => {
//   const test = db.collection("EmployeeDB").insertMany(data, (err, res) => {
//     if (err) throw err;
//     console.log("Database seeded.");
//   });
// }, 1000);

// A lazy way to delete everything
// setTimeout(() => {
//   const test = db.collection("EmployeeDB").remove();
// }, 6000);

app.post("/", (req, res) => {
  console.log(req.body);
  if (
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.email ||
    !req.body.Gender
  ) {
    res.status(401).json({ "Dude...": "lame..." });
    return;
  }
  const today = new Date();
  const date_only =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const date = date_only + "T" + time;
  const employeeToRegisterData = { ...req.body, date };

  db.collection("EmployeeDB").insertOne(
    { ...employeeToRegisterData },
    (err, res) => {
      if (err) throw err;
      // console.log('One new employee added to the database', employeeToRegisterData);
      // db.close()
    }
  );
  res.json({ body: req.body });
});

app.delete(`/${process.env.ROUTE}/deleteAll`, (req, res) => {
  db.collection("EmployeeDB").remove();
  res.json({ body: req.body });
});

app.delete(`/${process.env.ROUTE}/rowsToBeDeleted`, (req, res) => {
  const rowsToBeDeleted = req.body;
  console.log("rowsToBeDeleted", rowsToBeDeleted);
  // MongoDB uses a specific type for _id. We need to return a new ObjectId for each row id we want to delete.
  // Otherwise, any attempt to INSERT/DELETE etc using a string representation of the ObjectId, will fail, without throwing an error.
  // Only { acknowledged: true, deletedCount: 0 } will be returned.
  const rowsToBeDeletedToObjectId = rowsToBeDeleted.map((row) => {
    return ObjectId(row);
  });
  // console.log(rowsToBeDeletedToObjectId[0]);
  const query = { _id: { $in: rowsToBeDeletedToObjectId } };
  db.collection("EmployeeDB").deleteMany(query, (err, res) => {
    if (err) throw err;
    console.log(res);
  });

  res.json({ body: req.body });
});

app.get(`/${process.env.ROUTE}`, async (req, res) => {
  const data = await db
    .collection("EmployeeDB")
    .find()
    .sort({ _id: -1 })
    .toArray();
  res.json(data);
});

app.get("/*", async (req, res) => {
  // const data = await db.collection('EmployeeDB').find().sort({_id:-1}).toArray()
  res.status(401);
  res.json({ "I'm sorry Dave!": "I'm afraid I can't do that!" });
});

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect(err=>{
  if(err) console.log(err);
  else console.log("MySQL Connected");
});

app.get("/", (req,res)=>{
  res.send("Backend Running");
});

app.listen(process.env.PORT || 3000, ()=>{
  console.log("Server running");
});

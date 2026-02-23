const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

const SECRET = "POS_SECRET_KEY";

function verifyToken(req,res,next){
  const token = req.headers.authorization;
  if(!token) return res.status(401).json("Unauthorized");
  jwt.verify(token, SECRET,(err,decoded)=>{
    if(err) return res.status(403).json("Invalid token");
    req.user = decoded;
    next();
  });
}

app.get("/", (req,res)=>{
  res.send("POS Backend Running");
});

app.post("/login", async (req,res)=>{
  const {username,password} = req.body;
  db.query("SELECT * FROM users WHERE username=?",[username],async (err,result)=>{
    if(result.length==0) return res.status(400).json("User tidak ada");

    const match = await bcrypt.compare(password,result[0].password);
    if(!match) return res.status(400).json("Password salah");

    const token = jwt.sign({
      id: result[0].id,
      role: result[0].role,
      username: result[0].username
    }, SECRET);

    res.json({token});
  });
});

app.get("/users", verifyToken, (req,res)=>{
  if(req.user.role !== "owner") return res.status(403).json("Forbidden");
  db.query("SELECT id,username,role,saldo FROM users",(err,result)=>{
    res.json(result);
  });
});

app.get("/products", verifyToken,(req,res)=>{
  db.query("SELECT * FROM products",(err,result)=>{
    res.json(result);
  });
});

app.post("/products", verifyToken,(req,res)=>{
  if(req.user.role==="user") return res.status(403).json("Forbidden");
  const {name,price} = req.body;
  db.query("INSERT INTO products(name,price) VALUES(?,?)",[name,price]);
  res.json("Product added");
});

app.listen(process.env.PORT || 3000, ()=>{
  console.log("Server running");
});

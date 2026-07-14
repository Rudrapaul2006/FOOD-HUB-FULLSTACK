import chalk from "chalk";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from 'http'
import { Server } from "socket.io";

import { DBconnect } from "./DBconnection.js";
import UserRoute from "./Routes/user.routes.js";
import shopRoute from "./Routes/shop.routes.js";
import foodRoute from "./Routes/food.route.js";
import orderRoute from "./Routes/order.routes.js";
import delivaryRoute from "./Routes/delivary.route.js";
import cartRoute from "./Routes/cart.route.js";
import { socketIO } from "./utils/socketIO.js";
import Redis from "ioredis";

dotenv.config()
let PORT = process.env.PORT

let app = express()
let server = http.createServer(app)

//Impliment of socket Io : 
let io = new Server(server, {
  cors: ({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST']
  })
})

//Set io on app (express server)
app.set("io", io)

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//Basic Route :
app.get("/", (req, res) => {
  res.send("HTTP Food Delivery Backend Running [io server]");
})

//Routes :  
app.use('/api/user', UserRoute)
app.use('/api/shop', shopRoute)
app.use('/api/food', foodRoute)
app.use('/api/order', orderRoute)
app.use('/api/delivary', delivaryRoute)
app.use('/api/cart', cartRoute)

//calling socket IO function :
socketIO(io)

// ading io redis in server :
let redisInstance = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379")

//redis connection :
redisInstance.on("connect", () => {
  console.log(chalk.red.bgBlack("Redis Connected"))
})

redisInstance.on("error", (err) => {
  console.log(chalk.red("Redis Error"), err)
})

server.listen(PORT, () => {
  //DB connection :
  DBconnect()

  console.log(chalk.green.bold(`HTTP Server running at http://localhost:${PORT}`))
})

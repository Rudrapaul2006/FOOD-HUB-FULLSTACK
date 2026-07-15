import express from "express";
import { isAuth } from "../isAuth/isAuthentication.js";
import { deleteFoodByID, getAllfoods, getFoodById, getFoodForLoginUser, getFoodsFromShop, registerFood, updateFoodDetails } from "../Controllers/food.controller.js";
import { upload } from "../isAuth/multer.js";
import { foodRegisterRateLimit } from "../RateLimiting/rateLimiting.js";

let foodRoute = express.Router()

foodRoute.post("/register" , isAuth, foodRegisterRateLimit ,  upload.single("image") ,registerFood)
foodRoute.get("/get", isAuth , getAllfoods)
foodRoute.get("/get/:id" , isAuth, getFoodById)
foodRoute.put("/update/:id" , isAuth,upload.single("image"), updateFoodDetails)
foodRoute.delete("/delete/:id" , isAuth, deleteFoodByID )

//User route :
foodRoute.get("/usergetallfoods", isAuth , getFoodForLoginUser)  // [for login user]
foodRoute.get("/getallshopfoods/:id", isAuth , getFoodsFromShop)

export default foodRoute;
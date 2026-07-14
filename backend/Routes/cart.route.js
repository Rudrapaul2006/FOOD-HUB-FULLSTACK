import express from 'express'
import {isAuth} from "../isAuth/isAuthentication.js"
import { addToCart, deleteAllFoodFromCart, deleteFoodFromCart, getCartFoodData, getFoodById, updateQuantityInCart } from '../Controllers/cart.controller.js';

let cartRoute = express.Router();

cartRoute.post("/add/:id", isAuth , addToCart)
cartRoute.get("/get", isAuth , getCartFoodData)
cartRoute.get("/get/:id", isAuth , getFoodById) 
cartRoute.delete("/delete/:id", isAuth , deleteFoodFromCart)
cartRoute.delete("/deleteall", isAuth , deleteAllFoodFromCart)
cartRoute.put("/update/:id", isAuth , updateQuantityInCart)

export default cartRoute;
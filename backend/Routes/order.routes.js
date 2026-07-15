import express from 'express';
import { isAuth } from "../isAuth/isAuthentication.js";
import { allShopOrder, DeleteUserOrderById, getAllCanceledOrders, getAllCartItem, getAllPendingOrders, getOrderById, getUserOrderById, getUserOrders, singleFoodGet, singleFoodOrder, singleOnlineOrder, updateOrderAddress, updateUserOrderStatus, userCancelAndCompleateorder, userCancelation, userOrders, verifyPayment } from '../Controllers/order.controller.js';
import { rateLimitForMultipleOrders, rateLimitForSingleOrder } from '../RateLimiting/rateLimiting.js';

let orderRoute = express.Router();

orderRoute.post("/applyallorder" , isAuth , rateLimitForMultipleOrders , allShopOrder) //[for multiple food order, COD]
orderRoute.post("/verifypayment" , isAuth , rateLimitForMultipleOrders ,  verifyPayment) //[for multiple food order, ONLINE]
orderRoute.get("/allitems", isAuth , getAllCartItem)

orderRoute.get("/get", isAuth, getAllPendingOrders ) //pending order (user to admin)
orderRoute.get("/getcancelorder" , isAuth , getAllCanceledOrders)
orderRoute.get("/getOrderbyid/:id", isAuth, getOrderById)  
orderRoute.get("/getorderdetails/:id" ,isAuth, getUserOrders ) //extra api
orderRoute.put("/updatestatus/:id" ,isAuth, updateUserOrderStatus )
orderRoute.delete("/delete/:id" ,isAuth, DeleteUserOrderById )
orderRoute.put("/updateaddress/:id" ,isAuth, updateOrderAddress)

//user single order get :
orderRoute.get("/singleCodOrder/:id", isAuth , singleFoodGet) //single food get from user cart to cheakout 

orderRoute.post("/orderSingleFood/:id", isAuth , rateLimitForSingleOrder , singleFoodOrder) // single food order from cheakout page 
orderRoute.post("/singleOnlineOrder/:id", isAuth , rateLimitForSingleOrder , singleOnlineOrder)

//User order get :
orderRoute.get("/userpendingorderget", isAuth , userOrders) 
orderRoute.get("/usercancelandcompleateorderget", isAuth , userCancelAndCompleateorder) 
orderRoute.get("/userorder/:id", isAuth , getUserOrderById)
orderRoute.put("/ordercancel/:id" , isAuth , userCancelation)

export default orderRoute;    
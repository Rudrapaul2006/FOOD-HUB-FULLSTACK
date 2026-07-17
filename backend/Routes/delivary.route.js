import express from 'express'
import { acceptedOrderByDelivaryBoy, acceptShopOrder, changeAcceptedOrderStatus, delivaryStatusUpdate, delivayPaymentStatus, getAllOrdersFromShop, howManyDelivaryCompleate, sendDelivaryOtpToUser, verifyDelivaryOtp } from '../Controllers/delivary.controller.js';
import { isAuth } from '../isAuth/isAuthentication.js';

let delivaryRoute = express.Router();

delivaryRoute.get("/get" , isAuth , getAllOrdersFromShop)
delivaryRoute.get("/acceptorder/:id" , isAuth , acceptShopOrder)
delivaryRoute.get("/acceptedorders/:id" , isAuth , acceptedOrderByDelivaryBoy)
delivaryRoute.post("/acceptorderstatusupdate" , isAuth , changeAcceptedOrderStatus) // [out for delivary => picked up and on_the_way]
delivaryRoute.put("/updatepaymentstatus/:id" , isAuth , delivayPaymentStatus)
delivaryRoute.put("/updatedelivarystatus/:id" , isAuth , delivaryStatusUpdate)
delivaryRoute.get("/getallorders" , isAuth , howManyDelivaryCompleate )

//Delivary otp send and verify otp :
delivaryRoute.get("/senddelivaryotp/:id" , isAuth , sendDelivaryOtpToUser)
delivaryRoute.post("/verifydelivaryotp/:id", verifyDelivaryOtp)

export default delivaryRoute;
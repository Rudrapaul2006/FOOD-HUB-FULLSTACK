import express from 'express';
import { isAuth } from '../isAuth/isAuthentication.js';
import { deleteShop, getShopById, getShop, ShopRegister, shopUpdate, ShopGeoLocation, getAllShops, shopStatus} from '../Controllers/shop.controller.js';
import { upload } from '../isAuth/multer.js';
import { shopRegisterRateLimit, shopStatusRateLimit } from '../RateLimiting/rateLimiting.js';

let shopRoute = express.Router();

//Shop routes :
shopRoute.post("/register", isAuth, shopRegisterRateLimit, upload.single("image"), ShopRegister);
shopRoute.get("/get", isAuth , getShop);
shopRoute.put("/update/:id", isAuth ,upload.single("image"), shopUpdate);
shopRoute.delete("/delete/:id", isAuth , deleteShop)
shopRoute.put("/shopstatus" , isAuth , shopStatusRateLimit, shopStatus)

// for user :
shopRoute.get("/get/:id", isAuth , getShopById);
shopRoute.get("/getallshops" , isAuth, getAllShops);

//shop geo location :
shopRoute.put("/shoplocation", isAuth , ShopGeoLocation)

export default shopRoute;
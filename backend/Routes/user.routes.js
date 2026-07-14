import express from 'express';
import { currentUser, googleLogin, googleSignup, login, logout, register, resetPassword, sendOtp, updateDelivaryBoysAvailability, updatePosition, userOrderAddressUpdate, userProfile, userUpdate, verifyOtp} from '../Controllers/user.controller.js';
import { isAuth } from '../isAuth/isAuthentication.js';
import { upload } from '../isAuth/multer.js';
import { LocalLoginRateLimit, LocalSignUpRateLimit } from '../RateLimiting/rateLimiting.js';

let UserRoute = express.Router();


UserRoute.post('/register', LocalSignUpRateLimit , register)
UserRoute.post('/login', LocalLoginRateLimit , login)
UserRoute.get("/logout",logout)

//google signUp
UserRoute.post("/google-signup" , googleSignup)
UserRoute.post("/google-login" , googleLogin)

//User curd:

UserRoute.put("/update", isAuth, upload.single("image"), userUpdate)   
UserRoute.get("/profile",isAuth, userProfile)

//Update user Address :
UserRoute.put("/addressUpdate",isAuth, userOrderAddressUpdate)
//update user geo location : 
UserRoute.put("/updatelocation" , isAuth , updatePosition)


//Get current user :
UserRoute.get("/currentuser" , isAuth, currentUser)


//Update availability :
UserRoute.put("/updateavailability" , isAuth , updateDelivaryBoysAvailability)


//Reset password field :
UserRoute.post("/send-otp",sendOtp)
UserRoute.post("/verify-otp",verifyOtp)
UserRoute.post("/reset-password",resetPassword)

export default UserRoute;
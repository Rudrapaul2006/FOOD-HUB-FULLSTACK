import jwt from 'jsonwebtoken';
import { USER } from '../Models/user.model.js';

export let isAuth = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        if (!token) {
            return res.status(404).json({
                message: "Token not found or token got expired pls log in",
                success: false
            })
        }

        let decoded = await jwt.verify(token, process.env.JWT_SECRET);
        let user = await USER.findById(decoded.id)
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        req.id = decoded.id;
        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        })
    }
}
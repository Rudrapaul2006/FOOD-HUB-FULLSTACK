import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

//USER ROUTE :

// For Login and Register :
let rateLimitOBJ = {
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,

    keyGenerator: (req) => {
        return `${req.body.email}-${ipKeyGenerator(req.ip)}`
    },

    handler: (req, res) => {
        return res.status(400).json({
            message: "Too many attempts . Please try again after 15 minutes",
            success: false
        })
    }
}

// For User-pasword-reset :
let rateLimitForOTP = {
    windowMs: 5 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,

    keyGenerator: (req) => {
        return `${req.body.email}-${ipKeyGenerator(req.ip)}`
    },

    handler: (req, res) => {
        return res.status(400).json({
            message: "Too many attempts . Please try again after 5 minutes",
            success: false
        })
    }
}

// local sign up rate limiting :
export let LocalSignUpRateLimit = rateLimit(rateLimitOBJ)

// local login rate limiting :
export let LocalLoginRateLimit = rateLimit(rateLimitOBJ)

// reset-password Rate-limit :
export let resetOtpRateLimit = rateLimit(rateLimitForOTP)

// send otp rate limit :
export let sendOtpRateLimit = rateLimit(rateLimitForOTP) 

// verify otp rate limit :
export let verifyOtpRateLimit = rateLimit (rateLimitForOTP)



// SHOP ROUTE RATE LIMITING :

let shopRateLimit = {
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: false,
    legacyHeaders: true,
    skipSuccessfulRequests: true,

    keyGenerator: () => {
        return `${req.body.email}-${ipKeyGenerator(req.ip)}`
    },

    handler: (req , res) => {
        return res.status(400).json({
            message: "Too many attepts please try again 15 min later",
            success: success
        })
    }
}

// shop register RATE LIMITING :
export let shopRegisterRateLimit = rateLimit(shopRateLimit)

// shop status RATE LIMITING :
export let shopStatusRateLimit = rateLimit(shopRateLimit)



// SHOP ROUTE RATE LIMITING :

//food register RATE LIMIT :
export let foodRegisterRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,

    keyGenerator: (req) => {
        return `${req.body.email}-${ipKeyGenerator(req.ip)}`
    },
    handler: (req , res) => {
        return res.status(400).json({
            message: "Too many attempts , please try again 10 min later ",
            success: false
        })
    }
})
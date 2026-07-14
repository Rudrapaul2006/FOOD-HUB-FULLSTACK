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
            message: "Too many login attempts . Please try again after 15 minutes",
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
            message: "Too many login attempts . Please try again after 5 minutes",
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
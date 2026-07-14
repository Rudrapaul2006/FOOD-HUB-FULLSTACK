import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

// local sign up rate limiting :
export let LocalSignUpRateLimit = rateLimit({
    windowMs : 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,

    keyGenerator: (req) => {
        return `${req.body.email}-${ipKeyGenerator(req.ip)}`
    },

    handler: (req , res) => {
        return res.status(400).json({
            message : "Too many login attempts . Please try again after 15 minutes",
            success : false 
        })
    }
})

// local login rate limiting :
export let LocalLoginRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,

    keyGenerator: (req) => {
        return `${req.body.email}-${ipKeyGenerator(req.ip)}`
    },

    handler : (req, res) => {
        return res.status(400).json({
            message: "Too many login attempts . Please try again after 10 minutes ",
            success: false
        })
    }
 })
import chalk from 'chalk'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import Redis from 'ioredis'
import { RedisStore } from 'rate-limit-redis'


// Adding io redis in server :
export let redisInstance = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
})

//redis connection :
redisInstance.on("connect", () => {
    console.log(chalk.red.bgBlack("Redis Connected"))
})

redisInstance.on("error", (err) => {
    console.log(chalk.red("Redis Error"), err)
})



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
export let verifyOtpRateLimit = rateLimit(rateLimitForOTP)





// SHOP ROUTE's RATE LIMITING :

export let shopRegisterRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (...args) => redisInstance.call(...args),
    }),

    message: {
        success: false,
        message: "Too many shop registration attempts. Please try again after 15 minutes "
    }
})

export let shopStatusRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    legacyHeaders: false,
    standardHeaders: "draft-8",

    store: new RedisStore({
        sendCommand: (...args) => redisInstance.call(...args)
    }),

    message: {
        success: false,
        message: "Too many shop open/close attempts. Please try again after 15 minutes "
    }
})




// FOOD ROUTE's RATE LIMITING :

export let foodRegisterRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (...args) => redisInstance.call(...args)
    }),

    message: ({
        success: false,
        message: "To many food registration attempts. please try again 15 minutes later"
    })
})




// ORDER ROUTE's RATE LIMITING :

//[ for multiple food order, COD and ONLINE ] 
export let rateLimitForMultipleOrders = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    legacyHeaders: false,
    standardHeaders: "draft-8",

    keyGenerator: (req) => req.id,

    handler: (req, res) => {
        return res.status(400).json({
            message: "Too many order attempts please try again 15 minutes later",
            success: false
        })
    }
})

//[ for single order , COD and ONLINE ]
export let rateLimitForSingleOrder = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 7,
    legacyHeaders: false,
    standardHeaders: "draft-8",

    keyGenerator: req => req.id,

    handler: (req, res) => {
        return res.status(400).json({
            message: "Too many order attempts please try again 15 minutes later",
            success: false
        })
    }
})


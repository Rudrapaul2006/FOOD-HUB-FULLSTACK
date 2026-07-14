import mongoose, { model } from "mongoose";

let userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
        type: String,
        enum: ["user", "admin", "delivaryboy"],
        default: "user"
    },
    image: {type: String},

    //Comes address and pincode from order create [order model]
    address: { type: String },
    pincode: { type: String },

    resetOtp: String,
    verifyOtp: {
        type: Boolean,
        default: false
    },
    expiresOtp: {
        type: Date,
        default: null
    },

    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }
    },
    available : {
        type : String,
        enum : ["yes","no"],
        default : "no"
    },
    socketId : {
        type : String
    }

}, { timestamps: true })

userSchema.index({ location: "2dsphere" })

export let USER = mongoose.model("User", userSchema) 
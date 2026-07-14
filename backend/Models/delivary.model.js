import mongoose from "mongoose";

let deliverySchema = new mongoose.Schema(
    {
        order: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        }],
        orderedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        shopDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop"
        },
        orderGroupId : {
            type : String,
        },
        foodDetails : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Food"
        }],

        brodcasted: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        assignto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default : null
        },
        status : {
            type : String,
            enum : ["brodcasted" , "asigned" , "compleate"],
            default : "brodcasted"
        },

        acceptedate : Date,

        paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending",
        }
    },

    { timestamps: true }
);

export let DELIVARY = mongoose.model("Delivary", deliverySchema);
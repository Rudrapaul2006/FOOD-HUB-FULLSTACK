import mongoose from "mongoose";

let orderSchema = new mongoose.Schema({
    orderedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    address: {
        type: String,
    },
    pincode: {
        type: Number,
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    shopDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    foodDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Delivary",
        default: null
    },

    brodcastedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    assignedDelivaryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    quantity: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["pending", "preparing", "out for delivary", "compleate" , "cancel"],
        default: "pending"
    },
    cancelReason : {
        type : String,
        // default : null,
        trim : true,
        maxlength : 100
    },
    cancelBy : {
        type : String,
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "online"],
        required: true
    },

    //for each order it will generate unique id :
    orderGroupId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    //Validation profe :
    sendDelivaryOtp: { type: String, default: null },
    expireOtp: { type: Date, default: null },

    //razorpay payment ID :
    payment: {
        type: Boolean,
        default: false
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    }

}, { timestamps: true });

export let ORDER = mongoose.model("Order", orderSchema);
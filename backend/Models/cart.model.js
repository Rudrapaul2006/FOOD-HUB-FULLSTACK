import mongoose from 'mongoose';

let cartSchema = new mongoose.Schema({
    foodDetails : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Food"
    },
    userDetails : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    shopDetails : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    quantity : {
        type : Number
    }
    
} , {timestamps : true})

export let CART = mongoose.model("Cart" , cartSchema);
import mongoose from "mongoose";

let shopSchema = new mongoose.Schema({
    shopname:{
        type : String,
        required : true
    },
    email : {
        type: String
    },
    description:{
        type : String,
        required : true
    },
    location:{
        type : String,
        required : true 
    },
    image:{
        type : String
    },
    phone : {
        type: String,
        required : true
    },
    city: {
        type: String
    },
    state: {
        type: String
    }, 

    open: {
        type : String,
        enum : ["yes" , "no"],
        default: "no"

    }, //local change by admin

    socketOpen: {
        type : String,
        enum : ["yes" , "no"],
        default: "no"
        
    }, //socket connect = "yes" , socket disconnect = "no"
    
    owner : {
        type : mongoose.Schema.Types.ObjectId, 
        ref : "User"
    },
    foods:{
        type : mongoose.Schema.Types.ObjectId, 
        ref : "Food"
    },


    //Shop location :
    shopGeoLocation : {
        type : {type : String , enum : ["Point"] , default : "Point"},
        coordinates : {type : [Number] , default: [0,0] }
    },

} , {timestamps : true})

shopSchema.index({shopGeoLocation : "2dsphere"})

export let SHOP = mongoose.model("Shop",shopSchema)
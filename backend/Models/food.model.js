import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    foodname: {
      type: String,
    },
    price: {
      type: String,
    },
    category: {
      type: String,
      enum: ["veg", "nonveg"],
    },
    image: { 
      type: String
    },
    description: {   
      type: String,
      trim: true 
    },
    isAvailable: { 
      type: String,  
      enum : ["yes" , "no"],
      default : "yes" 
    }, 
    foodtype: {
      type: String,
      enum: [
        "Starter" , "Main Course", 
        "Side Dish" , "Dessert",
        "Beverage" , "Snack", 
        "Breakfast" , "Lunch",
        "Dinner", "Fast Food"
      ],
      required: true
    },

    shopDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  }, { timestamps: true });

export let FOOD = mongoose.model("Food", foodSchema)

 

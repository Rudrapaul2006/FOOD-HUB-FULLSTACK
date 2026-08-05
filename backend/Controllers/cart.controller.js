import { CART } from "../Models/cart.model.js";
import { FOOD } from "../Models/food.model.js";
import { USER } from "../Models/user.model.js"
import { SHOP } from "../Models/shop.model.js"

// Add to cart functionality :
export let addToCart = async (req, res) => {
    try {
        let userId = req.id;
        let foodId = req.params.id;

        let user = await USER.findById({ _id: userId });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        let cheakFoodInCart = await CART.findOne({ foodDetails: foodId, userDetails: userId, })
        if (cheakFoodInCart) {
            return res.status(400).json({
                message: "Already added in cart",
                success: false
            })
        }

        let food = await FOOD.findOne({ _id: foodId }).populate("shopDetails")
        let shopId = (food.shopDetails?._id)

        let userCart = await CART.findOne({ userDetails: userId })

        if (!userCart || userCart?.shopDetails?._id.toString() === shopId.toString()) {

            let cartData = await CART.create({
                userDetails: userId,
                foodDetails: foodId,
                shopDetails: shopId,
                quantity: 1
            })

            if (!cartData) {
                return res.status(400).json({
                    message: "Failed to add in cart",
                    success: false
                })
            }

            await cartData.populate("foodDetails")
            await cartData.populate("userDetails")

            return res.status(200).json({
                message: "Add to cart successfully",
                cartData,
                success: true
            })

        } else {
            return res.status(400).json({
                message: "Cart contains items from another restaurant . Please clear it first",
                success: false
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Get the cart food item :
export let getCartFoodData = async (req, res) => {
    try {
        let userId = req.id;

        let getFoodItem = await CART.find({ userDetails: userId }).sort({ createdAt: -1 })
            .populate("foodDetails", "foodname price category description isAvailable image")
            .populate("userDetails", "_id fullname")
            .populate("shopDetails")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "fullname socketId available"
                }
            })

        if (!getFoodItem) {
            return res.status(400).json({
                message: "Cant get cart food items",
                success: false
            })
        }

        return res.status(200).json({
            message: "Successfully get the food items ",
            getFoodItem,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Get food data by id :
export let getFoodById = async (req, res) => {
    try {
        let foodId = req.params.id;

        let food = await CART.findOne({ _id: foodId }).populate("foodDetails").populate("shopDetails").populate("userDetails", "fullname address location pincode email phone _id")
        if (!food) {
            return res.status(400).json({
                message: "Food Item not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Food Item found",
            food,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Delete Food Item from cart :
export let deleteFoodFromCart = async (req, res) => {
    try {
        let foodId = req.params.id
        let userId = req.id;
        if (!userId) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        let deleteFood = await CART.findByIdAndDelete(foodId).populate("foodDetails")
        if (!deleteFood) {
            return res.status(400).json({
                message: "Food item not removed",
                success: false
            })
        }

        return res.status(200).json({
            message: "FoodItem successfully removed from cart",
            deleteFood,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Remove all cart item by user id :
export let deleteAllFoodFromCart = async (req, res) => {
    try {
        let userId = req.id

        let user = await USER.findById(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        let userCart = await CART.find({ userDetails: userId })

        if (userCart.length === 0) {
            return res.status(400).json({
                message: "No food items in the cart yet",
                success: false
            })
        }

        await CART.deleteMany({ userDetails: userId })

        return res.status(200).json({
            message: "All food items removed successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Replace all cart item by user id :
export let replaceFoodInCart = async (req, res) => {
    try {
        let userId = req.id
        let { foodId } = req.body
        let { shopId } = req.body

        let user = await USER.findById(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        let userCart = await CART.find({ userDetails: userId })

        if (userCart.length > 0) {
            await CART.deleteMany({ userDetails: userId })
        }

        if (shopId !== userCart?.map(item => item.shopDetails?._id.toString())[0]) {
            let cartData = await CART.create({
                userDetails: userId,
                foodDetails: foodId,
                shopDetails: shopId,
                quantity: 1
            })


            if (!cartData) {
                return res.status(400).json({
                    message: "Failed to add in cart",
                    success: false
                })
            }

            await cartData.populate("foodDetails")
            await cartData.populate("userDetails")
            await cartData.populate("shopDetails")

            return res.status(200).json({
                message: "Cart replaced successfully",
                cartData,
                success: true
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

// Update quantity in cart :
export let updateQuantityInCart = async (req, res) => {
    try {
        let { quantity } = req.body;
        let foodId = req.params.id;
        let userId = req.id;

        let updateQuantity = await CART.findOneAndUpdate({ _id: foodId, userDetails: userId }, { quantity: quantity }, { new: true })
            .populate("foodDetails", "foodname price description isAvailable image")
            .populate("userDetails", "fullname")

        if (!updateQuantity) {
            return res.status(400).json({
                message: "Quantity not updated",
                success: false
            })
        }

        return res.status(200).json({
            message: "Quantity updated successfully",
            updateQuantity,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}
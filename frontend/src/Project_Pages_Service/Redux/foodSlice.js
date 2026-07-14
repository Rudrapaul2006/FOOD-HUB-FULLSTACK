import { createSlice } from "@reduxjs/toolkit"

let foodSlice = createSlice({
    name: "food",
    initialState: ({
        foodData: [], // Admin shop's food data here 
        totalAdminShopFood: 1,
        foodLoading: false,
        searchFoodByText: "",

        //Pagination data for food items [admin side]
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
        hasPrev: false,

        //User food data [user side]
        userFoodData: [],  //[each resturent's particular foods stored here]
        userFoodLoading: false,
        searchUserFoodByText: "",
        userFoodSorting: "",

        //user side each resturent pagination data :
        resturentFoodCurrentPage: 1,
        resturentFoodTotalPage: 1,
        resturentFoodHasNext: false,
        resturentFoodHasPrev: false,

        //All Food Data's for user : [foods from all shops] [user side]
        userAllFoodData: [],
        userAllFoodLoading: true,
        findAllFoodByText: "",
        sortUserAllFoods: "",

        //pagination data for all food Items [user side]
        userSideTotalPages: 1,
        userSideCurrentPage: 1,
        userSideHasPrev: false,
        userSideHasNext: false,

        //Cart System [user side]
        cartData: [],
        cartDataLoading: true
    }),

    reducers: ({
        setFoodData: (state, action) => {
            state.foodData = action.payload
        },
        setTotalAdminShopFood: (state, action) => {
            state.totalAdminShopFood = action.payload
        },
        setFoodLoading: (state, action) => {
            state.foodLoading = action.payload
        },
        setSearchFoodByText: (state, action) => {
            state.searchFoodByText = action.payload
        },

        //Pagination data for food items [admin side]
        setTotalPages: (state, action) => {
            state.totalPages = action.payload
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload
        },
        setHasNext: (state, action) => {
            state.hasNext = action.payload
        },
        setHasPrev: (state, action) => {
            state.hasPrev = action.payload
        },

        addFood: (state, action) => {
            state.foodData.unshift(action.payload)
        },
        deleteFood: (state, action) => {
            state.foodData = state.foodData.filter(food => food._id !== action.payload)
        },
        updateFood: (state, action) => {
            state.foodData = state.foodData.map(food =>
                food._id === action.payload._id ? action.payload : food
            )
        },

        // User foodData : // [each resturent's particular foods stored here / user side]
        setUserFoodData: (state, action) => {
            state.userFoodData = action.payload
        },
        setSearchUserFoodByText: (state, action) => {
            state.searchUserFoodByText = action.payload
        },
        setUserFoodLoading: (state , action) => {
            state.userFoodLoading = action.payload
        },
        setUserFoodSorting: (state, action) => {
            state.userFoodSorting = action.payload
        },

        // each resturent food [pagination data] : 
        setResturentFoodCurrentPage: (state, action) => {
            state.resturentFoodCurrentPage = action.payload
        },
        setResturentFoodTotalPage: (state , action) => {
            state.resturentFoodTotalPage = action.payload
        },
        setResturentFoodHasNext: (state, action) => {
            state.resturentFoodHasNext = action.payload
        },
        setResturentFoodHasPrev: (state , action) => {
            state.resturentFoodHasPrev = action.payload
        },

        //All user food data : [ all foods / user side]
        setUserAllFoodData: (state, action) => {
            let { page, foods } = action.payload  //for infinte scroll

            if (page === 1) {
                state.userAllFoodData = foods
            } else {
                state.userAllFoodData = [
                    ...state.userAllFoodData, ...foods
                ]
            }
        },
        setUserAllFoodLoading: (state, action) => {
            state.userAllFoodLoading = action.payload
        },
        setFindAllFoodByText: (state, action) => {
            state.findAllFoodByText = action.payload
        },

        //pagination data for all foodItems [userSide]
        setUserSideTotalPages: (state, action) => {
            state.userSideTotalPages = action.payload
        },
        setUserSideCurrentPage: (state, action) => {
            state.userSideCurrentPage = action.payload
        },
        setUserSideHasPrev: (state, action) => {
            state.userSideHasPrev = action.payload
        },
        setUserSideHasNext: (state, action) => {
            state.userSideHasNext = action.payload
        },
        setSortUserAllFoods: (state, action) => {
            state.sortUserAllFoods = action.payload
        },


        // Cart Functionality :
        setCartData: (state, action) => {  //get all added foods [added food stored here]
            state.cartData = action.payload;
        },
        setCartDataLoading: (state, action) => {
            state.cartDataLoading = action.payload;
        },
        addFoodInCart: (state, action) => {    //add to cart
            let { shopId } = action.payload
            state.cartData.push({ ...action.payload, shopId })
        },
        removeFoodFromCart: (state, action) => { // remove from cart
            state.cartData = state.cartData.filter(item => item._id !== action.payload);
        },
        removeAllFoodFromCart: (state, action) => {
            state.cartData = []
            // state.cartData.length = 0
        },
        updateQuantityInCart: (state, action) => {
            state.cartData = state.cartData.map(item =>
                item._id === action.payload._id ? { ...item, quantity: action.payload.quantity } : item
            )
        }
    })
})


export let { setFoodData, setTotalAdminShopFood, setFoodLoading, deleteFood, addFood, updateFood, setSearchFoodByText, setTotalPages, setCurrentPage, setHasNext, setHasPrev,  //Admin side
    setUserFoodData, setSearchUserFoodByText, setUserFoodLoading, setUserFoodSorting, setResturentFoodCurrentPage, setResturentFoodTotalPage, setResturentFoodHasNext, setResturentFoodHasPrev, //each resturent foods /each Shop foods / user side
    setCartData, setCartDataLoading, addFoodInCart, removeFoodFromCart, removeAllFoodFromCart, updateQuantityInCart, //Cart data [user side]
    setUserAllFoodData, setUserAllFoodLoading, setFindAllFoodByText, setSortUserAllFoods, // allFoods [user side]
    setUserSideTotalPages, setUserSideCurrentPage, setUserSideHasPrev, setUserSideHasNext, // user side pagination for all foods
} = foodSlice.actions
export default foodSlice.reducer
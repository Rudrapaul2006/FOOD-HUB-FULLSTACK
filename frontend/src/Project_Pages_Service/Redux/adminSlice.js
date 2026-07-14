import { createSlice } from "@reduxjs/toolkit";

let adminSlice = createSlice({
    name: "admin",
    initialState: {
        shopData: [],  // admin shop data stored here :
        shopLoading: true,

        userShopData: [], // all shops stored here
        userShopLoading: true,
        findShopByText: "",
        shopSortByUser: "",

        //pageination :
        shopCurrentPage: 1,
        shopTotalPage: 1,
        shopHasNext: false,
        shopHasPrev: false,

        singleShopData: [],
    },
    reducers: {
        //Admins shop data :
        setShopData: (state, action) => {
            state.shopData = action.payload
        },
        setShopLoading: (state, action) => {
            state.shopLoading = action.payload
        },
        updateShop: (state, action) => {
            state.shopData = action.payload
        },

        //user's shop data :
        setUserShopData: (state, action) => {
            state.userShopData = action.payload
        },
        setUserShopLoading: (state, action) => {
            state.userShopLoading = action.payload
        },
        setFindShopByText: (state, action) => {
            state.findShopByText = action.payload
        },
        setShopSortByUser: (state, action) => {
            state.shopSortByUser = action.payload
        },

        //pagination data :
        setShopCurrentPage: (state, action) => {
            state.shopCurrentPage = action.payload
        },
        setShopTotalPage: (state, action) => {
            state.shopTotalPage = action.payload
        },
        setShopHasNext: (state, action) => {
            state.shopHasNext = action.payload
        },
        setShopHasPrev: (state, action) => {
            state.shopHasPrev = action.payload
        },

        setSingleShopData: (state, action) => {
            state.singleShopData = action.payload
        }
    }
})

export let { setShopData, setShopLoading, setFindShopByText, setShopSortByUser, setShopCurrentPage, setShopTotalPage, setShopHasNext, setShopHasPrev, //user side all shop's
    updateShop, setUserShopData, setUserShopLoading, setSingleShopData } = adminSlice.actions;
export default adminSlice.reducer;
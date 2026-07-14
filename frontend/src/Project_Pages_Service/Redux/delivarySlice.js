import { createSlice } from "@reduxjs/toolkit"

let delivarySlice = createSlice({
    name: "delivary",
    initialState: {
        delivaryData: [],
        delivaryLoading: true,
    },
    reducers: ({
        setDelivaryData: (state, action) => {
            state.delivaryData = action.payload
        },
        setDelivaryloading: (state, action) => {
            state.delivaryLoading = action.payload
        },
        updateOrderPaymentStatus: (state, action) => {
            state.delivaryData = state.delivaryData.map((order) => order._id === action.payload._id ? { ...order, ...action.payload } : order)
        }
    })
})

export let { setDelivaryData, setDelivaryloading, updateOrderPaymentStatus} = delivarySlice.actions
export default delivarySlice.reducer
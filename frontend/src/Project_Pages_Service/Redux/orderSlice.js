import { createSlice } from "@reduxjs/toolkit"

let orderSlice = createSlice({
    name: "order",
    initialState: ({
        orderData: [], // Admin [ {pending order's} shop owner get all order from user => which stored here]
        totalAdminSidePendingOrder: 1,
        pendingOrders: 1, //[for notification]
        totalRevenue: 1,
        orderLoading: false,
        searchOrderDataByText: "",

        // admin side pagination for user order :
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
        hasPrev: false,

        // Admin side cancel and compleate order's stored here : [and cancel order's pagination data]
        cancelOrder: [],
        cancelOrderLoading: false,
        cancelOrderCurrentPage: 1,
        cancelOrderTotalPage: 1,
        cancelOrderHasPrev: false,
        cancelOrderHasNext: false,
        cancelOrderQuery: "",   //[search for the cancel or compleate order]

        // user side : [user order data : (pending / preparing / out for delivary) order's stored here]
        userOrderData: [],
        userOrderLoading: false,

        // [user pending / preparing / out for delivary order's pagination data]
        userPendingOrderTotalPages: 1,
        userPendingOrderCurrentPage: 1,
        userPendingOrderHasPrev: false,
        userPendingOrderHasNext: false,


        // [user cancel and compleate orders stored here]
        userCancelOrders: [],
        userCancelOrderLoading: false,
        searchUserOrderByText: "",
        sortUserCancelOrder: "",

        //cancel and compleate order's pagination data :
        userCancelOrderCurrentPage: 1,
        userCancelOrderTotalPage: 1,
        userCancelOrderHasPrev: false,
        userCancelOrderHasNext: false,
    }),
    reducers: ({
        setOrderData: (state, action) => {
            state.orderData = (action.payload)
        },
        setTotalAdminSidePendingOrder : (state, action) => {
            state.totalAdminSidePendingOrder = action.payload
        },
        setPendingOrders: (state , action) => {
            state.pendingOrders = action.payload
        }, //[for notification on navbar]
        setTotalRevenue: (state, action) => {
            state.totalRevenue = action.payload
        },
        setOrderLoading: (state, action) => {
            state.orderLoading = action.payload
        },
        addOrder: (state, action) => {
            state.orderData.unshift(action.payload)
        },
        updateorder: (state, action) => {
            state.orderData = state.orderData.map((order) => order._id === action.payload.id ? { ...order, ...action.payload } : order)
        },
        deleteOrderItem: (state, action) => {
            state.orderData = state.orderData.filter(item => item._id !== action.payload)
        },
        setSearchOrderDataByText: (state, action) => {
            state.searchOrderDataByText = action.payload;
        },

        //Pagination details for admin (pending order's) [user order] :
        setTotalPages: (state, action) => {
            state.totalPages = action.payload
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload
        },
        setHasPrev: (state, action) => {
            state.hasPrev = action.payload
        },
        setHasNext: (state, action) => {
            state.hasNext = action.payload
        },

        //Pagination details for admin (cancel and compleate order's) [user order] :
        setCancelOrder: (state, action) => {
            state.cancelOrder = action.payload
        },
        setCancelOrderLoading: (state, action) => {
            state.cancelOrderLoading = action.payload
        },
        setCancelOrderCurrentPage: (state, action) => {
            state.cancelOrderCurrentPage = action.payload
        },
        setCancelOrderTotalPage: (state, action) => {
            state.cancelOrderTotalPage = action.payload
        },
        setCancelOrderHasPrev: (state, action) => {
            state.cancelOrderHasPrev = action.payload
        },
        setCancelOrderHasNext: (state, action) => {
            state.cancelOrderHasNext = action.payload
        },
        setSearchCancelOrderQuery: (state, action) => {
            state.cancelOrderQuery = action.payload
        },


        // user side : [user order data (pending / preparing / out for delivary) ] :
        setUserOrderData: (state, action) => {
            state.userOrderData = action.payload
        },
        setUserOrderLoading: (state, action) => {
            state.userOrderLoading = action.payload
        },

        // user side : [pending / preparing / out for delivary]  pagination :
        setUserPendingOrderTotalPages: (state, action) => {
            state.userPendingOrderTotalPages = action.payload
        },
        setUserPendingOrderCurrentPage: (state, action) => {
            state.userPendingOrderCurrentPage = action.payload
        },
        setUserPendingOrderHasPrev: (state, action) => {
            state.userPendingOrderHasPrev = action.payload
        },
        setUserPendingOrderHasNext: (state, action) => {
            state.userPendingOrderHasNext = action.payload
        },

        //user side cancel and compleate order's :
        setUserCancelOrders: (state, action) => {
            state.userCancelOrders = action.payload
        },
        setUserCancelOrderLoading: (state, action) => {
            state.userCancelOrderLoading = action.payload
        },
        setSearchUserOrderByText: (state, action) => {
            state.searchUserOrderByText = action.payload
        },
        setSortUserCancelOrder: (state , action) => {
            state.sortUserCancelOrder = action.payload
        },

        //user side cancel and compleate order pagination reducer's :
        setUserCancelOrderCurrentPage: (state, action) => {
            state.userCancelOrderCurrentPage = action.payload
        },
        setUserCancelOrderTotalPage: (state, action) => {
            state.userCancelOrderTotalPage = action.payload
        },
        setUserCancelOrderHasPrev: (state, action) => {
            state.userCancelOrderHasPrev = action.payload
        },
        setUserCancelOrderHasNext: (state, action) => {
            state.userCancelOrderHasNext = action.payload
        },
    })
})

export let {
    setOrderData, setTotalAdminSidePendingOrder, setPendingOrders, setTotalRevenue, setOrderLoading, updateorder, deleteOrderItem, setSearchOrderDataByText,  // [admin side pending orders reducer's]
    setTotalPages, setCurrentPage, setHasPrev, setHasNext, // [admin side pending orders pagination data]
    setCancelOrder, setCancelOrderLoading, setCancelOrderCurrentPage, setCancelOrderTotalPage, setCancelOrderHasPrev, setCancelOrderHasNext, setSearchCancelOrderQuery, //[admin side cancel and compleate order's pagination reduser's]
    setUserOrderData, setUserOrderLoading, setSearchUserOrderByText,  // [user side orderData (pending / preparing / out for delivary)]
    setUserPendingOrderTotalPages, setUserPendingOrderCurrentPage, setUserPendingOrderHasPrev, setUserPendingOrderHasNext, // [user side pending / preparing / out for delivary orders pagination data's reducer's]
    setUserCancelOrders, setUserCancelOrderLoading, setSortUserCancelOrder,   // [user cancel and compleate order reducers]
    setUserCancelOrderCurrentPage, setUserCancelOrderTotalPage, setUserCancelOrderHasPrev, setUserCancelOrderHasNext //[user side cancel and compeate order pegination reducer's]

} = orderSlice.actions;
export default orderSlice.reducer;
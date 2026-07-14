import { createSlice } from "@reduxjs/toolkit";

let userSlice = createSlice({
    name: "user",
    initialState: {
        userData: [],
        loading: true,
        city: null,
        socket : null,
        location : null
    },
    
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        updateUserProfile: (state, action) => {
            state.userData = action.payload
        },
        updateAddress: (state, action) => {
            if (action.payload.address) {
                state.userData.user.address = action.payload.address;
            }
            if (action.payload.pincode) {
                state.userData.user.pincode = action.payload.pincode;
            }
        },
        setSocket : (state , action) => {
            state.socket = action.payload
        },

        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setCity: (state, action) => {
            state.city = action.payload
        },
        setLocation : (state , action) => {
            state.location = action.payload
        },

        // availability update for the delivary partner :
        setUpdateAvailability : (state , action) => {
            if(action.payload.available){
                state.userData.user.available = action.payload.available
            }
        }
    }
})

export let { setUserData, setLoading, updateUserProfile, updateAddress, setCity , setSocket , setUpdateAvailability, setLocation } = userSlice.actions;
export default userSlice.reducer;
import { configureStore } from "@reduxjs/toolkit";

import userSlice from "./userSlice"
import adminSlice from "./adminSlice"
import foodSlice from "./foodSlice"
import orderSlice from "./orderSlice"
import delivarySlice from "./delivarySlice"

export let store = configureStore({
    reducer : {
        user : userSlice,
        admin : adminSlice,
        food : foodSlice,
        order : orderSlice,
        delivary : delivarySlice
    }
})
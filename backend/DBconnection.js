import mongoose from "mongoose";
import chalk from "chalk";

export let DBconnect = () => {
    mongoose.connect(process.env.Mongo_Url , {
        dbName : "Food_Delivary"
    }).then(() => {
         console.log(chalk.bgBlack.cyan("MongoDB Connected ..."))
    }).catch((Error) => {
        console.error(Error)
    })
}
import { Worker } from "bullmq";
import { orderCancelationMessage, orderDelivaryMessage, sendOrderPlaceMessage, sendWelcomeMail, userOrderCancelationMessage } from "../utils/mail.js";
import { redisInstance } from "../RateLimiting/rateLimiting.js";

// user signup queue worker :
let sendWelcomeEmail = new Worker("signupQueue", async (job) => {
    await sendWelcomeMail(job?.data?.email, job?.data?.fullname)
}, { connection: redisInstance })


// multiple order queue worker : [for cod and online order's]
let multipleOrderWorker = new Worker("multipleOrderQueue", async (job) => {
    await sendOrderPlaceMessage(job?.data?.ordererEmail, job?.data?.shopName, job?.data?.ordererName, job?.data?.foodDetails, job?.data?.payment, job?.data?.paymentMod, job?.data?.totalPrice)
}, { connection: redisInstance })


// single order queue worker :
let singleOrderWorker = new Worker("singleOrderQueue", async (job) => {
    await sendOrderPlaceMessage(job?.data?.ordererEmail, job?.data?.shopName, job?.data?.ordererName, job?.data?.foodDetails, job?.data?.payment, job?.data?.paymentMod, job?.data?.totalPrice)
}, { connection: redisInstance })


// order calcelation queue worker : [from shop side]
let orderCancelationWorker = new Worker("orderCancelation", async (job) => {
    await orderCancelationMessage(job?.data?.ordererEmail, job?.data?.shopName, job?.data?.ordererName, job?.data?.foodDetails, job?.data?.cancelReason, job?.data?.payment, job?.data?.paymentMod, job?.data?.totalPrice)
}, { connection: redisInstance })


// order cancelation queue worker : [from user side] :
let orderCancelByUser = new Worker("orderCancelByUser" , async (job) => {
    await userOrderCancelationMessage(job?.data?.ordererEmail, job?.data?.shopName, job?.data?.ordererName, job?.data?.foodDetails, job?.data?.cancelReason, job?.data?.payment, job?.data?.paymentMod, job?.data?.totalPrice)
}, { connection: redisInstance })


// delivary success queue worker :
let deliverySuccessWorker = new Worker("deliverySuccess", async (job) => {
    await orderDelivaryMessage(job?.data?.ordererEmail, job?.data?.shopName, job?.data?.ordererName, job?.data?.foodDetails, job?.data?.payment, job?.data?.paymentMethod, job?.data?.totalPrice)
}, {connection: redisInstance})

console.log("🚀 BullMQ worker is running...")
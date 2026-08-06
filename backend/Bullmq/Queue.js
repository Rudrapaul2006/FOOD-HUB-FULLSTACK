import { redisInstance } from "../RateLimiting/rateLimiting.js";
import { Queue } from "bullmq";

// user signup queue :
export let signupQueue = new Queue("signupQueue", {connection: redisInstance})

// Create queue for cod order and online payment order : [multiple orders]
export let multipleOrderQueue = new Queue("multipleOrderQueue", {connection: redisInstance})

// create queue for single order's : [both cod and online order's]
export let singleOrderQueue = new Queue("singleOrderQueue", {connection: redisInstance})

// create queue for order cancelation : [from shop side]:
export let orderCancelationQueue = new Queue("orderCancelation" , {connection: redisInstance})

// create queue for order cancelation by user :
export let orderCancelByUser = new Queue("orderCancelByUser" , {connection: redisInstance})

// create queue for delivary success :
export let deliverySuccessQueue = new Queue("deliverySuccess", {connection: redisInstance})
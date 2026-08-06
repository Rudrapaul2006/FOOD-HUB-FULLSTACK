import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    }
})

transporter.verify((err, success) => {
    if (err) {
        console.log(err);
    } else {
        // console.log("Mail service is ready");
    }
})

// send welcome mail:
export let sendWelcomeMail = async (to, fullName) => {
    await transporter.sendMail({
        from: `"Food Delivery" <${process.env.EMAIL}>`,
        to,
        subject: "Welcome to Food Delivery 🎉",
        html: `<p>Hi <b>${fullName}</b>,</p>
            <p>Welcome to <b>Food Delivery</b>! 🎉</p>
            <p>We're excited to have you with us. Explore delicious meals, place your first order, and enjoy fast delivery.</p>
            <p>Happy Ordering! 🍕</p>
            <p><b>Team Food Delivery</b></p> `,
    })
}

//Forget password ka otp:
export let sendOtpMail = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Reset your password",
        html: `<p>Your passwrd reset otp is - <b>${otp}</b>. It expires in 5 minute ..</p>`,
    })
}

//Delivary otp:
export let sendOtpDelivary = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Delivary OTP",
        html: `<p>Your delivary otp is <b>${otp}</b>. It expires in 5 minute ..</p>`,
    })
}

//order place mail :
export let sendOrderPlaceMessage = async (email, shopName, ordererName, foodNames, payment, paymentMethod, totalPrice) => {
    transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Order placed successfully",
        html: ` <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color:#16a34a;">🎉 Order Placed Successfully</h2>
                <p>Hello <b>${ordererName}</b>, your order from <b>${shopName}</b> has been placed successfully</p>
                <p><b>Food Items :</b> ${foodNames}</p>
                <p><b>Total Price :</b> ₹${totalPrice} | <b>Payment :</b> ${paymentMethod}</p>
                ${payment === true ? `<p>✅ Payment completed successfully</p>` : `<p>💵 Please keep cash ready during delivery</p>`}
                <p>🍔 Your food is being prepared. Thank you for ordering with us ❤️</p> </div>`,
    })
}

//order cancelation mail: (by shop)
export let orderCancelationMessage = async (email, shopName, ordererName, foodNames, reason, payment, paymentMethod, totalPrice) => {
    transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Order canceled successfully",
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color:#dc2626;">Order Cancelled Successfully</h2>
                <p>Hello <b>${ordererName}</b>, your order from <b>${shopName}</b> has been cancelled due to (${reason})</p>
                <p><b>Food Items :</b> ${foodNames}</p>
                ${payment === true ? `<p>Amount: ${totalPrice} | Paymentmethod: ${paymentMethod} </p>` : `Paymentmethod: ${paymentMethod}`}
                <p>We’re sorry for the inconvenience 💔</p>
                ${payment === true ? `<p>Your refund of ₹${totalPrice} will be processed soon ..</p>` : `<p>No payment was charged for this order.</p>`}
                </div>`,
    })
}

// User order cancellation mail:
//ordererEmail, shopName, ordererName, foodDetails, cancelReason, payment, paymentMod, totalPrice
export let userOrderCancelationMessage = async (email, shopName, ordererName, foodNames, cancelReason, payment, paymentMethod, totalPrice) => {
    transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Order canceled successfully",
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color:#dc2626;">Order Cancelled Successfully</h2>
                <p>Hello <b>${ordererName}</b>, you have successfully cancelled your order from <b>${shopName}</b>.</p>
                <p><b>Food Items :</b> ${foodNames}</p>
                ${payment === true ? `<p>Amount: ₹${totalPrice} | Payment Method: ${paymentMethod}</p>` : `<p>Payment Method: ${paymentMethod}</p>`}
                <p>Your cancellation request has been received successfully</p>
                ${payment === true ? `<p>Your refund of ₹${totalPrice} will be processed soon.</p>` : `<p>No payment was charged for this order.</p>`}
                <p>We hope to serve you again soon 🍽️</p>
                </div>`,
    })
}

//Order delivaried mail:
export let orderDelivaryMessage = async (email, shopName, ordererName, foodNames, payment, paymentMethod, totalPrice) => {
    transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Order delivered successfully 🥳",
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color:#16a34a;">Order Delivered Successfully</h2>
                <p>Hello <b>${ordererName}</b>, your order from <b>${shopName}</b> has been delivered successfully 🎉</p>
                <p><b>Food Items :</b> ${foodNames}</p>
                <p><b>Total Price :</b> ₹${totalPrice} | <b>Payment :</b> ${paymentMethod}</p>
                ${payment === true ? `<p>✅ Payment already done </p>` : `<p>✅ Payment done successfully</p>`}
                <p>Thank you <b>${ordererName}</b> for choosing us! 😊❤️</p>
                </div>`,
    })
}
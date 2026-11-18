
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendOrderStatusEmail(to, orderId, status) {
    if (!to) {
        throw new Error("Customer email address is missing");
    }

    await transporter.sendMail({
        from: `NovaStore <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `NovaStore Order Update - ${status}`,
        html: `
            <div style="font-family: Arial; padding: 20px;">
                <h2 style="color: #166534;">NovaStore</h2>
                <h3>Your order status has been updated!</h3>
                <p>Order ID: <strong>${orderId}</strong></p>
                <p>New Status: <strong>${status}</strong></p>
                <p>Thank you for shopping with NovaStore!</p>
            </div>
        `
    });
}

module.exports = sendOrderStatusEmail;

const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();
const axios = require('axios');

router.post("/orders", async (req, res) => {
    try {


        const totalAmount = req.body.totalPrice;




        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "receipt_order_74394",

        };

        const order = await instance.orders.create(options);


        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post("/success", async (req, res) => {
    try {
        // getting the details back from our font-end
        const {
            razorpayPaymentId,
            razorpayOrderId,
            cartItems,
            uid,
            totalPrice,
        } = req.body;




        // Add products to order
        const items = cartItems.map(item => {
            const selectedPlan = item.selectedPlan;
            let rent;
            if (selectedPlan === 'day') {
                rent = item.rentPerDay;
            } else if (selectedPlan === 'month') {
                rent = item.rentPerMonth;
            } else {
                rent = item.rentPerYear;
            }
            const itemTotalPrice = Math.round(Number(rent) + Number(item.securityDeposit));
            return {
                image: item.image,
                description: item.description,
                selectedPlan: selectedPlan,
                uid: item.uid,
                price: item.price,
                name: item.name,
                id: item.id,
                availabilityPlace: item.availabilityPlace,
                categories: item.categories,
                rent: rent,
                itemTotalPrice: itemTotalPrice,
            };
        });
        

        const order = {
            items,
            paymentId: razorpayPaymentId,
            orderId: razorpayOrderId,
            date: new Date().toLocaleString(),
            orderPrice: Number(totalPrice/100),
        };
        await axios.post('https://bbr-vku7.onrender.com//order/add', { uid, order });


        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;

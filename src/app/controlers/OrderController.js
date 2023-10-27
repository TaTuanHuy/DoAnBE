const order = require("../models/OrderProduct");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice, user } = req.body;
        if (!orderItems || !shippingAddress || !paymentMethod || !totalPrice || !user) {
            return res.status(400).json({ message: "missing something ?" });
        }
        for (const order of orderItems) {
            const getProduct = await Product.findOne({ _id: order.product });
            getProduct.sale += order.amount;
            getProduct.quantity -= order.amount
            await getProduct.save();
        }
        const newOrder = await new order({
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            user,
        });
        const orders = await newOrder.save();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};
const getAllOrder = async (req, res) => {
    try {
        const getAll = await order.find();
        return res.status(200).json(getAll);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};
const editOrder = async (req, res) => {
    try {
        const data = req.body
        data.isDelivered = true
        data.deliveredAt = Date()

        const all = await order.find()
        console.log(all)

        const change = await order.updateOne({ _id: req.params.id }, data)

        return res.status(200)
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};
const deleteOrder = async (req, res) => {
    try {
        const orderItem = await order.findOne({ _id: req.params.id })
        const productOrders = orderItem.orderItems

        productOrders.map(async (item) => {
            const findProduct = await Product.findOne({ _id: item.product })
            findProduct.sale -= item.amount
            findProduct.quantity += item.amount
            await Product.updateOne({ _id: findProduct._id }, findProduct)
        })

        await order.deleteOne({ _id: req.params.id })
        return res.status(200).json({ message: 'successfull' })
    } catch (error) {
        return res.status(400).json({ message: error });
    }

};

const getUserOrder = async (req, res) => {
    try {
        const userOrder = await order.find({
            user: req.params.id
        })
        return res.status(200).json(userOrder)
    } catch {
        return res.status(400).json({ message: error });
    }
}

const findByRange = async (req, res) => {
    try {
        const check = await order.find({
            $and: [
                {

                    created_at: { $gte: new Date("2023-07-25") }
                },
                {

                    created_at: { $lte: new Date("2023-07-27") }
                }
            ]
        })
        console.log(check)
        // return check
        return res.status(200).json(check);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    deleteOrder,
    editOrder,
    getAllOrder,
    getUserOrder,
    findByRange
};

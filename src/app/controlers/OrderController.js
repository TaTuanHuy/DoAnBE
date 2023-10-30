const dayjs = require('dayjs')

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

const findByDate = async (req, res) => {


    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.startDate)

    const compareDate = new Date(req.body.endDate)
    const endCompareDate = new Date(req.body.endDate)

    endDate.setUTCHours(23, 59, 59, 999)
    endCompareDate.setUTCHours(23, 59, 59, 999)

    const orderToday = await order.find({
        createdAt: {
            $gte: startDate,
            $lt: endDate
        }
    })

    const orderSecondDate = await order.find({
        createdAt: {
            $gte: compareDate,
            $lt: endCompareDate
        }
    })

    console.log('orderToday: ', orderToday)
    console.log('orderSecondDate: ', orderSecondDate)

    if (orderToday.length === 0) {
        return res.status(200).json({
            quantityToday: 0,
            percentQuantity: 0,
            percentTotal: 0,
            turnoverToday: 0,
            orderToday: []
        })
    }

    const quantityToday = await totalQuantity(orderToday)

    const quantitySecondToday = await totalQuantity(orderSecondDate)

    const turnoverToday = await totalTurnover(orderToday)

    const turnoverSecondDate = await totalTurnover(orderSecondDate)

    if (orderSecondDate.length === 0) {
        return res.status(200).json({
            quantityToday,
            percentQuantity: 100 * 100,
            percentTotal: 100 * 100,
            turnoverToday,
            orderToday
        })
    }

    const percentTotal = Math.round(turnoverToday / turnoverSecondDate * 100)
    let percentQuantity = Math.round(quantityToday / quantitySecondToday * 100)

    console.log('quantityToday: ', quantityToday)
    console.log('quantitySecondToday: ', quantitySecondToday)

    console.log('percentQuantity: ', Math.round(percentQuantity))
    console.log('percentTotal: ', Math.round(percentTotal))

    console.log('turnoverToDay: ', turnoverToday)
    console.log('turnoverSecondDate: ', turnoverSecondDate)

    return res.status(200).json({
        quantityToday,
        percentQuantity,
        percentTotal,
        turnoverToday,
        orderToday
    })
};

const totalQuantity = async (data) => {
    const quantity = data.reduce((item, currentValue) => {
        const resultQuantity = currentValue.orderItems.reduce((item, currentValue) => {
            return item + currentValue.amount
        }, 0)
        return resultQuantity + item
    }, 0)
    return quantity
}

const totalTurnover = async (data) => {
    const turnOver = data.reduce((item, currentValue) => {
        return item + currentValue.totalPrice
    }, 0)
    return turnOver
}

const findByRange = async (req, res) => {
    try {
        const check = await order.findOne({
            // $and: [
            // {

            created_at: { $gte: new Date("2023-07-27") }
            // },
            // {

            //     created_at: { $lte: new Date("2023-07-28") }
            // }
            // ]
        })
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
    findByRange,
    findByDate
};

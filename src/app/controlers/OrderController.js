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
        const newOrder = new order({
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            user,
        }) ;
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
        await order.updateOne({ _id: req.params.id }, req.body.data)
        return res.status(200).json({ message: 'Successfully' })
    } catch (err) {
        return res.status(400).json({ message: err });
    }
}

const isDeliverOrder = async (req, res) => {
    try {
        const data = req.body
        data.isDelivered = true
        data.deliveredAt = Date()

        await order.updateOne({ _id: req.params.id }, data)

        return res.status(200).json({ message: 'succesfull'})
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};
const deleteOrder = async (req, res) => {
    try {
        const orderItem = await order.findOne({ _id: req.params.id })
        const productOrders = orderItem.orderItems

        productOrders.forEach(async (item) => {
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

const getOneOrder = async (req, res) => {
    try {
        const orderItem = await order.findOne({ _id: req.params.id })
        return res.status(200).json(orderItem)
    } catch (err) {
        return res.status(400).json({ message: error });
    }
}

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

    const quantityToday = await totalQuantity(orderToday)

    const quantitySecondDay = await totalQuantity(orderSecondDate)

    const turnoverToday = await totalTurnover(orderToday)

    const turnoverSecondDate = await totalTurnover(orderSecondDate)

    if (orderToday.length === 0) {
        return res.status(200).json({
            quantityToday: 0,
            percentQuantity: 0,
            percentTotal: 0,
            turnoverToday: 0,
            quantitySecondDay,
            turnoverSecondDate: turnoverSecondDate,
            orderToday: []
        })
    }

    if (orderSecondDate.length === 0) {
        return res.status(200).json({
            quantityToday,
            percentQuantity: 100,
            percentTotal: 100,
            turnoverToday,
            quantitySecondDay,
            orderToday,
            turnoverSecondDate
        })
    }

    const percentTotal = Math.round(turnoverToday / turnoverSecondDate * 100)
    let percentQuantity = Math.round(quantityToday / quantitySecondDay * 100)

    return res.status(200).json({
        quantityToday,
        percentQuantity,
        percentTotal,
        turnoverToday,
        orderToday,
        turnoverSecondDate,
        quantitySecondDay
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
        const startDate = new Date(req.body.startDate)
        const endDate = new Date(req.body.endDate)

        startDate.setHours(0, 0, 0, 0)
        endDate.setUTCHours(23, 59, 59, 999)

        const orders = await order.find({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        })

        const orderQuantity = await totalQuantity(orders)
        const turnOver = await totalTurnover(orders)

        return res.status(200).json({
            orders,
            orderQuantity,
            turnOver
        })
    } catch (err) {
        return res.status(400).json({ message: error });
    }

};

const findByMonth = async (req, res) => {
    try {
        const date = new Date(req.body.date)

        const lastDayOfMonth = getLastDayOfMonth(date.getFullYear(), date.getMonth())

        lastDayOfMonth.setUTCHours(23, 59, 59, 999)
        date.setDate(1)
        date.setUTCHours(0, 0, 0, 0)

        const orders = await order.find({
            createdAt: {
                $gte: date,
                $lt: lastDayOfMonth
            }
        })

        const orderQuantity = await totalQuantity(orders)
        const turnOver = await totalTurnover(orders)

        const productsBestSale = findProductBestSeller(orders)

        return res.status(200).json({
            orders,
            orderQuantity,
            turnOver,
            productsBestSale    
        })
    } catch (err) {
        return res.status(400).json({ message: err });
    }
};

function findProductBestSeller(orders){
    const allOrderItem = []
    
    orders.forEach((item) => {
        const orderItems = JSON.parse(JSON.stringify(item.orderItems))

        orderItems.forEach(e => {
            delete e._id
            allOrderItem.push(e)
        })
    })
    
    const group = {};
    allOrderItem.forEach(prod => {
    const o = (group[prod.product] = group[prod.product] || {
        ...prod,
        amount: 0,
    });

    o.amount += prod.amount;

    });

    const res = Object.values(group);

    res.sort((a, b) => {
        return b.amount - a.amount
    })

    return res;

}
function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 1);
}

module.exports = {
    createOrder,
    deleteOrder,
    isDeliverOrder,
    getAllOrder,
    getUserOrder,
    getOneOrder,
    findByRange,
    findByDate,
    findByMonth,
    editOrder
};
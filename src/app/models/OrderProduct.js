const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete"); //  cho phép bạn thêm chức năng xóa mềm (soft delete) vào các bộ sưu tập của bạn.

const order = new Schema({
    orderItems: [
        {
            name: { type: String, required: true },
            amount: { type: Number, required: true },
            size: { type: String, required: true },
            image: { type: String, required: true },
            price: { type: String, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
        },
    ],
    shippingAddress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
}, { timestamps: {} });

order.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all", //  ghi đè lên các phương thức như find(), findeOne(),...
});
module.exports = mongoose.model("order", order);

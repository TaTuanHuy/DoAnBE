const USER = require("./user");
const PRODUCT = require("./product");
const REFRESH = require("./refreshToken");
const ORDER = require("./order");

function route(app) {
    app.use("/users", USER);
    app.use("/product", PRODUCT);
    app.use("/refresh", REFRESH);
    app.use("/order", ORDER);
}

module.exports = route;

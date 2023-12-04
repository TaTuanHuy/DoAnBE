const bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

const User = require("../models/userDataBase");
const { accesToken, refreshToken } = require("../../config/service/accesToken");

const createUser = async (req, res) => {
    try {
        const { name, email, password, checkpassword, phone } = req.body;
        let re = /\S+@\S+\.\S+/;
        let isEmail = re.test(email);
        if (!name || !email || !password || !checkpassword || !phone) {
            return res.status(400).json({ 
                status: 400,
                message: "Error, Something wrong" 
            });
        }
        if (password !== checkpassword) {
            return res.status(400).json({ 
                status: 400,
                message: "Your password is not correct" 
            });
        }
        if (!isEmail) {
            return res.status(400).json({ 
                status: 400,
                message: "Your Email is not correct" 
            });
        }

        const checkEmailInDB = await User.findOne({ email });

        if(checkEmailInDB){
            return res.status(400).json({
                status: 400,
                message: "Your email already exists" 
            });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const createUser = new User({
            name,
            email,
            password: hash,
            checkpassword: hash,
            phoneNumber: phone,
        });
        const user = await createUser.save();
        return res.status(200).json({
            status: 200,
            user
        });
    } catch (e) {
        return res.status(400).json({ message: e });
    }
};

const SignIn = async (req, res) => {
    try {
        const getUser = await User.findOne({ email: req.body.email });
        if (!getUser) {
            return res.status(400).json(
                {
                    status: 400,
                    message: "email not found" 
                }
            );
        }

        const checkPassword = await bcrypt.compare(req.body.password, getUser.password);
        if (!checkPassword) {
            return res.status(400).json({ message: req.body.password });
        }


        if (getUser && checkPassword) {
            const accToken = await accesToken({
                id: getUser._id,
                isAdmin: getUser.isAdmin,
            });

            const refreshTok = await refreshToken({
                id: getUser._id,
                isAdmin: getUser.isAdmin,
            });

            const { password, checkpassword, ...others } = getUser._doc;
            return res.status(200).json({ ...others, accToken, refreshTok });
        }
    } catch (e) {
        return res.status(400).json({ message: e });
    }
};

const UpdateUser = async (req, res) => {
    try {
        const {name ,email, phoneNumber} = req.body

        var re = /\S+@\S+\.\S+/;
        let isEmail = re.test(email);
        if (!isEmail) {
            return res.status(400).json(
                {
                    status: 400,
                    message: "Bạn đã nhập sai Email! Vui lòng thử lại!" 
                }
            );
        }
        const checkExistUser = await User.findOne({ email });
        if(checkExistUser){
            return res.status(400).json({
                status: 400,
                message: 'Email đã tồn tại! Vui lòng thử lại!' 
            });
        }

        const getUser = await User.updateOne({ _id: req.params.id }, req.body);
        return res.status(200).json({ message: "Thay đổi thành công! Vui lòng kiểm tra lại thông tin", getUser });
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};

const updatePassWord = async (req, res) => {
    try {
        const getUser = await User.findOne({ _id: req.params.id });
        const checkMatchOldPassWord = await bcrypt.compare(req.body.old_password, getUser.password);
        if (!checkMatchOldPassWord) {
            return res.status(403).json(
            { 
                status: 403 ,
                message: "Old password not match! Please try again!" 
            });
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.new_password, salt);

        const updateUser = await User.updateOne({ _id: req.params.id }, {
            password: hash,
            checkPassword: hash
        });

        return res.status(200).json({ message: "succesfull", updateUser });
    } catch (error) {
        return res.status(400).json({ message: error });
    }
}

const getAllUser = async (req, res) => {
    try {
        const allUser = await User.find();
        const user = allUser.map((user) => user.toObject());
        return res.status(200).json(user);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};

const moveUserToTrash = async (req, res) => {
    try {
        await User.delete({ _id: req.params.id });
        res.status(200).json({ message: "successfull" });
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};

module.exports = {
    createUser,
    SignIn,
    UpdateUser,
    getAllUser,
    getUser,
    moveUserToTrash,
    updatePassWord,
};

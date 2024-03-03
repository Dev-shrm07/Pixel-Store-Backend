"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCreatedPosts = exports.getSavedPosts = exports.savePost = exports.updatePost = exports.deleteMany = exports.deletePost = exports.createPost = exports.getPostByID = exports.getPosts = void 0;
const post_1 = __importDefault(require("../models/post"));
const mongoose_1 = __importDefault(require("mongoose"));
const assertisDefined_1 = require("../utils/assertisDefined");
const http_errors_1 = __importDefault(require("http-errors"));
const user_1 = __importDefault(require("../models/user"));
const stripe_1 = __importDefault(require("../utils/stripe"));
const Product_1 = __importDefault(require("../models/Product"));
const getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_1.default.find({}, "_id image_watermark title likes category price creator")
            .sort({ timestamps: -1, likes: -1 })
            .exec();
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(200).json(posts);
    }
    catch (error) {
        next(error);
    }
});
exports.getPosts = getPosts;
const getPostByID = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.postid;
    try {
        if (!mongoose_1.default.isValidObjectId(id)) {
            throw (0, http_errors_1.default)(404, "Not a valid id");
            return;
        }
        const post = yield post_1.default.find({ _id: id }, "_id image_watermark title description likes category creator price").exec();
        if (!post) {
            throw (0, http_errors_1.default)(404, "Post Not found");
            return;
        }
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(200).json(post);
    }
    catch (error) {
        next(error);
    }
});
exports.getPostByID = getPostByID;
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const image = req.body.image;
    const image_watermark = req.body.image_watermark;
    const likes = 0;
    const price = req.body.price;
    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const userid = req.session.userID;
    try {
        (0, assertisDefined_1.assertIsDefined)(userid);
        if (!image) {
            next((0, http_errors_1.default)(404, "Image is necessary"));
            return;
        }
        if (!title) {
            next((0, http_errors_1.default)(404, "title is necessary"));
            return;
        }
        if (!image_watermark) {
            next((0, http_errors_1.default)(404, "image is necessary"));
            return;
        }
        if (!category) {
            next((0, http_errors_1.default)(404, "category is necessary"));
            return;
        }
        if (!price) {
            next((0, http_errors_1.default)(404, "price is necessary"));
            return;
        }
        const user = yield user_1.default.findById(userid).exec();
        if (!user) {
            next((0, http_errors_1.default)(404, "No user found"));
            return;
        }
        if (!(user === null || user === void 0 ? void 0 : user.reg_seller)) {
            next((0, http_errors_1.default)(404, "Not registered as a seller"));
            return;
        }
        const post = yield post_1.default.create({
            image: image,
            image_watermark: image_watermark,
            likes: likes,
            price: price,
            title: title,
            category: category,
            description: description,
            creator: userid,
        });
        const product = yield stripe_1.default.products.create({
            name: title,
            description: description,
        });
        const prod_id = product.id;
        const price_prod = yield stripe_1.default.prices.create({
            product: product.id,
            unit_amount: price * 100,
            currency: 'inr',
        });
        const price_id = price_prod.id;
        const Product = yield Product_1.default.create({
            post: post._id,
            price: price_id,
            product_id: prod_id
        });
        const postResponse = {
            _id: post._id,
            image_watermark: post.image_watermark,
            likes: post.likes,
            title: post.title,
            description: post.description,
            category: post.category,
            price: post.price,
            creator: post.creator,
        };
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(201).json(postResponse);
    }
    catch (error) {
        next(error);
    }
});
exports.createPost = createPost;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.postid;
    const userid = req.session.userID;
    try {
        (0, assertisDefined_1.assertIsDefined)(userid);
        if (!mongoose_1.default.isValidObjectId(id)) {
            throw (0, http_errors_1.default)(404, "Not a valid post i");
            return;
        }
        const post = yield post_1.default.findOne({ _id: id }).exec();
        if (!post) {
            throw (0, http_errors_1.default)(404, "Post not Found");
            return;
        }
        const postcreator = post.creator;
        (0, assertisDefined_1.assertIsDefined)(postcreator);
        if (!postcreator.equals(userid)) {
            throw (0, http_errors_1.default)(401, "User not allowed");
            return;
        }
        const Product = yield Product_1.default.findOne({ post: id }).exec();
        if (Product) {
            const del1 = yield stripe_1.default.products.del(Product.product_id);
            yield stripe_1.default.prices.update(Product.price_id, {
                active: false,
            });
        }
        yield post_1.default.deleteOne({ _id: id });
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.sendStatus(204);
    }
    catch (error) {
        next(error);
    }
});
exports.deletePost = deletePost;
const deleteMany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield post_1.default.deleteMany({});
        res.sendStatus(204);
    }
    catch (error) {
        next(error);
    }
});
exports.deleteMany = deleteMany;
const updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userid = req.session.userID;
    const postid = req.params.postid;
    try {
        (0, assertisDefined_1.assertIsDefined)(userid);
        if (!mongoose_1.default.isValidObjectId(postid)) {
            throw (0, http_errors_1.default)(401, "invalid req");
            return;
        }
        const post = yield post_1.default.findOne({ _id: postid }).exec();
        if (!post) {
            throw (0, http_errors_1.default)(401, "post not found");
            return;
        }
        if (!((_a = post.creator) === null || _a === void 0 ? void 0 : _a.equals(userid))) {
            throw (0, http_errors_1.default)(401, "acess not allowed");
            return;
        }
        if (req.body.image && !req.body.image_watermark) {
            throw (0, http_errors_1.default)(401, "inavlid credintails");
            return;
        }
        if (req.body.image && req.body.image != "") {
            post.image = req.body.image;
            post.image_watermark = req.body.image_watermark;
        }
        if (req.body.price && req.body.price != 0) {
            post.price = req.body.price;
        }
        if (req.body.title) {
            post.title = req.body.title;
        }
        if (req.body.category) {
            post.category = req.body.category;
        }
        yield post.save();
        const Product = yield Product_1.default.findOne({ post: post._id }).exec();
        if (!Product || !Product.price_id) {
            throw (0, http_errors_1.default)(404, "Please create the Post again");
        }
        let p = Product.price_id;
        if (typeof post.price != 'undefined') {
            const pricex = yield stripe_1.default.prices.create({
                unit_amount: post.price * 100,
                currency: 'inr',
                product: Product.product_id
            });
            yield stripe_1.default.prices.update(p, {
                active: false,
            });
            p = pricex.id;
        }
        Product.price_id = p;
        yield Product.save();
        const response = {
            _id: post._id,
            image_watermark: post.image_watermark,
            likes: post.likes,
            title: post.title,
            description: post.description,
            category: post.category,
            creator: post.creator,
            price: post.price
        };
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(200).json(response);
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updatePost = updatePost;
const savePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.session.userID;
    const postId = req.params.postid;
    try {
        (0, assertisDefined_1.assertIsDefined)(authUser);
        const User = yield user_1.default.findById(authUser).exec();
        if (!User) {
            throw (0, http_errors_1.default)(404, "invalid request");
            return;
        }
        const post = yield post_1.default.findById(postId).exec();
        if (!post) {
            throw (0, http_errors_1.default)(401, "No post found");
            return;
        }
        const saveresponse = postId;
        const arr = User.savedPosts;
        if (arr.includes(saveresponse)) {
            throw (0, http_errors_1.default)(401, "Already saved");
            return;
        }
        arr.push(saveresponse);
        const Userssaved = yield User.save();
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.sendStatus(201);
    }
    catch (error) {
        next(error);
    }
});
exports.savePost = savePost;
const getSavedPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authuser = req.session.userID;
        (0, assertisDefined_1.assertIsDefined)(authuser);
        const User = yield user_1.default.findOne({ _id: authuser }).exec();
        if (!User) {
            throw (0, http_errors_1.default)(404, "User not found");
            return;
        }
        const arr = User.savedPosts;
        const result = [];
        for (const postId of arr) {
            const post = yield post_1.default.findOne({ _id: postId }).exec();
            if (post) {
                const x = {
                    _id: post._id,
                    image_watermark: post.image_watermark,
                    likes: post.likes,
                    title: post.title,
                    description: post.description,
                    category: post.category,
                    price: post.price,
                    creator: post.creator,
                };
                result.push(x);
            }
        }
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.getSavedPosts = getSavedPosts;
const getMyCreatedPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.session.userID;
    try {
        (0, assertisDefined_1.assertIsDefined)(userid);
        const resp = yield post_1.default.find({ creator: userid }, '_id image_watermark title likes category price creator').exec();
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(200).json(resp);
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getMyCreatedPosts = getMyCreatedPosts;

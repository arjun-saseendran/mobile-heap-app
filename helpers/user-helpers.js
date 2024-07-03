var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const {ObjectId} = require("mongodb");


module.exports = {
    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId);
            })
        })


    },
    dologin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({name: userData.name});
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('Login Success');
                        response.user = user;
                        response.status = true;
                        resolve(response);

                    } else {
                        console.log('Login Failed');
                        resolve({status: false});
                    }
                })


            } else {
                console.log('Login Failed');
                resolve({status: false});
            }
        })
    },
    addToCart: (productId, userId) => {
        let proObj = {
            item: new ObjectId(productId),
            quantity: 1,
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: new ObjectId(userId)});
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item === productId);
                if (proExist !== -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({'products.item': new ObjectId(productId)},
                        {
                            $inc: {'products.$.quantity': 1}

                        }).then(() => {
                        resolve();
                    })
                } else {


                    db.get().collection(collection.CART_COLLECTION).updateOne({user: new ObjectId(userId)}, {

                            $push: {products: proObj}
                        }
                    ).then((response) => {
                        resolve();
                    })
                }
            } else {
                let cartObj = {
                    user: new ObjectId(userId),
                    products: [proObj],
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve();
                })
            }

        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {user: new ObjectId(userId)},
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product',
                    }
                }


            ]).toArray();

            resolve(cartItems);
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: new ObjectId(userId)});
            if (cart) {
                count = cart.products.length;
            }
            resolve(count);

        })
    }
}
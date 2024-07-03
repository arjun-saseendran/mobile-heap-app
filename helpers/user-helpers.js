var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const {ObjectId} = require("mongodb");


module.exports = {
    doSignUp: (userData)=> {
        return new Promise (async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.insertedId);
            })
        })



    },
    dologin: (userData)=> {
        return new Promise (async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({name: userData.name});
        if (user) {
            bcrypt.compare(userData.password, user.password).then((status)=>{
                if (status){
                    console.log('Login Success');
                    response.user = user;
                    response.status = true;
                    resolve(response);

                }else{
                    console.log('Login Failed');
                    resolve({status: false});
                }
            })


        }else{
            console.log('Login Failed');
            resolve({status: false});
        }
        })
    },
    addToCart: (productId, userId)=> {
        return new Promise (async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: new ObjectId(userId)});
        if(userCart){
            db.get().collection(collection.CART_COLLECTION).updateOne({user: new ObjectId(userId)}, {

                $push: {products: new ObjectId(productId)}
            }
            ).then((response) => {
                resolve();
            })

        }else{
            let cartObj = {
                user:  new ObjectId(userId),
                products: [new ObjectId(productId)],
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
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
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: {proList: '$products'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$proList']
                                    }
                                }
                            }

                        ],
                        as:'cartItems'

                    }
                }



            ]).toArray();
            if (cartItems.length > 0) {
                resolve(cartItems[0].cartItems);
            } else {
                resolve([]);
            }
        })
    }
}
var db = require('../config/connection.js');
var collection = require('../config/collections.js');
var objectId = require('mongodb').ObjectId;


module.exports = {
    addProduct: (product, cb) => {
        db.get().collection('products').insertOne(product).then((data) => {
            cb(data.insertedId);
        });

    },

    getAllProducts: () => {

        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })


    },

    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id: new objectId(productId)}).then((response) => {
                resolve(response);
            })
        })
    },

    getProductDetails: (productId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: new objectId(productId)}).then((product) => {
                resolve(product);
            })
        })
    },

    updateProduct: (productId, productData) => {


        return new Promise(async (resolve, reject) => {


            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: new objectId(productId)},

                {
                    $set: {
                        title: productData.title,
                        description: productData.description,
                        price: productData.price,
                    }


                })
                .then((response) => {
                    resolve();

                })
        })

    }


}
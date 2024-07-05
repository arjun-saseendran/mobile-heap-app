const db = require("../config/connection");
const collection = require("../config/collections");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectId;

module.exports = {
  doSignUp: (userData) => {
    return new Promise(async (resolve) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve) => {
        let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ name: userData.name });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login Failed");
        resolve({ status: false });
      }
    });
  },
  addToCart: (productId, userId) => {
    let proObj = {
      item: new objectId(productId),
      quantity: 1,
    };
    return new Promise(async (resolve) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: new objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == productId
        );
        if (proExist !== -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                user: new objectId(userId),
                "products.item": new objectId(productId),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: new objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then(() => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: new objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then(() => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: new objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(cartItems);
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: new objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve) => {
      if (details.count === -1 && details.quantity === 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: new objectId(details.cart) },
            {
              $pull: { products: { item: new objectId(details.product) } },
            }
          )
          .then(() => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: new objectId(details.cart),
              "products.item": new objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then(() => {
            resolve({ status: true });
          });
      }
    });
  },

  deleteCartItem: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: new objectId(details.cart) },
          {
            $pull: { products: { item: new objectId(details.product) } },
          }
        )
        .then(() => {
          resolve({ removeProduct: true });
        });
    });
  },
  getTotalAmount: (userId) => {
   console.log('get total amounts :', userId);
    return new Promise(async (resolve) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: new objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              price: { $toDouble: { $arrayElemAt: ["$product.price", 0] } },
              product: { $arrayElemAt: ["$product", 0] },
            },
          },

          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$price"] } },
            },
          },
        ])
        .toArray();
      if (total.length > 0) {
        resolve(total[0].total);
      } else {
        resolve(0);
      }
    });
  },
};

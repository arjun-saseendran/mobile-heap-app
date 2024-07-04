var express = require('express');
const productHelper = require("../helpers/product-helpers");
var router = express.Router();
const userHelper = require('../helpers/user-helpers');

const verifyLogin = (req, res, next) => {
    if(req.session.loggedIn){
        next()
    }else{
        res.redirect('/login');
    }
}


/* GET home page. */
router.get('/', async function (req, res, next) {
let user = req.session.user;
let cartCount = null;
if(req.session.user){
cartCount = await userHelper.getCartCount(req.session.user._id);
}


    productHelper.getAllProducts().then(products => {
        res.render("user/view-products", {admin: false, products, user, cartCount});
    })
});

router.get('/login', function (req, res, next) {
    if(req.session.loggedIn){
        res.redirect('/');
    }else{
        res.render('user/login',{loginError:req.session.loginError});
        req.session.loginError = false;
    }


});
router.get('/signup', function (req, res, next) {
    res.render('user/signup');
});
router.post('/signup', function (req, res, next) {
    userHelper.doSignUp(req.body).then(result => {
        req.session.loggedIn = true;
        req.session.user = result;
        res.redirect('/');

    });
})

router.post('/login', function (req, res, next) {
userHelper.dologin(req.body).then(result => {
    if(result.status){
req.session.loggedIn = true;
req.session.user = result.user;
        res.redirect('/');
    }else{
        req.session.loginError = 'Invalid username or password';
        res.redirect('/login');
    }
})
})

router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.redirect('/');
})

router.get('/cart', verifyLogin, async function (req, res) {
let products = await userHelper.getCartProducts(req.session.user._id)


    res.render('user/cart',{products,user:req.session.user});
});

router.get('/add-to-cart/:id',function (req, res) {
userHelper.addToCart(req.params.id, req.session.user._id).then(result => {
    res.json({status:true});
})
})

router.post('/change-product-quantity', (req, res) => {
    userHelper.changeProductQuantity(req.body).then(() => {

    })
})


module.exports = router;

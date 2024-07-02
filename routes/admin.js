var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const products = [{
    title: 'iPhone 12 Mini',
    description: 'Compact, powerful, dual-camera, 5G, OLED display, A14 Bionic, sleek design.',
    price: '₹26000',
    image: 'https://rukminim2.flixcart.com/image/850/1000/ko0d6kw0/mobile/d/h/5/iphone-12-mini-mjqh3hn-a-apple-original-imag2k2xuuyfyusd.jpeg?q=20&crop=false'
  }]



  res.render('admin/view-products',{products, admin:true});
});

router.get('/add-product', function(req, res, next) {
  res.render('admin/add-product');
});

router.post('/add-product', function(req, res, next) {
  console.log(req.body);
  console.log(req.files);
});

module.exports = router;

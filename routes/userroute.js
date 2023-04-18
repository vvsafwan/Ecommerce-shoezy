const dotenv = require('dotenv')
dotenv.config();
const express = require('express');
const userRoute = express();
const userController = require('../controller/usercontroller');
const addressController = require('../controller/addresscontroller');
const cartController = require('../controller/cartcontroller');
const categoryController = require('../controller/categorycontroller');
const productController = require('../controller/productcontroller');
const orderController = require('../controller/ordercontroller');
const couponController = require('../controller/couponcontroller');
const wishlistController = require('../controller/wishlistcontroller')
const path = require('path');
const session = require('express-session');
const auth = require('../middleware/auth');

userRoute.use(session({
    secret:process.env.SESSION,
    saveUninitialized:true,
    resave:false
}))

userRoute.set('view engine','ejs');
userRoute.set('views',path.join(__dirname,'../views/users'));


userRoute.get('/home',userController.loadHome);
userRoute.get('/shop',userController.loadShop);
userRoute.get('/blog',userController.loadBlog);
userRoute.get('/contact',auth.isLogin,userController.loadContact);
userRoute.get('/about',userController.loadAbout);
userRoute.get('/cart',auth.isLogin,cartController.loadCart);
userRoute.get('/register',userController.loadRegister);
userRoute.get('/',auth.isLogout,userController.loadSignIn)
userRoute.get('/signin',auth.isLogout,userController.loadSignIn);
userRoute.get('/logout',auth.isLogout,userController.loadLogout);
userRoute.get('/showProduct',productController.loadShowProduct);
userRoute.get('/removeProduct',auth.isLogin,cartController.removeProduct);
userRoute.get('/checkout',auth.isLogin,cartController.loadCheckout);
userRoute.get('/addAddress',auth.isLogin,addressController.addAddress);
userRoute.get('/removeAddress',auth.isLogin,addressController.removeAddress);
userRoute.get('/orderSuccess',auth.isLogin,orderController.orderSuccess);
userRoute.get('/showOrder',auth.isLogin,orderController.showOrder);
userRoute.get('/viewOrderProducts',orderController.viewOrderProducts);
userRoute.get('/wishlist',auth.isLogin,wishlistController.loadWishlist);
userRoute.get('/removeWishlist',auth.isLogin,wishlistController.removeWishlist);
userRoute.get('/profile',auth.isLogin,userController.loadProfile);

//---------------------------------------------------------------------------------------------------------------

userRoute.post('/register',userController.insertUser);
userRoute.post('/send',userController.sendMail)
userRoute.post('/verify',userController.verifyMail);
userRoute.post('/signin',userController.verifyUser);
userRoute.post('/',userController.verifyUser);
userRoute.post('/changeProductQuantity',cartController.changeProductCount);
userRoute.post('/addAddress',addressController.insertAddress);
userRoute.post('/checkout',orderController.placeOrder);
userRoute.post('/verifyPayment',orderController.verifyPayment);
userRoute.post('/applyCoupon',couponController.applyCoupon);
userRoute.post('/addToCart',cartController.addToCart);
userRoute.post('/addToWishlist',wishlistController.addToWishlist);
userRoute.post('/addFromWish',wishlistController.addFromWish);
userRoute.post('/cancelOrder',orderController.cancelOrder);
userRoute.post('/priceFilter',productController.filterProduct);
userRoute.post('/shop',userController.loadShop);

module.exports = userRoute
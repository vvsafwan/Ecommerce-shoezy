const express = require('express');
const adminRoute = express();
const adminController = require('../controller/admincontroller');
const categoryController = require('../controller/categorycontroller');
const productController = require('../controller/productcontroller');
const bannerController = require('../controller/bannercontroller');
const orderController = require('../controller/ordercontroller');
const couponController = require('../controller/couponcontroller');
const path = require('path');
const session = require('express-session');
const secretConfig = require('../config/config');
const auth = require('../middleware/adminauth');

adminRoute.use(session({
    secret: secretConfig.sessionSecret,
    saveUninitialized: true,
    resave: false
}))

adminRoute.set('view engine','ejs');
adminRoute.set('views',path.join(__dirname,'../views/admin'))

const multer = require('multer');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/admin/productImages'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})
const upload = multer({storage:storage});

adminRoute.get('/',adminController.loadLogin);
adminRoute.get('/dashboard',auth.isLogin,adminController.loadDashboard);
adminRoute.get('/addProduct',auth.isLogin,productController.loadAddProduct);
adminRoute.get('/tables',auth.isLogin,adminController.showTable);
adminRoute.get('/productList',auth.isLogin,productController.loadProductList);
adminRoute.get('/editProduct',auth.isLogin,productController.editProduct);
adminRoute.get('/deleteProduct',auth.isLogin,productController.deleteProduct);
adminRoute.get('/addCategory',auth.isLogin,adminController.loadAddCategory);
adminRoute.get('/listCategory',auth.isLogin,categoryController.listCategory);
adminRoute.get('/deleteCategory',auth.isLogin,categoryController.deleteCategory);
adminRoute.get('/logout',adminController.loadLogout);
adminRoute.get('/block',auth.isLogin,adminController.blockUser);
adminRoute.get('/unblock',auth.isLogin,adminController.unblockUser);
adminRoute.get('/orders',auth.isLogin,orderController.adminShowOrder);
adminRoute.get('/editOrder',auth.isLogin,orderController.editOrder);
adminRoute.get('/viewProduct',auth.isLogin,orderController.viewProduct);
adminRoute.get('/addCoupon',auth.isLogin,couponController.loadAddCoupon);
adminRoute.get('/listCoupon',auth.isLogin,couponController.listCoupon);
adminRoute.get('/addBanner',auth.isLogin,bannerController.loadAddBanner);
adminRoute.get('/listBanner',auth.isLogin,bannerController.listBanner);
adminRoute.get('/editCoupon',auth.isLogin,couponController.loadEditProduct);
adminRoute.get('/deleteCoupon',auth.isLogin,couponController.deleteCoupon);
adminRoute.get('/editCategory',auth.isLogin,categoryController.editCategory);
adminRoute.get('/anListCategory',auth.isLogin,categoryController.anListCategory);  
adminRoute.get('/UnlistCategory',auth.isLogin,categoryController.UnlistCategory);
adminRoute.get('/unblockProduct',auth.isLogin,productController.unblockProduct);
adminRoute.get('/blockProduct',auth.isLogin,productController.blockProduct);
adminRoute.get('/exportOrder',auth.isLogin,orderController.exportOrder);

//--------------------------------------------------------------------------------------------------

adminRoute.post('/',adminController.verifyAdmin);
adminRoute.post('/addProduct',upload.array('image',10),productController.addProduct);
adminRoute.post('/editProduct',upload.array('image',10),productController.updateProduct);
adminRoute.post('/addCategory',categoryController.addCategory);
adminRoute.post('/editOrder',orderController.postEditOrder);
adminRoute.post('/addCoupon',couponController.postAddCoupon);
adminRoute.post('/removeImage',productController.removeImg);
adminRoute.post('/addBanner',upload.single('image'),bannerController.addBanner);
adminRoute.post('/editCoupon',couponController.postEditCoupon);
adminRoute.post('/editCategory',categoryController.postEdit);

//----------------------------------------------------------------------------------------------------


module.exports = adminRoute
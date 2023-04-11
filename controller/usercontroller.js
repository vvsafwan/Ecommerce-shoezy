const User = require('../models/usermodel');
const Category = require('../models/categorymodel');
const Address = require('../models/addressmodel');
const Banner = require('../models/bannermodel');
const Product = require('../models/productmodel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config();

const loadHome = async (req,res)=>{
    try{
        const bannerData = await Banner.findOne({});
        const ban = bannerData.banner;
        const userName = await User.findOne({_id:req.session.user_id});
        if(req.session.user_id){
            let customer = true;
            res.render('home',{customer,userName,banner:ban});
        }else{
            let customer = false;
            res.render('home',{customer,banner:ban});
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadLogout = (req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/signin');
    }catch(error){
        console.log(error.message);
    }
}

const loadShop = async (req,res)=>{
    try{
        const productCount = (await Product.find({list:true})).length
        const limit = 6
        const totalPage = Math.ceil(productCount/limit);
        const page = Number(req.query.page)||1;
        const skip = limit * (page-1);
        const search = req.body.search || "all";
        const value = req.query.value || "all";
        const category = req.query.category || "all";
        const userName = await User.findOne({_id:req.session.user_id});
        const categoryData = await Category.find({status:true});
        if(req.session.user_id){
            let customer = true;
           if(value=='zerothousand'){
                const productData = await Product.find({list:true,price:{$gt:0,$lte:1000}}).skip(skip).limit(limit);
                res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
            }else if(value=='twofivehundred'){
                const productData = await Product.find({list:true,price:{$gt:1000,$lte:2500}}).skip(skip).limit(limit);;
                res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
            }else if(value=='fivethousand'){
                const productData = await Product.find({list:true,price:{$gt:2500,$lte:5000}}).skip(skip).limit(limit);;
                res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
            }else if(value=='tenthousand'){
                const productData = await Product.find({list:true,price:{$gt:5000,$lte:10000}}).skip(skip).limit(limit);;
                res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
            }else if(search != 'all'){
                const productData = await Product.find({productName:{$regex:'^'+search, $options:'i'},list:true}).skip(skip).limit(limit);;
                res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
            }else if(category != 'all'){
                const productData = await Product.find({category:category}).skip(skip).limit(limit);;
                res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage})
            }else{
                const productData = await Product.find({list:true}).skip(skip).limit(limit);; 
                res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
            }
        }else{
            let customer = false;
            if(value=='zerothousand'){
                 const productData = await Product.find({list:true,price:{$gt:0,$lte:1000}}).skip(skip).limit(limit);
                 res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
             }else if(value=='twofivehundred'){
                 const productData = await Product.find({list:true,price:{$gt:1000,$lte:2500}}).skip(skip).limit(limit);;
                 res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
             }else if(value=='fivethousand'){
                 const productData = await Product.find({list:true,price:{$gt:2500,$lte:5000}}).skip(skip).limit(limit);;
                 res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
             }else if(value=='tenthousand'){
                 const productData = await Product.find({list:true,price:{$gt:5000,$lte:10000}}).skip(skip).limit(limit);;
                 res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
             }else if(search != 'all'){
                 const productData = await Product.find({productName:{$regex:'^'+search, $options:'i'},list:true}).skip(skip).limit(limit);;
                 res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
             }else if(category != 'all'){
                 const productData = await Product.find({category:category}).skip(skip).limit(limit);;
                 res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage})
             }else{
                 const productData = await Product.find({list:true}).skip(skip).limit(limit);; 
                 res.render('shop',{customer,userName,product:productData,category:categoryData,value:value,totalPage});
             }
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadAbout = async (req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        if(req.session.user_id){
            let customer = true;
            res.render('about',{customer,userName});
        }else{
            let customer = false;
            res.render('about',{customer});
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadBlog = async (req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        if(req.session.user_id){
            let customer = true;
            res.render('blog',{customer,userName});
        }else{
            let customer = false;
            res.render('blog',{customer});
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadContact = async (req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        if(req.session.user_id){
            let customer = true;
            res.render('contact',{customer,userName});
        }else{
            let customer = false
            res.redirect('/signin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadSignIn = async (req,res)=>{
    try{
        if(req.session.user_id){
            res.redirect('/home');
        }else{
            res.render('signIn');
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadRegister = async (req,res)=>{
    try{
        res.render('register');
    }catch(error){
        console.log(error.message);
    }
}

const securePassword = async (password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
    return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}

let otp = '';
let tempEmail;
const sendMail = async (name,email,user_id)=>{
    try{
        let digits = '0123456789';
        for(let i=0;i<4;i++){
            otp+=digits[Math.floor(Math.random()*10)]
        }
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'vvsafwan2002@gmail.com',
                pass:process.env.PASS
            }
        })
        const options = {
            from:'vvsafwan2002@gmail',
            to:email,
            subject:'for email verification',
            html:'<p>Hii '+name+' ,Please enter '+otp+' for verification</p>'
        }
        transporter.sendMail(options,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log(otp);
                console.log("email has been send to :-",info.response);
            }
        })

    }catch(error){
        console.log(error.message);
    }
}

const insertUser = async (req,res)=>{
    try{
        const spassword = await securePassword(req.body.password);
        const user = new User({
        name:req.body.name,
        email:req.body.email,
        mobile:req.body.mobile,
        password:spassword,
        is_admin:0
    })
    let userData;
    const checkEmail = await User.findOne({email:req.body.email});
    if(checkEmail){
        res.render('register',{message:"This email is already exist so verify the mail using sign In"});
    }else{
        userData = await user.save(); 
    }
    tempEmail = userData.email;
    
    if(userData){
        if(userData.is_verified==0){
            otp = '';
            sendMail(req.body.name,req.body.email,userData._id);
            res.render('otpPage',{message:"Enter the otp to verify your email"})
            
        }else{
            res.render('register',{message:"Registration successfull"});
        }
    }else{
        res.render('register',{message:"Your registration failed"});
    }
    }catch(error){
        console.log(error.message);
    }
}

const verifyMail = async (req,res)=>{
    try{
        let otprecieved = req.body.otp;
        if(otprecieved==otp){
            res.redirect('/signin');
            const userData = await User.updateMany({email:tempEmail},{$set:{is_verified:1}});
            
        }else{
            res.render('otpPage',{message:"Wrong Otp"})
            res.status(500).send('invalid OTP');
        }
    }catch(error){
        console.log(error.message);
    }
}

const verifyUser = async (req,res)=>{
    try{
        const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({email:email});
    if(userData){
        if(userData.is_verified==1){
            if(userData){
                const passwordMatch = await bcrypt.compare(password,userData.password)
                if(passwordMatch){
                    if(userData.is_blocked==false){
                        req.session.user_id = userData._id;
                        res.redirect('/home');
                    }else{
                        res.render('signIn',{message:"This user has been blocked"})
                    }

                }else{
                    res.render('signIn',{message:"Incorrect email and password"})
                }
            }else{
                res.render('signIn',{message:"Incorrect email and password"})
            }
        }else{
            otp=''
            tempEmail = email;
            sendMail(userData.name,userData.email,userData._id);
            res.render('otpPage',{message:"Verify your email first"});
            
        }
    }else{
        res.render('signIn',{message:"User not exist"})
    }
    }catch(error){
        console.log(error.message);
    }
}

const loadProfile = async (req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        const addressData = await Address.findOne({userId:req.session.user_id});
        const [address] = addressData.addresses;
        if(req.session.user_id){
            const customer = true;
            res.render('profile',{customer,userName,address});
        }else{
            res.redirect('/');
        }
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    loadHome,
    loadLogout,
    loadShop,
    loadAbout,
    loadBlog,
    loadContact,
    loadSignIn,
    loadRegister,
    insertUser,
    sendMail,
    verifyMail,
    verifyUser,
    loadProfile
}
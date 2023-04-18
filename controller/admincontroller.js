const User = require('../models/usermodel');
const Order = require('../models/ordermodel');
const Product = require('../models/productmodel');
const moment = require('moment');
moment().format()
const bcrypt = require('bcrypt');

const loadLogin = async (req,res)=>{
    try{
        if(req.session.admin_id){
            res.redirect('/admin/dashboard')
        }else{
            res.render('login');
        }
    }catch(error){  
        console.log(error.message);
    }
}

const loadDashboard = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const userData = await User.find({is_admin:0});
            const total = await Order.aggregate([{$group:{_id:null,total:{$sum:"$Amount"}}}])
            const Users = await User.find({is_admin:0}).count();
            const Orders = await Order.find({}).count();
            const Products = await Product.find({}).count();
            const onlineCount = await Order.aggregate([{$group:{_id:"$paymentMethod",totalPayment:{$count:{}}}}])

            let sales = [];
            var date = new Date();
            var year = date.getFullYear();
            var currentyear = new Date(year, 0, 1);
            let salesByYear = await Order.aggregate([{$match:{createdAt:{$gte:currentyear},status:{$ne:"cancelled"}}},{$group:{
                _id:{$dateToString:{format:"%m",date:"$createdAt"}},
                total:{$sum:"$Amount"},  
            }},{$sort:{_id:1}}]);
            for(let i=1;i<=12;i++){
                let result = true;
                for(let k=0;k<salesByYear.length;k++){
                    result = false;
                    if(salesByYear[k]._id==i){
                        sales.push(salesByYear[k])
                        break;
                    }else{
                        result = true
                    }
                }
                if(result) sales.push({_id:i,total:0});
            }
            let salesData = [];
            for(let i=0;i<sales.length;i++){
                salesData.push(sales[i].total);
            }
            res.render('dashboard',{users:userData,payment:onlineCount,total,Users,Orders,Products,month:salesData});
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const verifyAdmin = async (req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({is_admin:1});
        if(userData.email==email){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                req.session.admin_id = true;
                res.redirect('/admin/dashboard');
            }else{
                res.render('login',{message:"invalid email and password"});
            }
        }else{
            res.render('login',{message:"invalid email and password"});
        }
    }catch(error){
        console.log(error.message);
    }
}

const showTable = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const userData = await User.find({is_admin:0});
            res.render('tables',{users:userData});
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadAddCategory = async (req,res)=>{
    try{
        if(req.session.admin_id){
            res.render('addCategory');
        }else{
            res.redirect('/admin')
        }   
    }catch(error){
        console.log(error.message);
    }
}

const loadLogout = async (req,res)=>{
    try{
        if(req.session.admin_id){
            req.session.admin_id = false;
            res.redirect('/admin');
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const blockUser = async (req,res)=>{
    try{
        const usersData = await User.find({is_admin:0});
        const id = req.query.id;
        const findUser = await User.findOne({_id:id});
        if(findUser.is_blocked==true){
            res.render('tables',{message:"The user is already blocked",users:usersData});
        }else{
            const userData = await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}});
            const finduser = await User.find({is_admin:0})
            if(userData){
                res.render('tables',{message:"User Blocked",users:finduser});
            }else{
                res.render('tables',{message:"User block gone failed",users:finduser})
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

const unblockUser = async (req,res)=>{
    try{
        const usersData = await User.find({is_admin:0});
        const id = req.query.id;
        const findUser = await User.findOne({_id:id});
        if(findUser.is_blocked==false){
            res.render('tables',{message:"The user is already Unblocked",users:usersData});
        }else{
            const userData = await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}});
            const finduser = await User.find({is_admin:0})
            if(userData){
                res.render('tables',{message:"User Unblocked",users:finduser});
            }else{
                res.render('tables',{message:"User Unblock gone failed",users:finduser})
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    loadDashboard,
    verifyAdmin,
    showTable,
    loadAddCategory,
    loadLogout,
    blockUser,
    unblockUser
}
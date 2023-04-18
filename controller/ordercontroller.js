const Order = require('../models/ordermodel');
const Address = require('../models/addressmodel');
const User = require('../models/usermodel')
const Cart = require('../models/cartmodel');
const Product = require('../models/productmodel');
const Razorpay = require('razorpay');
const exceljs = require('exceljs');
const Coupon = require('../models/couponmodel');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv')
dotenv.config();

//htmltopdf require things
const ejs = require('ejs');
const pdf = require('html-pdf')
const fs = require('fs')
const path = require('path');


var instance = new Razorpay({
    key_id: 'rzp_test_n0IW2eUop9hlZT',
    key_secret: process.env.RAZORKEY
  });

const placeOrder = async (req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        const address = req.body.address;
        const paymentMethod = req.body.payment;
        const cartData = await Cart.findOne({userName:req.session.user_id});
        const products = cartData.products;
        const Total = parseInt(req.body.amount);
        const totalPrice = parseInt(req.body.total);
        const discount = parseInt(req.body.discount);
        const wallet = totalPrice - Total -discount;
        const status = paymentMethod === "COD" ? "placed" : "pending";
        const order = new Order({
            deliveryAddress:address,
            userId:req.session.user_id,
            userName:userName.name,
            paymentMethod:paymentMethod,
            products:products,
            totalAmount:Total,
            Amount:totalPrice,
            date:new Date(),
            status:status,
            orderWallet:wallet
        })
        const orderData = await order.save();
        const date = orderData.date.toISOString().substring(5,7);
        const orderId = orderData._id;
        if(orderData){
            for(let i=0;i<products.length;i++){
                const pro = products[i].productId;
                const count = products[i].count;
                await Product.findByIdAndUpdate({_id:pro},{$inc:{stockQuantity: -count}});
            }
            if(order.status=="placed"){
                const wal = totalPrice - Total;
                await Order.updateOne({_id:orderId},{$set:{month:date}})
                await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
                await Cart.deleteOne({userName:req.session.user_id});
                res.json({codSuccess:true});
            }else{
                const orderId = orderData._id;
                await Order.updateOne({_id:orderId},{$set:{month:date}})
                const totalAmount = orderData.totalAmount;
                var options = {
                    amount: totalAmount*100,
                    currency: "INR",
                    receipt: ""+orderId
                }
        
                instance.orders.create(options,function(err,order){
                    res.json({order});
                })
            }
        }else{
            res.redirect('/checkout');
        }
    }catch(error){
        console.log(error.message);
    }
}

const verifyPayment = async (req,res)=>{
    try{
        const totalPrice = req.body.amount2;
        const total = req.body.amount;
        const wal = totalPrice - total;
        const details = req.body
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'dbiEuSCITuTKj9woUAsOpL2n');
        hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if(hmac==details.payment.razorpay_signature){
            await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
            await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
            await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
            await Cart.deleteOne({userName:req.session.user_id});
            res.json({success:true});
        }else{
            await Order.findByIdAndRemove({_id:details.order.receipt});
            res.json({success:false});
        }
    }catch(error){
        console.log(error.message);
    }
}

const orderSuccess = async (req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        if(req.session.user_id){
            let customer = true;
            res.render('ordersuccess',{userName,customer});
        }
    }catch(error){
        console.log(error.message);
    }
}

const showOrder = async (req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        const orderData = await Order.find({userId:req.session.user_id}).populate("products.productId","deliveryAddress");
        if(req.session.user_id){
            const customer = true;
            res.render('showorder',{userName,customer,orderData:orderData});
        }else{
            res.redirect('/');
        }
    }catch(error){
        console.log(error.message);
    }
}

const viewOrderProducts = async(req,res)=>{
    const userName = await User.findOne({_id:req.session.user_id});
    const orderId = await Order.findOne({_id:req.query.id}).populate("products.productId");
    const products = orderId.products;
    if(req.session.user_id){
        const customer = true;
        if(products.length>0){
            res.render('vieworderproducts',{userName,customer,products,orderId});
        }else{
            res.render('vieworderproducts',{userName,customer,products,orderId,message:"Order Cancelled...No more Order here"});
        }
    }else{
        res.redirect('/');
    }
}

const adminShowOrder = async (req,res)=>{
    try{
        const orderData = await Order.find({});
        res.render('listorder',{orderData});
    }catch(error){
        console.log(error.message);
    }
}

const editOrder = async (req,res)=>{
    try{
        const orderId = req.query.id;
        const orderData = await Order.findOne({_id:orderId});
        res.render('editorder',{orderData});
    }catch(error){
        console.log(error.message);
    }
}

const postEditOrder = async(req,res)=>{
    try{
        const update = await Order.updateOne({_id:req.query.id},{$set:{status:req.body.status}});
        if(update){
            res.redirect('/admin/orders');
        }else{
            res.render('editorder',{message:"Status not updated"});
        }
    }catch(error){
        console.log(error.message);
    }
}

const viewProduct = async(req,res)=>{
    const orderId = req.query.id;
    const orderData = await Order.findOne({_id:orderId}).populate("products.productId");
    const productData = orderData.products;
    res.render('vieworderproduct',{productData});
}

const cancelOrder = async (req,res)=>{
    try{
        const user = req.session.user_id;
        const orderid = req.body.orderid;
        const orderData = await Order.findOne({_id:orderid});
        const userData = await User.findOne({_id:user});
        const userWallet = userData.wallet;
        if(orderData.status == "placed" || orderData.status == "Deliverd"){
            if(orderData.paymentMethod == "onlinePayment"){
                const totalWallet = orderData.Amount+userWallet
                console.log(totalWallet);
                await User.updateOne({_id:req.session.user_id},{$set:{wallet:totalWallet}});
                await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
                res.json({success:true})
               }else{
                const totalWallet = userWallet+orderData.orderWallet;
                await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
                await User.updateOne({_id:req.session.user_id},{$set:{wallet:totalWallet}});
                res.json({success:true});
               }
        }else{
            await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
            res.json({success:true});
        }
    }catch(error){
        console.log(error.message);
    }
}

const exportOrder = async (req,res)=>{
    try{
        const workbook = new exceljs.Workbook()
        const worksheet = workbook.addWorksheet("Orders");
        worksheet.columns = [
            { header:"S no.",key:"s_no" },
            { header:"User",key:"userName" },
            { header:"Payment Method",key:"paymentMethod" },
            { header:"Products",key:"products" },
            { header:"Amount Paid",key:"totalAmount" },
            { header:"Total Amount",key:"Amount" },
            { header:"Date",key:"date" },
            { header:"Status",key:"status" }
        ]
        let counter = 1;
        const orderData = await Order.find({});
        orderData.forEach((order)=>{
            order.s_no = counter;
            worksheet.addRow(order);
            counter++;
        })

        worksheet.getRow(1).eachCell((cell)=>{
            cell.font = { bold:true };
        })

        res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition",`attachment;filename=order.xlsx`)

        return workbook.xlsx.write(res).then(()=>{
            res.status(200);
        })

    }catch(error){
        console.log(error.message);
    }
}

const sales = async (req,res)=>{
    try {
        const orderData = await Order.find({});
        res.render('htmltopdf',{orderData})
    } catch (error) {
        console.log(error.message);
    }
}

const exportOrderPDF = async (req,res)=>{
    try{
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(`http://localhost:3000/admin/sales` , {
        waitUntil:"networkidle2"
        })
        await page.setViewport({width: 1680 , height: 1050})
        const todayDate = new Date()
        const pdfn = await page.pdf({
            path: `${path.join(__dirname,'../public/files', todayDate.getTime()+".pdf")}`,
            format: "A4"
        })

        await browser.close()
    
        const pdfUrl = path.join(__dirname,'../public/files', todayDate.getTime()+".pdf")

        res.set({
            "Content-Type":"application/pdf",
            "Content-Length":pdfn.length
        })
        res.sendFile(pdfUrl)
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    placeOrder,
    verifyPayment,
    orderSuccess,
    showOrder,
    viewOrderProducts,
    adminShowOrder,
    editOrder,
    postEditOrder,
    viewProduct,
    cancelOrder,
    exportOrder,
    sales,
    exportOrderPDF
}
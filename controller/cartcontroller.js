const User = require('../models/usermodel');
const Product = require('../models/productmodel')
const Address = require('../models/addressmodel');
const Cart = require('../models/cartmodel');

const loadCart = async (req,res)=>{
    try{
        const id = req.session.user_id;
        const userName = await User.findOne({_id:req.session.user_id});
        const cartData = await Cart.findOne({userName:req.session.user_id}).populate("products.productId");
        if(req.session.user_id){
            if(cartData){
                if(cartData.products.length>0){
                    const products = cartData.products;
                    const total = await Cart.aggregate([{$match:{user:userName.name}},{$unwind:"$products"},{$project:{productPrice:"$products.productPrice",cou:"$products.count"}},{$group:{_id:null,total:{$sum:{$multiply:["$productPrice","$cou"]}}}}]);
                    const Total = total[0].total;
                    const userId = userName._id; 
                    let customer = true;
                    res.render('cart',{customer,userName,products,Total,userId});
                }else{
                    let customer = true;
                    res.render('cartEmpty',{customer,userName,message:"No products added to cart"});
                }
            }else{
                let customer = true;
                res.render('cartEmpty',{customer,userName,message:"No products added to cart"});
            }    
        }else{
            res.redirect('signin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const addToCart = async (req,res)=>{
    try{
        const productId = req.body.query;
        const userData = await User.findOne({_id:req.session.user_id});
        const productData = await Product.findOne({_id:productId});
        if(req.session.user_id){
            const userid = req.session.user_id;
            const cartData = await Cart.findOne({userName:userid});
            if(cartData){
                const productExist = await cartData.products.findIndex((product)=>
                    product.productId == productId
                )
                if(productExist != -1){
                    await Cart.updateOne({userName:userid,"products.productId":productId},{$inc:{"products.$.count":1}});
                    res.json({success:true})
                }else{
                    await Cart.findOneAndUpdate({userName:req.session.user_id},{$push:{products:{productId:productId,productPrice:productData.price}}});
                    res.json({success:true})
                }
            }else{
                const cart = new Cart({
                    userName:userData._id,
                    user:userData.name,
                    products:[{
                        productId:productId,
                        productPrice:productData.price
                    }]
                });

                const cartData = await cart.save();
                if(cartData){
                    res.json({success:true})
                }else{
                    res.redirect('/home');
                }  
            }
        }else{
            res.redirect('/');
        }
    }catch(error){
        console.log(error.message);
    }
}

const removeProduct = async (req,res)=>{
    try{
        const user = req.session.user_id;
        const id = req.query.id;
        await Cart.updateOne({userName:user},{$pull:{products:{productId:id}}});
        res.redirect('/cart');
    }catch(error){
        console.log(error.message);
    }
}

const changeProductCount = async(req,res)=>{
    try{
        const userId = req.body.user;
        const proId = req.body.product;
        let count = req.body.count;
        count = parseInt(count);
        const cartData = await Cart.findOne({userName:userId});
        const [{count:quantity}] = cartData.products
        const productData = await Product.findOne({_id:proId});
        if(productData.stockQuantity < quantity+count){
            res.json({check:true});
        }else{
            res.json({success:true});
            await Cart.updateOne({userName:userId,"products.productId":proId},{$inc:{"products.$.count":count}});
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadCheckout = async(req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        const addressData = await Address.findOne({userId:req.session.user_id});
        if(req.session.user_id){
            if(addressData){
                if(addressData.addresses.length>0){
                    const address = addressData.addresses;
                    const total = await Cart.aggregate([{$match:{user:userName.name}},{$unwind:"$products"},{$project:{productPrice:"$products.productPrice",count:"$products.count"}},{$group:{_id:null,total:{$sum:{$multiply:["$productPrice","$count"]}}}}]);
                    if(total[0].total>=userName.wallet){
                        const Total = total[0].total
                        const grandTotal = (total[0].total) - userName.wallet ;
                        let customer = true;
                        res.render('checkoutPage',{customer,userName,address,Total,grandTotal});
                    }else{
                        const Total = total[0].total;
                        const grandTotal = 1;   
                        let customer = true;
                        res.render('checkoutPage',{customer,userName,address,Total,grandTotal});
                    }
                }else{
                    let customer = true;
                    res.render('emptyCheckoutPage',{customer,userName,message:"Add your delivery address"});
                }
            }else{
                let customer = true;
                res.render('emptyCheckoutPage',{customer,userName,message:"Add your delivery address"});
            }
        }else{
            res.redirect('/');
        }
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    loadCart,
    addToCart,
    removeProduct,
    changeProductCount,
    loadCheckout
}
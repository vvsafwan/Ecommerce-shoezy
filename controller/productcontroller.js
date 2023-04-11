const User = require('../models/usermodel');
const Category = require('../models/categorymodel');
const Product = require('../models/productmodel');

  const loadShowProduct = async (req,res)=>{
    try{
        const userName = await User.findOne({_id:req.session.user_id});
        const productData = await Product.findOne({_id:req.query.id});
            if(req.session.user_id){
                let customer = true;
                res.render('showProduct',{customer,userName,product:productData});
            }else{
                let customer = false;
                res.render('showProduct',{customer,product:productData});
            }
    }catch(error){
        console.log(error.message);
    }
}

const loadAddProduct = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const categoryData = await Category.find({});
            res.render('addProduct',{category:categoryData});
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const addProduct = async (req,res)=>{
    try{
        const image = [];
        for(let i=0;i<req.files.length;i++){
            image[i] = req.files[i].filename;
        }
       const product = new Product({
        productName:req.body.productName,
        price:req.body.price,
        image:image,
        category:req.body.category,
        stockQuantity:req.body.stockQuantity,
        status:req.body.status,
        description:req.body.description
       })
       const categoryData = await Category.find({});
       const productData = await product.save();
       if(productData){
           res.render('addProduct',{category:categoryData,message:"Product added successfully"});
       }else{
           res.render('addProduct',{message:"Failed adding product"});
       }
    }catch(error){
        console.log(error.message);
    }
}

const loadProductList = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const productData = await Product.find({});
            res.render('productList',{products:productData})
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const editProduct = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const productData = await Product.findById({_id:req.query.id}) 
            const catData = await Category.find({});
            if(productData){
                res.render('editProduct',{product:productData,category:catData})
            }else{
                res.redirect('/admin/dashboard');
            }
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const updateProduct = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const productData = await Product.findOne({_id:req.query.id});
            if(req.body.productName.trim().length == 0 || req.body.price.trim().length == 0 || req.body.stockQuantity.trim().length == 0){
                res.render('editProduct',{message:"Enter valid Text",product:productData})
            }else{
                const productData = await Product.findByIdAndUpdate({_id:req.query.id},{$set:{productName:req.body.productName,price:req.body.price,category:req.body.category,stockQuantity:req.body.stockQuantity,status:req.body.status,description:req.body.description}});
                for(let i=0;i<req.files.length;i++){
                    const imageUpdate = await Product.findByIdAndUpdate({_id:req.query.id},{$push:{image:req.files[i].filename}});
                }
                if(productData || imageUpdate){
                    res.redirect('/admin/productList');
                }else{
                    res.render('editProduct',{message:"Product edit failed"});
                }
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

const deleteProduct = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const productData = await Product.findByIdAndDelete({_id:req.query.id});
            if(productData){
                res.redirect('/admin/productList');
            }else{
                res.redirect('/admin/dashboard');
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

const removeImg = async (req,res)=>{
    try{
        const id = req.body.id;
        const pos = req.body.pos;
        const dleImg = await Product.findById({_id:id});
        console.log(dleImg);
        const image = dleImg.image[pos];
        const updateImage = await Product.findByIdAndUpdate({_id:id},{$pullAll:{image:[image]}});
        if(updateImage){
            res.json({success:true});
        }else{
            res.redirect('/admin/dashboard');
        }
    }catch(error){
        console.log(error.message);
    }
}

const unblockProduct = async (req,res)=>{
    try{
        const proId = req.query.id;
        const updateProduct = await Product.findByIdAndUpdate({_id:proId},{$set:{list:true}});
        const productData = await Product.find({});
        if(updateProduct){
            res.render('productList',{products:productData,message:"Producted listed"})
        }else{
            res.render('productList',{products:productData,message:"Product Listing Failed"});
        }
    }catch(error){
        console.log(error.message);
    }
}

const blockProduct = async (req,res)=>{
    try{
        const proId = req.query.id;
        const updateProduct = await Product.findByIdAndUpdate({_id:proId},{$set:{list:false}});
        const productData = await Product.find({});
        if(updateProduct){
            res.render('productList',{products:productData,message:"Producted unlisted"})
        }else{
            res.render('productList',{products:productData,message:"Product Unlisting Failed"});
        }
    }catch(error){
        console.log(error.message);
    }
}

const filterProduct = async (req,res)=>{
    try{
        const start = req.body.start;
        const end = req.body.end;
        const categoryData = await Category.find({status:true});
        const productData = await Product.find({list:true},{price:{$gt:start,$lte:end}});
        res.render('productfilter',{product:productData,category:categoryData});
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    loadShowProduct,
    loadAddProduct,
    addProduct,
    loadProductList,
    editProduct,
    updateProduct,
    deleteProduct,
    removeImg,
    blockProduct,
    unblockProduct,
    filterProduct
}
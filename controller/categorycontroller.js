const Category = require('../models/categorymodel');
const uc = require('upper-case');

const addCategory = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const catName = uc.upperCase(req.body.categoryName);
            const category = new Category({
                categoryName:catName
            })
            
            if(catName.trim().length==0){
                res.render('addCategory',{message:"Invalid typing"});
            }else{
                const catData = await Category.findOne({categoryName:catName});
                if(catData){
                    res.render('addCategory',{message:"This category is already exist"});
                }else{
                    const categoryData = await category.save();
                    if(categoryData){
                        res.redirect('/admin/addCategory');
                    }else{
                        res.redirect('/admin/dashboard');
                    }
                }
            }
        }else{
            res.redirect('/admin')
        }
    }catch(error){
        console.log(error.message);
    }
}

const listCategory = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const categoryData = await Category.find({});
            res.render('listCategory',{category:categoryData});
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const deleteCategory = async (req,res)=>{
    try{
        if(req.session.admin_id){
            const deleteData = await Category.findByIdAndDelete({_id:req.query.id});
            if(deleteData){
                res.redirect('/admin/listCategory');
            }else{
                res.redirect('/admin/dashboard')
            }
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message);
    }
}

const editCategory = async (req,res)=>{
    try{
        const catId = req.query.id;
        const catData = await Category.findOne({_id:catId});
        res.render('editcategory',{cat:catData});
    }catch(error){
        console.log(error.message);
    }
}

const postEdit = async (req,res)=>{
    try{
        const catId = req.query.id;
        const updated = await Category.findByIdAndUpdate({_id:catId},{$set:{categoryName:req.body.categoryName}});
        console.log(updated);
        res.redirect('/admin/listCategory');
    }catch(error){
        console.log(error.message);
    }
}

const anListCategory = async (req,res)=>{
    try{
        const catId = req.query.id;
        const catUpdate = await Category.findByIdAndUpdate({_id:catId},{$set:{status:true}});
        const categoryData = await Category.find();
        if(catUpdate){
            res.render('listCategory',{category:categoryData,message:"Category Listed"})
        }else{
            res.render('listCategory',{category:categoryData,message:"Category Listing Failed"})
        }
    }catch(error){
        console.log(error.message);
    }
}

const UnlistCategory = async (req,res)=>{
    try{
        const catId = req.query.id;
        const catUpdate = await Category.findByIdAndUpdate({_id:catId},{$set:{status:false}})
        const categoryData = await Category.find();
        if(catUpdate){
            res.render('listCategory',{category:categoryData,message:"Category Unlisted"})
        }else{
            res.render('listCategory',{category:categoryData,message:"Category Unlist Failed"})
        }
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    addCategory,
    listCategory,
    deleteCategory,
    editCategory,
    postEdit,
    anListCategory,
    UnlistCategory
}
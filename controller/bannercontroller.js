const Banner = require('../models/bannermodel');

const loadAddBanner = async (req,res)=>{
    try{
        res.render('addbanner');
    }catch(error){
        console.log(error.message);
    }
}

const addBanner = async (req,res)=>{
    try{
        const bannerData = await Banner.findOne({});
        if(bannerData){
            const update = await Banner.updateOne({header:bannerData.header},{$push:{banner:{header:req.body.header,image:req.file.filename,description:req.body.description}}});
            if(update){
                res.render('addBanner',{message:"Banner Added"});
            }else{
                res.render('addBanner',{message:"Banner add failed"});
            }
        }else{
            const banner = new Banner({
                header:req.body.header,
                image:req.file.filename,
                description:req.body.description
            })
            const ban = await banner.save();
            if(ban){
                res.render('addBanner',{message:"Banner Added"});
            }else{
                res.render('addBanner',{message:"Banner add failed"});
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

const listBanner = async (req,res)=>{
    try{
        const bannerData = await Banner.findOne({});
        const ban = bannerData.banner;
        console.log(bannerData);
        res.render('listbanner',{banner:ban});
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    addBanner,
    loadAddBanner,
    listBanner
}
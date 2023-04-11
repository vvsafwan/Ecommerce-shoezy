const mongoose = require('mongoose');
const addProductSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    stockQuantity:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    list:{
        type:String,
        default:true
    }
})

const addProductModel = mongoose.model('product',addProductSchema);
module.exports = addProductModel
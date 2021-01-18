const mongoose = require('mongoose')
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);




const UserSchema =  mongoose.Schema({
      userName: {
        type:String,
        required: true
    },
    userEmail:{
        type:String,
        required: true,
        unique:true
    },
    userPhone:{
        type:String,
        required: true
    },
    isAdmin:{
        type:Boolean,
        required: true, 
    },
    userPassword:{
        type:String,
        required: true
    }
})




module.exports = mongoose.model('koodiUsers', UserSchema)
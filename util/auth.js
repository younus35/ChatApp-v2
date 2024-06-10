const jwt = require('jsonwebtoken');
const User = require('../models/users');

//user authentication middleware
exports.authenticate = async (req, res, next) =>{
    try{
       const token = req.header('authorization');
       const user = jwt.verify(token, '834100nanfa18xnus23346fejk202356ncxmvn8329834nndx90213n3j28fndskn871489hjnvz8y3tgsdf2a1gh654yfd')
       const foundUser = await User.findByPk(user.userId)//here userId is the userId in token find with the help of jwt.io
       req.user = foundUser;
       next();
    }
    catch(err){
        console.log(err);
    }
}
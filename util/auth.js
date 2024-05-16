const jwt = require('jsonwebtoken');
const User = require('../models/users');

exports.authenticate = async (req, res, next) =>{
    try{
       const token = req.header('authorization');
       const user = jwt.verify(token, '834100nanfa18xnus23346fejk202356ncxmvn8329834nndx90213n3j28fndskn871489hjnvz8y3tgsdf2a1gh654yfd')
       const foundUser = await User.findByPk(user.userId)
    }
    catch(err){
        console.log(err);
    }
}
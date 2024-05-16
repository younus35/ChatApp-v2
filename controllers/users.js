const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signUp = async (req, res, next) =>{
    try{
      const user = req.body.user;
      const email = req.body.email;
      const phno = req.body.phno;
      const password = req.body.password;
      const saltrounds = 10;
      const hash = await bcrypt.hash(password, saltrounds);
        const createdUser = await User.create({
            name: user,
            email: email,
            phonenumber: phno,
            password: hash
        })
        res.json(createdUser);
    }
    catch(err){
        if(err.name === 'SequelizeUniqueConstraintError'){
            res.json({message:'Email already exists'})
        }else{
        console.log(err)
        }
    }
}
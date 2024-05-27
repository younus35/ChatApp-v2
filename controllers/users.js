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

exports.generateAccessToken = (id)=>{
    return jwt.sign({userId:id}, process.env.JWT_SECRET_KEY)
}

exports.signIn = async (req, res, next)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const response = await User.findAll({where:{email}})//we can also write { email: email } but as both are same so we wrote it like that
        if(response.length > 0){
         const match = await bcrypt.compare(password, response[0].password);  
            if(match){
             res.status(200).json({message:"User Logged In Successfully",token:exports.generateAccessToken(response[0].id)});
            }
            else{
             return res.status(401).json({message:"Password is Incorrect"});
            } 
        }else{
            return res.status(404).json({message:"User does not exists"});
        }
    }
    catch(err){
        res.status(500).json({message:err});
    }
}

exports.allUsers = async (req, res, next) =>{
    try{
        const users = await User.findAll({
            attributes: ['name'] // Select the attributes you want to return
        });
        res.json(users);
    }
    catch(err){
        console.log(err);
    }
}
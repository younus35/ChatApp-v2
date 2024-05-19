const Message = require('../models/messages');
const User = require('../models/users');
const sequelize = require('../util/database');

exports.sendMessage = async (req, res, next) =>{
    const t = await sequelize.transaction();
    try{
        const message = req.body.message;
        // console.log(message);
        const createdMessage = await Message.create({message,username:req.user.name,userId:req.user.id}, {transaction: t})
        await t.commit();
        res.json(createdMessage)
     }
     catch(err){
        await t.rollback();
        console.log(err);
     }
}
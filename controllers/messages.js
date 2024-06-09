const Message = require('../models/messages');
const User = require('../models/users');
const sequelize = require('../util/database');
const Sequelize = require('sequelize');
const s3 = require('../util/awsS3');
const { v4: uuidv4 } = require('uuid');

exports.sendMessage = async (req, res, next) =>{
    const t = await sequelize.transaction();
    try{
        const message = req.body.message;
        const file = req.file;
        
        let fileUrl = null;

        if (file) {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;

            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: fileName,
                Body: file.buffer,
                ACL: "public-read"
            };

            const uploadResult = await s3.upload(params).promise();
            fileUrl = uploadResult.Location; // This is the URL of the uploaded file
        }
        // console.log(fileUrl);
    
        const createdMessage = await Message.create({message, fileKey:fileUrl, username:req.user.name,userId:req.user.id}, {transaction: t})
        await t.commit();
        res.json(createdMessage)
     }
     catch(err){
        await t.rollback();
        console.log(err);
     }
}

exports.getMessage = async (req, res, next) =>{
    try{
        const lastMessageId = req.query.lastMessageId || 0;
        
        const messages = await Message.findAll({
        where: { id: { [Sequelize.Op.gt]: parseInt(lastMessageId) } },
        order: [['createdAt', 'ASC']]
       })
       res.json(messages);
    }
    catch(err){
        console.log(err);
    }
}
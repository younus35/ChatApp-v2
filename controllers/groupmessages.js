const GroupMessage = require('../models/groupmessage');
const GroupMember = require('../models/groupmembers');
const sequelize = require('../util/database')
const User = require('../models/users')
const Sequelize = require('sequelize');
const s3 = require('../util/awsS3');
const { v4: uuidv4 } = require('uuid');

exports.sendMessage = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { groupId, message } = req.body;
        const file = req.file;
        let fileUrl = null;
        const isMember = await GroupMember.findOne({
            where: { groupId: groupId, userId: req.user.id },
            include: [{ model: User, attributes: ['name', 'email']}]
        });
        if (!isMember) {
            throw new Error('User is not a member of this group');
        }
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
        console.log(fileUrl);
    
        const createdMessage = await GroupMessage.create({
            groupId: groupId,
            userId: req.user.id,
            message: message,
            fileKey:fileUrl
        }, { transaction: t });
        await t.commit();
        res.json({createdMessage,name:isMember});
    } catch (err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

exports.getMessages = async (req, res, next) => {
    try {
        const lastMessageId = req.query.lastMessageId || 0;
        const { groupId } = req.params;
        const isMember = await GroupMember.findOne({
            where: { groupId: groupId, userId: req.user.id }
        });
        if (!isMember) {
            throw new Error('User is not a member of this group');
        }
        const messages = await GroupMessage.findAll({
            where: { groupId: groupId,
                id: {
                    [Sequelize.Op.gt]:parseInt(lastMessageId)
                },
             },
             include: [{ model: User, attributes: ['name', 'email'] }],
             order: [['createdAt', 'ASC']]
        });
        res.json(messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

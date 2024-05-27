const GroupMessage = require('../models/groupmessage');
const GroupMember = require('../models/groupmembers');
const sequelize = require('../util/database')
const User = require('../models/users')
const Sequelize = require('sequelize');

exports.sendMessage = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { groupId, message } = req.body;
        const isMember = await GroupMember.findOne({
            where: { groupId: groupId, userId: req.user.id },
            include: [{ model: User, attributes: ['name', 'email']}]
        });
        if (!isMember) {
            throw new Error('User is not a member of this group');
        }
        const createdMessage = await GroupMessage.create({
            groupId: groupId,
            userId: req.user.id,
            message: message
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

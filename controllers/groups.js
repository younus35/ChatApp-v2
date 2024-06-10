const Group = require('../models/groups');
const GroupMember = require('../models/groupmembers');
const User = require('../models/users');


//controller to create group
exports.createGroup = async (req, res, next) => {
    try {
        const groupName = req.body.name;
        const createdGroup = await Group.create({
            name: groupName,
            createdBy: req.user.id
        });
        await GroupMember.create({
            groupId: createdGroup.id,
            userId: req.user.id
        });
        res.json(createdGroup);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

//adds the user to the group when we enter the emails in the invitation form
exports.inviteToGroup = async (req, res, next) => {
    try {
        const { groupId, emails } = req.body;

        const isCreator = await GroupMember.findOne({
            where: { groupId: groupId, userId: req.user.id}
        });

        if (!isCreator) {
            return res.status(403).json({ message: 'Only group creator can send invitations' });
        }

        const groupExists = await GroupMember.findOne({
            where: { groupId: groupId }
        });

        if (!groupExists) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const validUsers = await User.findAll({
            where: { email: emails }
        });

        if (validUsers.length !== emails.length) {
            return res.status(400).json({ message: 'One or more user IDs are invalid' });
        }

        // Send invitations to the specified users for the given group ID
        await GroupMember.bulkCreate(validUsers.map(user => ({ groupId, userId: user.id })));

        res.status(200).json({ message: 'Invitations sent successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

//this crontroller is used to get all the available groups from the GroupMemeber table for the required user
exports.getGroups = async (req, res, next) => {
    try {
        const groups = await GroupMember.findAll({
            where: { userId: req.user.id },
            include: [{ model: Group }]
        });
        res.json(groups);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

//controller to get the all available users in that group
exports.getGroupMembers = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const isMember = await GroupMember.findOne({
            where: { groupId: groupId, userId: req.user.id }
        });
        if (!isMember) {
            throw new Error('User is not a member of this group');
        }
        const members = await GroupMember.findAll({
            where: { groupId: groupId },
            include: [{ model: User, attributes: ['id' ,'name', 'email', 'phonenumber'] }]
        });
        res.json(members.map(m => m.user));
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

//controller to remove the user from the group
exports.removeMember = async (req, res, next) =>{
    try{
        const { userId } = req.params;
        const { groupId } = req.body;

        // Check if the current user is the creator of the group
        const isCreator = await Group.findOne({
            where: { id: groupId, createdBy: req.user.id }
        });

        if (!isCreator) {
            return res.status(403).json({ message: 'Only the group creator can remove members' });
        }

        await GroupMember.destroy({
            where: { groupId: groupId, userId: userId }
        });

        res.status(200).json({ message: 'User removed from the group successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}
const express = require('express');
const cors = require('cors');

const app = express();

const User = require('./models/users');
const Message = require('./models/messages');
const Group = require('./models/groups');
const GroupMember = require('./models/groupmembers');
const GroupMessage = require('./models/groupmessage');

app.use(cors());

const dotenv = require("dotenv");
dotenv.config();

const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups')
const groupMessageRoutes = require('./routes/groupmessages');

const sequelize = require('./util/database');

app.use(express.json());

app.use('/user', userRoutes)
app.use('/message', messageRoutes)
app.use('/group', groupRoutes)
app.use('/group-message', groupMessageRoutes)

User.hasMany(Message); // we can also use User.hasMany(Message, { foreignKey: "userId" }); its same
Message.belongsTo(User);

User.hasMany(Group); // User has many Groups they created
Group.belongsTo(User, { foreignKey: 'createdBy' });// Group belongs to User (creator)

User.hasMany(GroupMember);// User has many GroupMemberships
GroupMember.belongsTo(User);// GroupMember belongs to User

Group.hasMany(GroupMember);// Group has many GroupMembers
GroupMember.belongsTo(Group);// GroupMember belongs to Group

User.hasMany(GroupMessage);// User has many GroupMessages
GroupMessage.belongsTo(User);// GroupMessage belongs to User

Group.hasMany(GroupMessage);// Group has many GroupMessages
GroupMessage.belongsTo(Group); // GroupMessage belongs to Group


sequelize
.sync()
.then(result =>{
    app.listen(3000)
})
.catch(err => console.log(err));
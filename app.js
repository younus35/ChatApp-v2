const express = require('express');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:'http://127.0.0.1:5500'
    }
})

const User = require('./models/users');
const Message = require('./models/messages');
const Group = require('./models/groups');
const GroupMember = require('./models/groupmembers');
const GroupMessage = require('./models/groupmessage');

app.use(cors({
    origin: ["http://127.0.0.1:5500"]
}));


const dotenv = require("dotenv");
dotenv.config();

const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups')
const groupMessageRoutes = require('./routes/groupmessages');

const sequelize = require('./util/database');

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
    server.listen(3000, () =>{
        console.log('Server is running on port 3000')
    });
})
.catch(err => console.log(err));

io.on('connection', (socket) =>{
    console.log('A client connected');

    socket.on('joinGroup', (groupId) => {
        if (groupId) {
            console.log(`User leaving global room`);
            socket.leave('global');
            console.log(`User joining group ${groupId}`);
            socket.join(`group_${groupId}`);
        } else {
            console.log(`User leaving all group rooms`);
            for (let room of socket.rooms) {
                if (room.startsWith('group_')) {
                    socket.leave(room);
                }
            }
            console.log('User joining global room');
            socket.join('global');
        }
    });
    
    socket.on('leaveGroup', (groupId) => {
        if (groupId) {
            console.log(`User leaving group ${groupId}`);
            socket.leave(`group_${groupId}`);
        } else {
            console.log('User leaving global room');
            socket.leave('global');
        }
    });

    socket.on('message', (data) => {
        const groupId = data.groupId;
        console.log(`Received message in group ${groupId}`);
        if (groupId) {
            console.log("not global")
            io.to(`group_${groupId}`).emit('message', data);
        } else {
            console.log("global")
            io.to('global').emit('message', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('A client disconnected');
    })

})

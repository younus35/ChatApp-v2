const express = require('express');
const cors = require('cors');

const app = express();

const User = require('./models/users');
const Message = require('./models/messages');

app.use(cors());

const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

const sequelize = require('./util/database');

app.use(express.json());

app.use('/user', userRoutes)
app.use('/message', messageRoutes)

User.hasMany(Message); // we can also use User.hasMany(Message, { foreignKey: "userId" }); its same
Message.belongsTo(User);

sequelize
.sync()
.then(result =>{
    app.listen(3000)
})
.catch(err => console.log(err));
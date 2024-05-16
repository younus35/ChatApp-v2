const express = require('express');
const cors = require('cors');

const app = express();

const User = require('./models/users');

app.use(cors());

const userRoutes = require('./routes/users');
const sequelize = require('./util/database');

app.use(express.json());

app.use('/user', userRoutes)

sequelize
.sync()
.then(result =>{
    app.listen(3000)
})
.catch(err => console.log(err));
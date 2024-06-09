const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Message = sequelize.define('message',
    {
        id:{
            type:Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        message: Sequelize.TEXT,
        username:{
            type:Sequelize.STRING,
            allowNull:false
        },
        // Add a single column to store the S3 file key or URL
        fileKey: Sequelize.STRING, // Store the S3 file key or URL
        createdAt:{
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        },
    },
    { updatedAt: false }
)

module.exports = Message;
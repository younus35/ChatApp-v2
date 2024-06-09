const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const GroupMessage = sequelize.define('groupMessage', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    // Add a single column to store the S3 file key or URL
    fileKey: Sequelize.STRING // Store the S3 file key or URL
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
});

module.exports = GroupMessage;

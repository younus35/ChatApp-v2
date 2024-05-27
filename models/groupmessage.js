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
    }
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
});

module.exports = GroupMessage;

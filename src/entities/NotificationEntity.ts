import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";

class NotificationEntity extends Model {}

NotificationEntity.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
    },
    edge_server_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'edge_servers',
          key: 'id'
        }
    },
    title: {
        type: DataTypes.CHAR(255),
        allowNull: false,
    },  
    image: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    is_viewed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
    },
    deleted_at: {
        type: DataTypes.DATE,
    }
}, {
    sequelize: db.getConnection(), 
    modelName: 'Notification', 
    tableName: 'notifications',
    timestamps: false,
    underscored: true
})

export default NotificationEntity
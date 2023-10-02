import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";
import UserGroupEntity from "./UserGroup";

class DeviceEntity extends Model {}

DeviceEntity.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    vendor_name: {
        type: DataTypes.CHAR(255),
        allowNull: false,
    },  
    vendor_number: {
        type: DataTypes.CHAR(255),
        allowNull: false,
    }, 
}, {
    sequelize: db.getConnection(), 
    modelName: 'Device', 
    tableName: 'devices',
    timestamps: false,
    underscored: true
})

DeviceEntity.hasMany(UserGroupEntity, {foreignKey: 'device_id'})

export default DeviceEntity
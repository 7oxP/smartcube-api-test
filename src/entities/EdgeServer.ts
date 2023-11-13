import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";
import UserGroupEntity from "./UserGroup";
import DeviceEntity from "./DeviceEntity";
import DeviceEdgeServerEntity from "./DeviceEdgeServer";

class EdgeServerEntity extends Model {}

EdgeServerEntity.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vendor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mqtt_user: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mqtt_password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mqtt_pub_topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mqtt_sub_topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
}, {
    sequelize: db.getConnection(), 
    modelName: 'EdgeServer', 
    tableName: 'edge_servers',
    timestamps: false,
    underscored: true
})

EdgeServerEntity.hasMany(UserGroupEntity, {foreignKey: "edge_server_id", as: "user_groups"})

EdgeServerEntity.belongsToMany(DeviceEntity, {through: DeviceEdgeServerEntity, as: "devices"})
DeviceEntity.belongsToMany(EdgeServerEntity, {through: DeviceEdgeServerEntity, as: "edge_servers"})

export default EdgeServerEntity
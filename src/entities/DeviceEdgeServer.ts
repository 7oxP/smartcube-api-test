
import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";

class DeviceEdgeServerEntity extends Model {}

DeviceEdgeServerEntity.init({
    edge_server_id: {
      type: DataTypes.BIGINT.UNSIGNED
    },
    device_id: {
      type: DataTypes.BIGINT.UNSIGNED
    }
  }, {
    sequelize: db.getConnection(), 
    modelName: 'DeviceEdgeServer', 
    tableName: 'devices_edge_servers',
    timestamps: false,
    underscored: true
})

export default DeviceEdgeServerEntity




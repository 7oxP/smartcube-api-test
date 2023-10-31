import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";

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
}, {
    sequelize: db.getConnection(), 
    modelName: 'EdgeServer', 
    tableName: 'edge_servers',
    timestamps: false,
    underscored: true
})

export default EdgeServerEntity
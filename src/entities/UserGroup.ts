import { DataTypes, Model } from "sequelize";
import { db } from "./BaseEntity";

class UserGroupEntity extends Model { }

UserGroupEntity.init({
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    // allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  device_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    // allowNull: false,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
}, {
  sequelize: db.getConnection(),
  modelName: 'UserGroup',
  tableName: 'user_groups',
  timestamps: false,
  underscored: true
})

export default UserGroupEntity
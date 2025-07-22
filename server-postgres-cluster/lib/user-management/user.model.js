import { DataTypes, Model } from "sequelize";

export class User extends Model {}

export function initUserModel(sequelize) {
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      username: { type: DataTypes.STRING, unique: true, allowNull: false },
      passwordHash: { type: DataTypes.STRING, allowNull: false }
    },
    {
      sequelize,
      tableName: "users"
    }
  );
  return User;
}
import { Errors } from "../util.js";
import { Model, DataTypes } from "sequelize";

class CrudRepository {
  findAll() {}
  findById(id) {}
  save(entity) {}
  deleteById(id) {}
}

export class UserRepository extends CrudRepository {}

class User extends Model {}

export class PostgresUserRepository extends UserRepository {
  constructor(sequelize) {
    super();
    this.sequelize = sequelize;

    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        passwordHash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        preferences: {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: {
            petCare: false,
            laundry: false,
            cooking: false,
            organization: true,
            plantCare: false,
            houseWork: false,
            yardWork: false,
            familyCare: false
          }
        }
      },
      {
        sequelize,
        tableName: "users",
      }
    );
  }

  findAll() {
    return this.sequelize.transaction((transaction) => {
      return User.findAll({ 
        attributes: ['username'],
        order: [['username', 'ASC']],
        transaction 
      });
    });
  }

  async findById(id) {
    return this.sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(id, { transaction });

      if (!user) {
        throw Errors.ENTITY_NOT_FOUND;
      }

      return user;
    });
  }

  async findByUsername(username) {
    return this.sequelize.transaction(async (transaction) => {
      const user = await User.findOne({ 
        where: { username },
        transaction 
      });

      return user;
    });
  }

  save(entity) {
    return this.sequelize.transaction((transaction) => {
      return User.upsert(entity, { transaction });
    });
  }

  async deleteById(id) {
    return this.sequelize.transaction(async (transaction) => {
      const count = await User.destroy({ 
        where: { id }, 
        transaction 
      });

      if (count === 0) {
        throw Errors.ENTITY_NOT_FOUND;
      }
    });
  }
}

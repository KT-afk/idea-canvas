import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from "sequelize-typescript";
import BOARDS from "./BOARDS";

@Table({
  tableName: "USER_PREFERENCES",
  timestamps: true,
  createdAt: "CREATEDAT",
  updatedAt: "UPDATEDAT",
})
export default class UserPreferences extends Model<InferAttributes<UserPreferences>, InferCreationAttributes<UserPreferences>> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: "ID",
  })
  declare id: CreationOptional<string>;

  @Column({
    type: DataType.STRING(255),
    defaultValue: "default-user", // Placeholder for MVP (not a real UUID until auth is implemented)
    allowNull: true,
    field: "USERID",
  })
  declare userId: CreationOptional<string | null>;

  @ForeignKey(() => BOARDS)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: "DEFAULTBOARDID",
  })
  declare defaultBoardId: CreationOptional<string | null>;

  @BelongsTo(() => BOARDS)
  declare defaultBoard: CreationOptional<BOARDS>;

  @Column({
    type: DataType.STRING(15),
    defaultValue: "normal",
    field: "RESURFACEFREQUENCY",
  })
  declare resurfaceFrequency: CreationOptional<string>;

  @Column({
    type: DataType.STRING(30),
    defaultValue: "warm-purple",
    field: "THEME",
  })
  declare theme: CreationOptional<string>;

  @Column({
    type: DataType.STRING(30),
    defaultValue: "charcoal",
    field: "CANVASCOLOR",
  })
  declare canvasColor: CreationOptional<string>;

  @Column({
    type: DataType.DECIMAL(3, 2),
    defaultValue: 1.0,
    field: "LASTZOOM",
  })
  declare lastZoom: CreationOptional<number>;
}

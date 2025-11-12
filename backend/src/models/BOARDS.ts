import { CreationOptional, InferAttributes } from "sequelize";
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import NOTES from "./NOTES";

@Table ({
tableName: "BOARDS",
  timestamps: true,
  createdAt: "CREATEDAT",
  updatedAt: "UPDATEDAT",
})
export default class Boards extends Model<InferAttributes<Boards>, InferAttributes<Boards>> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
        field: "ID",
    })
    declare id: CreationOptional<string>;
    @Column({
        type: DataType.TEXT,
        allowNull: false,
        defaultValue: null,
        field: "NAME",
    })
    declare name: string;
    @HasMany(() => NOTES, {
        foreignKey: "boardId",
        sourceKey: "id",
        constraints: false,
    })
    declare notes?: CreationOptional<NOTES[]>;
}
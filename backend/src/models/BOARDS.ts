import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import NOTES from "./NOTES";

@Table ({
tableName: "BOARDS",
  timestamps: true,
  createdAt: "CREATEDAT",
  updatedAt: "UPDATEDAT",
})
export default class Boards extends Model<InferAttributes<Boards>, InferCreationAttributes<Boards>> {
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

    @Column({
        type: DataType.UUID,
        allowNull: true,
        field: "USERID",
    })
    declare userId: CreationOptional<string | null>;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: "DELETEDAT",
    })
    declare deletedAt: CreationOptional<Date | null>;

    @HasMany(() => NOTES, {
        foreignKey: "boardId",
        sourceKey: "id",
        constraints: false,
    })
    declare notes?: CreationOptional<NOTES[]>;
}
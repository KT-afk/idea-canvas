import { CreationOptional, InferAttributes } from "sequelize";
import { BelongsTo, Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
import Boards from "./BOARDS";

@Table ({
tableName: "NOTES",
  timestamps: true,
  createdAt: "CREATEDAT",
  updatedAt: "UPDATEDAT",
})
export default class Notes extends Model<InferAttributes<Notes>, InferAttributes<Notes>> {
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
        field: "CONTENT",
    })
    declare content: string;
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "X",
    })
    declare x: string;
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "Y",
    })
    declare y: string;
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "width",
    })
    declare width: string;
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "height",
    })
    declare height: string;

    @Column({
        type: DataType.UUID,
        allowNull: true,
        field: "BOARDID",
    })
    declare boardId: string;

    @BelongsTo(() => Boards, {
        foreignKey: "boardId",
    })
    declare board?: CreationOptional<Boards>;
}
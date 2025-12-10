import { CreationOptional, InferAttributes } from "sequelize";
import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
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
        type: DataType.DECIMAL(5, 2),
        allowNull: false,
        field: "X",
    })
    declare x: number;
    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: false,
        field: "Y",
    })
    declare y: number;
    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: false,
        field: "WIDTH",
        defaultValue: 192,
    })
    declare width: number;
    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: false,
        field: "HEIGHT",
        defaultValue: 96,
    })
    declare height: number;

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

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "ZINDEX",
    })
    declare zIndex: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "yellow",
        field: "COLOR",
    })
    declare color: string;
}
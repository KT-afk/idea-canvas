import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import Boards from "./BOARDS";

@Table ({
tableName: "NOTES",
  timestamps: true,
  createdAt: "CREATEDAT",
  updatedAt: "UPDATEDAT",
})
export default class Notes extends Model<InferAttributes<Notes>, InferCreationAttributes<Notes>> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
        field: "ID",
    })
    declare id: CreationOptional<string>;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: "TITLE",
    })
    declare title: CreationOptional<string | null>;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: "CONTENT",
    })
    declare content: string;

    @Column({
        type: DataType.ENUM('note', 'idea', 'plan'),
        allowNull: false,
        defaultValue: 'note',
        field: "TYPE",
    })
    declare type: CreationOptional<'note' | 'idea' | 'plan'>;

    @Column({
        type: DataType.ENUM('active', 'archived', 'graduated'),
        allowNull: false,
        defaultValue: 'active',
        field: "STATUS",
    })
    declare status: CreationOptional<'active' | 'archived' | 'graduated'>;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: "POSITIONX",
    })
    declare positionX: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: "POSITIONY",
    })
    declare positionY: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "yellow",
        field: "BACKGROUNDCOLOR",
    })
    declare backgroundColor: CreationOptional<string>;

    @Column({
        type: DataType.UUID,
        allowNull: true,
        field: "BOARDID",
    })
    declare boardId: CreationOptional<string | null>;

    @Column({
        type: DataType.UUID,
        allowNull: true,
        field: "USERID",
    })
    declare userId: CreationOptional<string | null>;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: "ARCHIVEDAT",
    })
    declare archivedAt: CreationOptional<Date | null>;

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
    declare zIndex: CreationOptional<number>;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "black",
        field: "TEXTCOLOR",
    })
    declare textColor: CreationOptional<string>;

    @Column({
        type: DataType.JSONB,
        allowNull: true,
        field: "METADATA",
    })
    declare metadata: CreationOptional<Record<string, any> | null>;
}
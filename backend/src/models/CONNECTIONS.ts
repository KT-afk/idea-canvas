/**
 * Connection Model
 * Epic 6, Story 6.1: Connection Data Model & API
 * 
 * Represents visual connections between notes/cards on a board
 * Enables mind-mapping and relationship visualization
 */

import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Notes from './NOTES';
import Boards from './BOARDS';

@Table({
  tableName: 'CONNECTIONS',
  timestamps: true,
  createdAt: 'CREATEDAT',
  updatedAt: 'UPDATEDAT',
})
export default class Connections extends Model<InferAttributes<Connections>, InferCreationAttributes<Connections>> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'ID',
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => Notes)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'SOURCECARDID',
  })
  declare sourceCardId: string;

  @BelongsTo(() => Notes, { foreignKey: 'SOURCECARDID', onDelete: 'CASCADE' })
  declare sourceCard?: Notes;

  @ForeignKey(() => Notes)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'TARGETCARDID',
  })
  declare targetCardId: string;

  @BelongsTo(() => Notes, { foreignKey: 'TARGETCARDID', onDelete: 'CASCADE' })
  declare targetCard?: Notes;

  @ForeignKey(() => Boards)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'BOARDID',
  })
  declare boardId: string;

  @BelongsTo(() => Boards, { foreignKey: 'BOARDID', onDelete: 'CASCADE' })
  declare board?: Boards;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'LABEL',
  })
  declare label: CreationOptional<string | null>;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'CREATEDAT',
  })
  declare createdAt: CreationOptional<Date>;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'UPDATEDAT',
  })
  declare updatedAt: CreationOptional<Date>;
}

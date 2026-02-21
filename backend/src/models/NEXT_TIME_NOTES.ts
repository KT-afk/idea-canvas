/**
 * Next Time Notes Model
 * Epic 8, Story 8.1: Idea Evolution - "Next Time" follow-up thoughts
 *
 * Stores follow-up notes attached to an Idea card.
 * Each entry records a future intention the user wants to act on.
 */

import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Notes from './NOTES';

@Table({
  tableName: 'NEXT_TIME_NOTES',
  timestamps: true,
  createdAt: 'CREATEDAT',
  updatedAt: 'UPDATEDAT',
})
export default class NextTimeNotes extends Model<
  InferAttributes<NextTimeNotes>,
  InferCreationAttributes<NextTimeNotes>
> {
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
    field: 'PARENTNOTEID',
  })
  declare parentNoteId: string;

  @BelongsTo(() => Notes, { foreignKey: 'PARENTNOTEID', onDelete: 'CASCADE' })
  declare parentNote?: Notes;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'CONTENT',
  })
  declare content: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'COMPLETEDAT',
  })
  declare completedAt: CreationOptional<Date | null>;
}

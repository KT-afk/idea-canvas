/**
 * Activity Log Model
 * Epic 8, Story 8.3: Idea Evolution - Activity tracking for history/timeline
 *
 * Records meaningful events on a note/idea for the history timeline.
 * Also used by the resurfacing system to determine "forgotten" ideas.
 */

import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Notes from './NOTES';

export type ActivityEventType =
  | 'created'
  | 'edited'
  | 'type_changed'
  | 'status_changed'
  | 'connected'
  | 'resurfaced'
  | 'next_time_added'
  | 'next_time_completed'
  | 'graduated';

@Table({
  tableName: 'ACTIVITY_LOG',
  timestamps: false,
  // We use a single CREATEDAT column as the event timestamp
})
export default class ActivityLog extends Model<
  InferAttributes<ActivityLog>,
  InferCreationAttributes<ActivityLog>
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
    field: 'NOTEID',
  })
  declare noteId: string;

  @BelongsTo(() => Notes, { foreignKey: 'NOTEID', onDelete: 'CASCADE' })
  declare note?: Notes;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'EVENTTYPE',
  })
  declare eventType: ActivityEventType;

  /**
   * Optional JSON payload for additional context.
   * e.g. { from: 'note', to: 'idea' } for type_changed
   */
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'PAYLOAD',
  })
  declare payload: CreationOptional<Record<string, unknown> | null>;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'CREATEDAT',
  })
  declare createdAt: CreationOptional<Date>;
}

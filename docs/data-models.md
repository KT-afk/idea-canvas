# Data Models - Idea Canvas

## Overview

Idea Canvas uses PostgreSQL with Sequelize ORM and sequelize-typescript decorators. The database schema consists of two main tables: NOTES and BOARDS with a one-to-many relationship.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                              BOARDS                                  │
├─────────────────────────────────────────────────────────────────────┤
│ ID (UUID, PK)                                                        │
│ NAME (TEXT)                                                          │
│ CREATEDAT (TIMESTAMP)                                                │
│ UPDATEDAT (TIMESTAMP)                                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              NOTES                                   │
├─────────────────────────────────────────────────────────────────────┤
│ ID (UUID, PK)                                                        │
│ CONTENT (TEXT)                                                       │
│ X (DECIMAL 10,2)                                                     │
│ Y (DECIMAL 10,2)                                                     │
│ WIDTH (DECIMAL 5,2)                                                  │
│ HEIGHT (DECIMAL 5,2)                                                 │
│ BOARDID (UUID, FK → BOARDS.ID)                                       │
│ ZINDEX (INTEGER)                                                     │
│ COLOR (VARCHAR)                                                      │
│ TEXTCOLOR (VARCHAR)                                                  │
│ CREATEDAT (TIMESTAMP)                                                │
│ UPDATEDAT (TIMESTAMP)                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Table Definitions

### NOTES Table

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| ID | UUID | PRIMARY KEY | UUIDV4 | Unique identifier |
| CONTENT | TEXT | NOT NULL | - | Note text content |
| X | DECIMAL(10,2) | NOT NULL | - | X position coordinate |
| Y | DECIMAL(10,2) | NOT NULL | - | Y position coordinate |
| WIDTH | DECIMAL(5,2) | NOT NULL | 192 | Note width in pixels |
| HEIGHT | DECIMAL(5,2) | NOT NULL | 96 | Note height in pixels |
| BOARDID | UUID | FK (BOARDS.ID) | NULL | Parent board reference |
| ZINDEX | INTEGER | NOT NULL | 0 | Layer ordering |
| COLOR | VARCHAR(255) | NOT NULL | 'yellow' | Background color |
| TEXTCOLOR | VARCHAR(255) | NOT NULL | 'black' | Text color |
| CREATEDAT | TIMESTAMP | NOT NULL | NOW | Creation timestamp |
| UPDATEDAT | TIMESTAMP | NOT NULL | NOW | Last modification |

**Indexes:**
- Primary Key on ID
- Foreign Key on BOARDID → BOARDS.ID

### BOARDS Table

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| ID | UUID | PRIMARY KEY | UUIDV4 | Unique identifier |
| NAME | TEXT | NOT NULL | - | Board name |
| CREATEDAT | TIMESTAMP | NOT NULL | NOW | Creation timestamp |
| UPDATEDAT | TIMESTAMP | NOT NULL | NOW | Last modification |

**Indexes:**
- Primary Key on ID

## Sequelize Model Definitions

### Notes Model (`backend/src/models/NOTES.ts`)

```typescript
@Table({
  tableName: "NOTES",
  timestamps: true,
  createdAt: "CREATEDAT",
  updatedAt: "UPDATEDAT",
})
export default class Notes extends Model<InferAttributes<Notes>> {
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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: "X",
  })
  declare x: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
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

  @BelongsTo(() => Boards, { foreignKey: "boardId" })
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "black",
    field: "TEXTCOLOR",
  })
  declare textColor: string;
}
```

### Boards Model (`backend/src/models/BOARDS.ts`)

```typescript
@Table({
  tableName: "BOARDS",
  timestamps: true,
  createdAt: "CREATEDAT",
  updatedAt: "UPDATEDAT",
})
export default class Boards extends Model<InferAttributes<Boards>> {
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
```

## Relationships

### Board → Notes (One-to-Many)

```typescript
// In Boards model
@HasMany(() => NOTES, {
  foreignKey: "boardId",
  sourceKey: "id",
  constraints: false,  // No database-level constraints
})
declare notes?: CreationOptional<NOTES[]>;
```

### Note → Board (Many-to-One)

```typescript
// In Notes model
@BelongsTo(() => Boards, {
  foreignKey: "boardId",
})
declare board?: CreationOptional<Boards>;
```

**Note:** The relationship has `constraints: false` meaning the foreign key is not enforced at the database level. This allows notes to exist without a board (`boardId: null`).

## TypeScript Type Definition

### Frontend Type (`frontend/src/types/types.ts`)

```typescript
export type Note = {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  textColor: string;
  boardId?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

## Data Precision

### Coordinate System

- **X, Y coordinates:** `DECIMAL(10,2)` supports values up to 99,999,999.99
- **Width, Height:** `DECIMAL(5,2)` supports values up to 999.99
- This enables very large canvas sizes for the infinite canvas feature

### Why DECIMAL instead of FLOAT?

DECIMAL provides exact precision for pixel coordinates, avoiding floating-point rounding errors that could cause visual jitter during drag operations.

## Database Migrations

Migrations are managed via Sequelize CLI:

```bash
# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo
```

Migration files location: `backend/src/migrations/`

## Sync Strategy

The application uses `sequelize.sync({ alter: true })` on startup:
- Automatically creates tables if they don't exist
- Alters existing tables to match model definitions
- Safe for development; consider explicit migrations for production

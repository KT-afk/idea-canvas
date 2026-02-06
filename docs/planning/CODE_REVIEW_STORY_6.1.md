# 🔍 Code Review: Story 6.1 - Connection Data Model & API

**Reviewer:** User  
**Date:** 2026-02-06  
**Status:** ❌ NEEDS MAJOR REFACTORING

---

## 🚨 Critical Issues

### 1. Architecture Pattern Violation
**Severity:** CRITICAL  
**File:** `backend/src/controllers/connectionController.ts`

**Problem:**
- Created a `controller` directory/file which doesn't exist in this codebase
- Existing pattern is: `routes` → `services` → `models`
- Business logic is in controller instead of service layer

**Evidence:**
```
Existing structure:
routes/notes-route.ts → services/notes-service.ts → models/NOTES.ts
routes/boards-route.ts → services/boards-service.ts → models/BOARDS.ts

What I created (WRONG):
routes/connectionRoutes.ts → controllers/connectionController.ts → models/Connection.ts
                              ^^^^^^^^^^^ DOESN'T MATCH PATTERN
```

**Fix Required:**
1. Delete `backend/src/controllers/connectionController.ts`
2. Create `backend/src/services/connection-service.ts`
3. Move business logic to service
4. Update routes to call service functions

---

### 2. Model Naming Convention Violation
**Severity:** CRITICAL  
**File:** `backend/src/models/Connection.ts`

**Problem:**
- Model named `Connection.ts` (PascalCase)
- Existing convention: `NOTES.ts`, `BOARDS.ts`, `USER_PREFERENCES.ts` (UPPERCASE)

**Evidence:**
```bash
$ ls backend/src/models/
BOARDS.ts              # ✅ Correct
NOTES.ts               # ✅ Correct
USER_PREFERENCES.ts    # ✅ Correct
Connection.ts          # ❌ WRONG - doesn't match pattern
```

**Fix Required:**
1. Rename `Connection.ts` → `CONNECTIONS.ts`
2. Update all imports

---

### 3. Separation of Concerns Violation
**Severity:** HIGH  
**File:** `backend/src/controllers/connectionController.ts`

**Problem:**
Routes file should only handle:
- HTTP request/response
- Validation
- Transaction management
- Calling service functions

Instead, it has:
- Database queries directly in controller
- Business logic (duplicate checking, validation)
- Model imports and operations

**Example (WRONG):**
```typescript
// connectionController.ts
export const createConnection = async (req: Request, res: Response) => {
  // ❌ Database query in controller
  const [sourceCard, targetCard] = await Promise.all([
    Notes.findOne({ where: { id: sourceCardId, boardId } }),
    Notes.findOne({ where: { id: targetCardId, boardId } }),
  ]);
  
  // ❌ Business logic in controller
  const existingConnection = await Connections.findOne({...});
  
  // ❌ Creating model in controller
  const connection = await Connections.create({...});
};
```

**Should be (CORRECT):**
```typescript
// routes/connection-route.ts
router.post("/boards/:boardId/connections", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { sourceCardId, targetCardId, label } = req.body;
    
    // ✅ Validation only
    if (!sourceCardId || !targetCardId) {
      await transaction.rollback();
      return res.status(400).json({ error: '...' });
    }
    
    // ✅ Call service
    const result = await createConnection(
      { sourceCardId, targetCardId, boardId, label },
      { transaction }
    );
    
    await transaction.commit();
    res.status(201).json({ data: result });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: '...' });
  }
});

// services/connection-service.ts
export const createConnection = async (data, options) => {
  // ✅ Business logic in service
  // ✅ Database operations here
  // ✅ Validation logic here
};
```

---

### 4. File Naming Inconsistency
**Severity:** MEDIUM  
**File:** `backend/src/routes/connectionRoutes.ts`

**Problem:**
- Named `connectionRoutes.ts` (camelCase)
- Existing convention: `notes-route.ts`, `boards-route.ts` (kebab-case)

**Fix Required:**
Rename `connectionRoutes.ts` → `connection-route.ts`

---

### 5. Export Pattern Inconsistency
**Severity:** MEDIUM  
**File:** `backend/src/routes/connectionRoutes.ts`

**Problem:**
```typescript
export default router;  // ❌ Default export
```

**Existing pattern:**
```typescript
export const router = express.Router();  // ✅ Named export
```

**Fix Required:**
Change to named export: `export const connectionRouter = express.Router();`

---

### 6. Import Pattern Inconsistency
**Severity:** MEDIUM  
**File:** `backend/src/index.ts`

**Problem:**
```typescript
import connectionRoutes from "./routes/connectionRoutes";  // ❌ Default import
app.use("/api", connectionRoutes);
```

**Existing pattern:**
```typescript
import { router } from "./routes/notes-route";
import { boardsRouter } from "./routes/boards-route";
app.use("/api", router);
app.use("/api", boardsRouter);
```

**Fix Required:**
```typescript
import { connectionRouter } from "./routes/connection-route";
app.use("/api", connectionRouter);
```

---

### 7. Model Class Naming
**Severity:** LOW  
**File:** `backend/src/models/Connection.ts` (should be CONNECTIONS.ts)

**Problem:**
```typescript
export default class Connections extends Model {...}  // Class name is plural
```

**Existing pattern:**
```typescript
// models/NOTES.ts
export default class Notes extends Model {...}  // ✅ Plural

// models/BOARDS.ts  
export default class Boards extends Model {...}  // ✅ Plural
```

**Status:** Actually this is CORRECT! Just noting for completeness.

---

## ✅ What's Good

1. **TypeScript Types:** Proper use of `InferAttributes`, `InferCreationAttributes`
2. **Field Naming:** Follows UPPERCASE convention (SOURCECARDID, TARGETCARDID)
3. **Foreign Keys:** Proper CASCADE delete setup
4. **Migration:** Well-structured with indexes and constraints
5. **Documentation:** Good comments explaining purpose
6. **Validation Logic:** Good checks (same card, duplicate, existence)
7. **Error Handling:** Proper HTTP status codes

---

## 📋 Refactoring Checklist

### Must Fix (Critical):
- [ ] Delete `backend/src/controllers/` directory
- [ ] Rename `models/Connection.ts` → `models/CONNECTIONS.ts`
- [ ] Create `services/connection-service.ts` with business logic
- [ ] Refactor routes to match `notes-route.ts` pattern
- [ ] Move all database operations to service layer
- [ ] Add transaction support (like notes-route)
- [ ] Fix import/export patterns

### Should Fix (High Priority):
- [ ] Rename `connectionRoutes.ts` → `connection-route.ts`
- [ ] Change to named export pattern
- [ ] Update index.ts imports
- [ ] Add retry logic (using `withRetry` helper)
- [ ] Match error response format to existing APIs

### Nice to Have (Low Priority):
- [ ] Add JSDoc comments to service functions
- [ ] Consider adding connection validation rules to service
- [ ] Add logging consistent with other services

---

## 🔧 Recommended Refactoring Steps

### Step 1: Rename Model
```bash
mv backend/src/models/Connection.ts backend/src/models/CONNECTIONS.ts
```
Update model:
```typescript
// models/CONNECTIONS.ts
import Notes from './NOTES';
import Boards from './BOARDS';
```

### Step 2: Create Service Layer
```typescript
// services/connection-service.ts
import { CreationAttributes, Transaction } from "sequelize";
import Connections from "../models/CONNECTIONS";
import Notes from "../models/NOTES";
import { withRetry } from "../utils/retry";

export const createConnection = async (
  data: { sourceCardId: string; targetCardId: string; boardId: string; label?: string | null },
  options?: { transaction?: Transaction }
) => {
  // Validation: source and target must be different
  if (data.sourceCardId === data.targetCardId) {
    throw new Error('Cannot connect a card to itself');
  }

  // Validation: both cards must exist and belong to the same board
  const [sourceCard, targetCard] = await Promise.all([
    Notes.findOne({ where: { id: data.sourceCardId, boardId: data.boardId } }),
    Notes.findOne({ where: { id: data.targetCardId, boardId: data.boardId } }),
  ]);

  if (!sourceCard || !targetCard) {
    throw new Error('One or both cards not found on this board');
  }

  // Check for duplicate connection
  const existingConnection = await Connections.findOne({
    where: {
      sourceCardId: data.sourceCardId,
      targetCardId: data.targetCardId,
    },
  });

  if (existingConnection) {
    throw new Error('Connection already exists');
  }

  // Create the connection
  return await withRetry(async () => {
    return await Connections.create({
      sourceCardId: data.sourceCardId,
      targetCardId: data.targetCardId,
      boardId: data.boardId,
      label: data.label || null,
    }, options);
  });
};

export const getConnectionsByBoardId = async (boardId: string) => {
  return await withRetry(async () => {
    return await Connections.findAll({
      where: { boardId },
      include: [
        { model: Notes, as: 'sourceCard', attributes: ['id', 'content', 'positionX', 'positionY', 'type'] },
        { model: Notes, as: 'targetCard', attributes: ['id', 'content', 'positionX', 'positionY', 'type'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  });
};

export const getConnectionsByCardId = async (cardId: string) => {
  return await withRetry(async () => {
    return await Connections.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { sourceCardId: cardId },
          { targetCardId: cardId },
        ],
      },
      include: [
        { model: Notes, as: 'sourceCard', attributes: ['id', 'content', 'positionX', 'positionY', 'type'] },
        { model: Notes, as: 'targetCard', attributes: ['id', 'content', 'positionX', 'positionY', 'type'] },
      ],
    });
  });
};

export const deleteConnectionById = async (id: string, options?: { transaction?: Transaction }) => {
  const connection = await Connections.findByPk(id);
  if (!connection) {
    throw new Error('Connection not found');
  }
  return await withRetry(async () => {
    return await connection.destroy(options);
  });
};
```

### Step 3: Create Route Layer
```typescript
// routes/connection-route.ts
import express from "express";
import { sequelize } from "../config/db";
import {
  createConnection,
  getConnectionsByBoardId,
  getConnectionsByCardId,
  deleteConnectionById,
} from "../services/connection-service";

export const connectionRouter = express.Router();

// Create connection
connectionRouter.post("/boards/:boardId/connections", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { boardId } = req.params;
    const { sourceCardId, targetCardId, label } = req.body;

    // Validation
    if (!sourceCardId || !targetCardId) {
      await transaction.rollback();
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Source and target card IDs are required' }
      });
    }

    const result = await createConnection(
      { sourceCardId, targetCardId, boardId, label },
      { transaction }
    );
    
    await transaction.commit();
    res.status(201).json({ data: result });
  } catch (error: any) {
    await transaction.rollback();
    console.error("❌ Error creating connection:", error);
    
    // Handle known errors
    if (error.message === 'Cannot connect a card to itself') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.message } });
    }
    if (error.message === 'One or both cards not found on this board') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    }
    if (error.message === 'Connection already exists') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: error.message } });
    }
    
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create connection' } });
  }
});

// Get connections by board
connectionRouter.get("/boards/:boardId/connections", async (req, res) => {
  try {
    const { boardId } = req.params;
    const connections = await getConnectionsByBoardId(boardId);
    res.json({ data: connections });
  } catch (error) {
    console.error("❌ Error fetching connections:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch connections' } });
  }
});

// Get connections by card
connectionRouter.get("/cards/:cardId/connections", async (req, res) => {
  try {
    const { cardId } = req.params;
    const connections = await getConnectionsByCardId(cardId);
    res.json({ data: connections });
  } catch (error) {
    console.error("❌ Error fetching card connections:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch card connections' } });
  }
});

// Delete connection
connectionRouter.delete("/connections/:id", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    await deleteConnectionById(id, { transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error: any) {
    await transaction.rollback();
    console.error("❌ Error deleting connection:", error);
    
    if (error.message === 'Connection not found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    }
    
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete connection' } });
  }
});
```

### Step 4: Update index.ts
```typescript
// index.ts
import { connectionRouter } from "./routes/connection-route";
app.use("/api", connectionRouter);
```

---

## 🎯 Summary

**Total Issues Found:** 7 (3 Critical, 1 High, 3 Medium)

**Recommendation:** 
DO NOT COMMIT in current state. Requires full refactoring to match existing architecture patterns.

**Estimated Refactoring Time:** 30-45 minutes

**Once Fixed:**
- Code will match existing patterns
- Proper separation of concerns
- Maintainable and consistent with codebase
- Ready for commit

---

**Next Steps:**
1. User approves refactoring plan
2. Execute refactoring steps 1-4
3. Test build
4. Review refactored code
5. Commit when user approves

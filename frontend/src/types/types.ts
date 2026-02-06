export type Note = {
  id: string;
  title?: string | null;
  content: string;
  type?: 'note' | 'idea' | 'plan';
  status?: 'active' | 'archived' | 'graduated';
  positionX: number;
  positionY: number;
  backgroundColor: string;
  textColor: string;
  boardId?: string | null;
  userId?: string | null;
  archivedAt?: string | null;
  zIndex?: number;
  createdAt?: string;
  updatedAt?: string;
};

// Story 3.1: Board type
export type Board = {
  id: string;
  name: string;
  userId?: string | null;
  lastOpenedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// Story 6.1: Connection type
export type Connection = {
  id: string;
  sourceCardId: string;
  targetCardId: string;
  boardId: string;
  label?: string | null;
  sourceCard?: Note;
  targetCard?: Note;
  createdAt?: string;
  updatedAt?: string;
};

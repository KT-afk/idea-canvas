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

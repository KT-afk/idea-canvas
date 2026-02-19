/**
 * Component: ConnectionLines
 * Story 6.4: Draw Connection Lines
 * 
 * SVG overlay that renders all connection lines for a board
 */

import { AnimatePresence } from 'framer-motion';
import { useConnections } from '../../hooks/useConnections';
import { ConnectionLine } from './ConnectionLine';

interface ConnectionLinesProps {
  boardId: string | null;
  zoom?: number; // Still needed for line thickness scaling
  onNavigateTo?: (positionX: number, positionY: number) => void; // Story 6.6: Navigate to connected card
}

export function ConnectionLines({ boardId, zoom = 1, onNavigateTo }: ConnectionLinesProps) {
  const { connections, deleteConnection } = useConnections(boardId);

  if (!boardId || connections.length === 0) {
    return null;
  }

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, // Behind cards
        overflow: 'visible',
        // No transform needed - SVG is inside BoardCanvas motion.div which already applies pan/zoom
      }}
    >
      {/* Enable pointer events for lines */}
      <g style={{ pointerEvents: 'auto' }}>
        <AnimatePresence>
          {connections.map((connection) => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              onDelete={deleteConnection}
              onNavigateTo={onNavigateTo}
              zoom={zoom}
            />
          ))}
        </AnimatePresence>
      </g>
    </svg>
  );
}

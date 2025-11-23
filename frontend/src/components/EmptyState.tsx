import { Button } from "./Button";

export function EmptyState({ onAdd }: Readonly<{ onAdd: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-300">
        <div className="bg-white rounded-lg shadow-lg p-8 w-80 text-center">
            <div className="flex flex-col items-center gap-4">
                <div className="text-gray-400 text-5xl">🗒</div>"
                <h2 className="text-xl font-semibold text-gray-800">No notes created yet...</h2>
                <p className="text-sm text-gray-600">Create your first sticky note to get started.</p>
                <Button onClick={onAdd}>+</Button>
            </div>
        </div>
    </div>
  );
}

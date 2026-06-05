import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { loadTargetOrder, saveTargetOrder, type TargetId } from '@/lib/sidebarOrder';
import { SortableTargetItem } from './SortableTargetItem';

export function SortableTargetList() {
  const [items, setItems] = useState<TargetId[]>(DEFAULT_ORDER);

  useEffect(() => {
    setItems(loadTargetOrder());
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((current) => {
        const oldIndex = current.indexOf(active.id as TargetId);
        const newIndex = current.indexOf(over?.id as TargetId);
        const newOrder = arrayMove(current, oldIndex, newIndex);
        saveTargetOrder(newOrder);
        return newOrder;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {items.map((id) => (
            <SortableTargetItem key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

const DEFAULT_ORDER: TargetId[] = ['hermes', 'claude-code', 'codex', 'openclaw'];

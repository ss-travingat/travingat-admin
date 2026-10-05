import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LoadedImage from "./LoadedImage";
import { getOptimizedMediaUrl, toLandingAssetUrl } from "@/lib/landing-assets";

interface SortableItemProps {
  id: string; // we'll use the URL as ID
  url: string;
  index: number;
  isCover: boolean;
  onRemove: (idx: number) => void;
  onSetCover?: (url: string) => void;
  onClick?: (idx: number) => void;
  countryCode?: string;
}

function SortableItem({
  id,
  url,
  index,
  isCover,
  onRemove,
  onSetCover,
  onClick,
  countryCode,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const isVideo = /\.(mp4|mov|webm|m4v)$/i.test(url);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl overflow-hidden aspect-[4/3] bg-[#12161f] border transition-all ${
        isCover ? "border-[#5A45F9] shadow-[0_0_15px_rgba(90,69,249,0.2)]" : "border-[#1c212c]"
      } ${isDragging ? "opacity-70 scale-105 shadow-2xl" : "hover:border-white/20"}`}
    >
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => onClick?.(index)}
      >
        {isVideo ? (
          <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          </div>
        ) : (
          <LoadedImage
            src={toLandingAssetUrl(url)}
            thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(url))}
            alt="Media"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

      {/* Drag handle */}
      <div
        className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-white/70 hover:text-white z-20"
        {...attributes}
        {...listeners}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </div>

      {isCover && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#5A45F9] text-[10px] font-bold tracking-wider uppercase text-white shadow-lg pointer-events-none z-20">
          Cover
        </div>
      )}

      {countryCode && (
        <div className="absolute top-2 right-2 z-20" style={{ right: isCover ? '4rem' : '0.5rem' }}>
          <img
            src={`/flags/${countryCode.toUpperCase()}.svg`}
            alt={countryCode}
            className="h-3.5 w-5 rounded-sm object-cover drop-shadow-md"
          />
        </div>
      )}

      {/* Actions */}
      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-20">
        {onSetCover ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSetCover(url); }}
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
          >
            {isCover ? "Cover Selected" : "Set Cover"}
          </button>
        ) : <div />}
        
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(index); }}
          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-100 transition-colors backdrop-blur-md"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </button>
      </div>
    </div>
  );
}

interface SortableImageGridProps {
  images: (string | { url: string; countryCode?: string })[];
  coverPhoto?: string;
  onReorder: (newImages: (string | { url: string; countryCode?: string })[]) => void;
  onRemove: (idx: number) => void;
  onSetCover?: (url: string) => void;
  onImageClick?: (idx: number) => void;
}

export default function SortableImageGrid({
  images,
  coverPhoto,
  onReorder,
  onRemove,
  onSetCover,
  onImageClick,
}: SortableImageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(images, oldIndex, newIndex));
      }
    }
  };

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[4/1] rounded-xl border border-dashed border-[#1c212c] flex flex-col items-center justify-center text-white/30 gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        <p className="text-xs">No media uploaded yet.</p>
      </div>
    );
  }

  // Ensure unique IDs even if there are duplicate URLs (though unlikely in this context)
  const items = images.map((img, i) => {
    const url = typeof img === 'string' ? img : img.url;
    const countryCode = typeof img === 'string' ? undefined : img.countryCode;
    return { id: url, url, countryCode, index: i, raw: img };
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              url={item.url}
              countryCode={item.countryCode}
              index={item.index}
              isCover={item.url === coverPhoto}
              onRemove={onRemove}
              onSetCover={onSetCover}
              onClick={onImageClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

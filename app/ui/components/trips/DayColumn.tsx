'use client';
;
import { useDroppable } from '@dnd-kit/react';

export type Day = {
    id: string | number;
    name: string;
    date: string;
};

type DayColumnProps = {
    width: string;
    id: any;
    children: any,
};

export default function DayColumn({
    width,
    id,
    children,
}: DayColumnProps) {
    const { ref } = useDroppable({
        id,
        type: 'column',
        accept: 'item',
    });

    return (
        <div
            ref={ref}
            className="w-[var(--col-width)] mt-2 flex flex-col gap-2 shrink-0 min-h-[500px] bg-pink-50"
            style={
                {
                    '--col-width': width,
                } as React.CSSProperties
            }
        >
            {children}
        </div>
    );
}
'use client';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    width?: string;
    title?: string;
    children: React.ReactNode;
};

export default function Modal({
    isOpen,
    onClose,
    children,
    width,
    title
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className={`w-full ${width || 'max-w-lg'} max-h-[90vh] flex flex-col rounded-lg bg-white p-6 shadow-xl`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <div className="mb-4 flex shrink-0 items-center justify-between">
                    {title && (
                        <h2 className="text-lg font-semibold">{title}</h2>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>

                {/* Only this area scrolls */}
                <div className="min-h-0 flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

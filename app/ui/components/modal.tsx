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
                className={`w-full ${width || 'max-w-lg'} rounded-lg bg-white p-6 shadow-xl`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <div className="mb-4 flex justify-between items-center">
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

                {/* Modal content */}
                {children}
            </div>
        </div>
    );
}

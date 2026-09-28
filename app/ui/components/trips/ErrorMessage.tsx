type ErrorMessageProps = {
    index: string;
    error: string;
};

export default function ErrorMessage({
    index,
    error,
}: ErrorMessageProps) {
    return (
        <p key={index} className="mt-1 text-sm text-red-500">
            {error}
        </p>
    );
}
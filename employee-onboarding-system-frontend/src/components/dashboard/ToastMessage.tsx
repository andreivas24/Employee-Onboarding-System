type Props = {
    type: 'success' | 'error';
    message: string;
};

function ToastMessage({ type, message }: Props) {
    return <div className={`toast toast-${type}`}>{message}</div>;
}

export default ToastMessage;
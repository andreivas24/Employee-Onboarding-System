type Props = {
    currentPage: number;
    totalPages: number;
    hasItems: boolean;
    onPrevious: () => void;
    onNext: () => void;
};

function DashboardPagination({
    currentPage,
    totalPages,
    hasItems,
    onPrevious,
    onNext,
}: Props) {
    if (!hasItems) {
        return null;
    }

    return (
        <div className="pagination">
            <button
                className="secondary-button"
                onClick={onPrevious}
                disabled={currentPage === 1}
            >
                Previous
            </button>

            <span>
                Page {currentPage} of {totalPages}
            </span>

            <button
                className="secondary-button"
                onClick={onNext}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
}

export default DashboardPagination;
import "./Pagination.css";

export default function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={`pagination-button ${
            currentPage === i + 1 ? "active" : ""
          }`}
          onClick={() => {
            onPageChange(i + 1);
          }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

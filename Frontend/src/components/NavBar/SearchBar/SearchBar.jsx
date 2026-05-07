import { useEffect, useRef, useState } from "react";
import { Form, Collapse, Row } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./SearchBar.css";
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";

export default function SearchBar() {
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    title: searchParams.get("title") || "",
    tags: searchParams.get("tags")?.split(",") || [],
    date: searchParams.get("date") || "",
    sortBy: searchParams.get("sortBy") || "date",
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchClick = () => {
    const params = new URLSearchParams();
    if (filters.title) params.set("title", filters.title);
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    if (filters.date) params.set("date", filters.date);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    params.set("page", "1");
    navigate({ pathname: "/search", search: params.toString() });
  };

  const handleResetClick = () => {
    setFilters({ title: "", tags: [], date: "", sortBy: "date" });
    navigate("/");
  };

  return (
    <div
      ref={wrapperRef}
      className="search-bar-wrapper position-relative"
      onFocus={() => setExpanded(true)}
    >
      <Form.Control
        type="text"
        placeholder="Cerca post..."
        onClick={() => setExpanded(true)}
        name="title"
        value={filters.title}
        onChange={handleChange}
        style={{ border: "0" }}
      />

      <Collapse in={expanded}>
        <div className="search-filters mt-2 bg-dark p-3 rounded shadow">
          <Form.Group className="mb-2">
            <Form.Label className="text-light">Data caricamento</Form.Label>
            <Form.Control
              type="date"
              value={filters.date}
              name="date"
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="text-light">Tag</Form.Label>
            <ReactTagInput
              tags={Array.isArray(filters.tags) ? filters.tags : []}
              onChange={(newTags) =>
                setFilters((prev) => ({ ...prev, tags: newTags }))
              }
              placeholder="Aggiungi un tag e premi invio"
            />
          </Form.Group>

          <Row className="sort-row align-items-center">
            <p className="sort-label">Ordina per</p>
            <select
              className="mm-select"
              value={filters.sortBy ?? "date"}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
            >
              <option value="date">Più recenti</option>
              <option value="upvote">Più upvotati</option>
              <option value="downvote">Più downvotati</option>
            </select>
          </Row>

          <div className="d-flex justify-content-end">
            <button className="btn btn-outline-light me-2" onClick={handleSearchClick}>
              Cerca
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleResetClick}
            >
              Reset
            </button>
          </div>
        </div>
      </Collapse>
    </div>
  );
}
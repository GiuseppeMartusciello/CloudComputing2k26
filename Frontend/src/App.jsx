import "./App.css";
import HomePage from "./components/HomePage/HomePages";
import Profile from "./components/Profile/Profile";
import { AuthProvider } from "./services/AuthContext";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import AppNavbar from "./components/NavBar/NavBar";
import Pagination from "./components/HomePage/Pagination/Pagination";
import LeftSidebar from "./components/LeftSideBar/LeftSidebar";
import {
  fetchPosts,
  searchPost,
  getTodayPosts,
  getMyUpvotedPosts,
  getMyPosts,
} from "./services/postService";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import CreatePostModal from "./components/NavBar/CreateModal/CreatePostModal";
import { Container, Row, Col } from "react-bootstrap";
import { handleApiError } from "./utility/handleApiError";
import "react-toastify/dist/ReactToastify.css";

function AppWrapper() {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const postsPerPage = 10;
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPostPage, setCurrentPostPage] = useState(1);
  const [currentLoadMode, setCurrentLoadMode] = useState("home");

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page")) || 1;
    setCurrentPostPage(pageParam);

    const path = location.pathname;
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (path === "/") loadPosts("home");
    else if (path === "/search") loadPosts("search");
    else if (path === "/profile") loadPosts("profile");
    else if (path === "/today") loadPosts("todayPosts");
    else if (path === "/my-upvotes") loadPosts("myUpvotes");
  }, [location.pathname, searchParams]);

  const loadPosts = async (mode = "home", resetPage = false) => {
    setLoading(true);
    setError(null);

    const pageParam = parseInt(searchParams.get("page")) || 1;
    const offset = resetPage ? 0 : (pageParam - 1) * postsPerPage;

    if (resetPage) {
      setCurrentPostPage(1);
      searchParams.set("page", "1");
      setSearchParams(searchParams);
    }

    setCurrentLoadMode(mode);

    try {
      let data;
      if (mode === "search") {
        const title = searchParams.get("title") || "";
        const tags = searchParams.get("tags")?.split(",") || [];
        const date = searchParams.get("date") || "";
        const sortBy = searchParams.get("sortBy") || "date";

        const isEmptySearch = !title && tags.length === 0 && !date;

        if (isEmptySearch) {
          const { posts, total } = await fetchPosts(postsPerPage, offset);
          data = posts;
          setTotalPosts(total);
        } else {
          const { posts, total } = await searchPost(
            { title, tags, date, sortBy },
            postsPerPage,
            offset
          );
          data = posts;
          setTotalPosts(total);
        }
      } else if (mode === "todayPosts") {
        data = await getTodayPosts();
        setTotalPosts(5);
      } else if (mode === "myUpvotes") {
        const { posts, total } = await getMyUpvotedPosts(postsPerPage, offset);
        data = posts;
        setTotalPosts(total);
      } else if (mode === "profile") {
        const { posts, total } = await getMyPosts(postsPerPage, offset);
        data = posts;
        setTotalPosts(total);
      } else {
        const { posts, total } = await fetchPosts(postsPerPage, offset);
        data = posts;
        setTotalPosts(total);
      }
      setPosts(data);
    } catch (err) {
      handleApiError(err,() => navigate("/"));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    setSearchParams(newParams);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#121317",
      }}
    >
      <AppNavbar
        onClick={() => setShowModal(true)}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <CreatePostModal
        showModal={showCreateModal}
        onClickClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePost}
      />

      <Container fluid className="homepage-container">
        <Auth showModal={showModal} onClickClose={() => setShowModal(false)} />

        {sidebarOpen && (
          <div
            className="mobile-sidebar-overlay d-md-none"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "180px",
              height: "100vh",
              backgroundColor: "#191a1e",
              zIndex: 1050,
              padding: "0px",
              overflowY: "auto",
            }}
          >
            <LeftSidebar setSidebarOpen={setSidebarOpen} />
          </div>
        )}

        <Row>
          <Col md={3} className="d-none d-md-flex justify-content-center">
            <LeftSidebar setSidebarOpen={setSidebarOpen} />
          </Col>

          <Col xs={12} md={6} className="d-flex flex-column align-items-center">
            {loading && <p>Caricamento in corso...</p>}
            {error && <p>Errore: {error}</p>}
            {!loading && !error && (
              <>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <HomePage
                        posts={posts}
                        setPosts={setPosts}
                        onClickNotLogged={() => setShowModal(true)}
                      />
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <HomePage
                        posts={posts}
                        setPosts={setPosts}
                        onClickNotLogged={() => setShowModal(true)}
                      />
                    }
                  />
                  <Route
                    path="/today"
                    element={
                      <HomePage
                        posts={posts}
                        setPosts={setPosts}
                        onClickNotLogged={() => setShowModal(true)}
                      />
                    }
                  />
                  <Route
                    path="/my-upvotes"
                    element={
                      <HomePage
                        posts={posts}
                        setPosts={setPosts}
                        onClickNotLogged={() => setShowModal(true)}
                      />
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                        <div style={{ maxWidth: "800px", padding: "0px 30px" }}>
                          <Profile />
                          <hr
                            className="my-4"
                            style={{ borderColor: "#444" }}
                          />
                          <h5 className="text-light mb-3">I miei Post</h5>
                          <HomePage
                            posts={posts}
                            setPosts={setPosts}
                            onClickNotLogged={() => setShowModal(true)}
                          />
                        </div>

                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                {totalPosts > postsPerPage && (
                  <div className="mt-4">
                    <Pagination
                      totalItems={totalPosts}
                      itemsPerPage={postsPerPage}
                      currentPage={currentPostPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWrapper />
        <ToastContainer position="bottom-center" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

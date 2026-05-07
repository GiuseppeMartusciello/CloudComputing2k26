import "./PostCard.css";
import { IoThumbsDownOutline, IoThumbsUpOutline } from "react-icons/io5";
import { GoComment } from "react-icons/go";
import { createOrUpdateVote } from "../../services/voteService";
import {
  fetchComments,
  postComment,
  deleteComment,
} from "../../services/commentService";
import { getPostById, deletePost } from "../../services/postService";
import { useAuth } from "../../services/AuthContext";
import { useState } from "react";
import { IoPerson, IoTrashOutline } from "react-icons/io5";
import { handleApiError } from "../../utility/handleApiError";
import { FaUserCircle } from "react-icons/fa";

export default function PostCard({
  postId,
  title,
  author,
  date,
  imageUrl,
  tags,
  likes,
  dislikes,
  commentsCount,
  userVote,
  onUpdate,
  onClickNotLogged,
  onDeletePost,
}) {
  const { user, isLoggedIn } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleToggleComments = async () => {
    if (!showComments) {
      setLoading(true);
      try {
        const data = await fetchComments(postId);
        setComments(data);
      } catch (err) {
        handleApiError(err, onClickNotLogged);
      } finally {
        setLoading(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleVote = async (postId, type) => {
    try {
      await createOrUpdateVote(postId, type);
      const updatedPost = await getPostById(postId);
      onUpdate(updatedPost);
    } catch (err) {
      handleApiError(err, onClickNotLogged);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await postComment(postId, newComment);
      const updatedPost = await getPostById(postId);
      onUpdate(updatedPost);
      const commentsUpdates = await fetchComments(postId);
      setComments(commentsUpdates);
      setNewComment("");
    } catch (err) {
      handleApiError(err, onClickNotLogged);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare questo contenuto?"
    );
    if (!confirmed) return;

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      const updatedPost = await getPostById(postId);
      onUpdate(updatedPost);
    } catch (err) {
      handleApiError(err, onClickNotLogged);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare questo contenuto?"
    );
    if (!confirmed) return;

    try {
      await deletePost(postId);
      onDeletePost(postId);
    } catch (err) {
      handleApiError(err, onClickNotLogged);
    }
  };

  return (
    <div className="post-card">
      {author === user?.username && (
        <button
          className="delete-button-floating"
          onClick={() => handleDeletePost(postId)}
          title="Elimina Post"
        >
          <IoTrashOutline />
        </button>
      )}
      <div className="post-header">
        <div className="title">{title}</div>

        <div className="post-meta-row">
          <div className="author-info">
            <FaUserCircle className="avatar" />
            
            <div className="meta">
              {author} · {new Date(date).toLocaleString()}
            </div>
          </div>

          <div className="post-tags">
            {tags.map((tag, i) => (
              <span key={i} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="post-image">
        <img src={imageUrl} alt="blurred bg" className="post-image-bg" />
        <img src={imageUrl} alt={title} className="post-image-foreground" />
      </div>

      <div className="post-footer">
        <div
          className={`action ${userVote === "UP" ? "selected" : ""}`}
          onClick={() => {
            if (isLoggedIn) handleVote(postId, "UP");
            else onClickNotLogged();
          }}
        >
          <span>
            <IoThumbsUpOutline />
          </span>{" "}
          {likes}
        </div>
        <div
          className={`action ${userVote === "DOWN" ? "selected" : ""}`}
          onClick={() => {
            if (isLoggedIn) handleVote(postId, "DOWN");
            else onClickNotLogged();
          }}
        >
          <span>
            <IoThumbsDownOutline />
          </span>{" "}
          {dislikes}
        </div>
        <div className="action" onClick={handleToggleComments}>
          <span>
            <GoComment />
          </span>{" "}
          {commentsCount}
        </div>
      </div>
      {showComments && (
        <div className="comments-section">
          {loading ? (
            <p>Caricamento commenti...</p>
          ) : commentsCount === 0 ? (
            <p>Nessun commento disponibile.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-icon">
                    <IoPerson />
                  </span>
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {comment.author === user?.username && (
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Elimina commento"
                    >
                      <IoTrashOutline />
                    </button>
                  )}
                </div>

                <div className="comment-body">{comment.text}</div>
              </div>
            ))
          )}

          
          <div className="new-comment">
            <textarea
              placeholder="Scrivi un commento..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={() => {
                if (isLoggedIn) handleSubmitComment();
                else onClickNotLogged();
              }}
            >
              Invia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

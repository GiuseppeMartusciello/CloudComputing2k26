import PostCard from "./PostCard";

export default function HomePage({
  posts,
  setPosts,
  onClickNotLogged,
}) {

  const handleUpdatePost = (updatedPost) => {
    setPosts((postsList) =>
      postsList.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handleDeletePost = (deletedPostId) => {
    setPosts((postsList) =>
      postsList.filter((post) => post.id !== deletedPostId)
    );
  };

  return (
    <div style={{ width: "100%", maxWidth: "750px" }}>
      {posts.length === 0 ? (
        <h2 style={{ color: "white", paddingTop: '10%' }}>Nessun elemento trovato</h2>
      ) : (posts.map((post) => (
        <PostCard
          key={post.id}
          postId={post.id}
          title={post.title}
          author={post.author}
          date={post.createdAt}
          imageUrl={post.imageUrl}
          tags={post.tags}
          likes={post.upvote}
          dislikes={post.downvote}
          commentsCount={post.commentsCount}
          userVote={post.userVote}
          onUpdate={handleUpdatePost}
          onClickNotLogged={onClickNotLogged}
          onDeletePost={handleDeletePost}
        />
      ))
      )}
    </div>
  );
}

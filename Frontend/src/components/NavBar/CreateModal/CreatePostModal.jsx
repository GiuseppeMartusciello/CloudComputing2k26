import "./CreatePostModal.css";
import "@pathofdev/react-tag-input/build/index.css";
import { useEffect, useState } from "react";
import logo from "../../../assets/logo.png";
import { createPost } from "../../../services/postService";
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";

export default function CreatePostModal({ showModal, onClickClose, onCreate }) {
  if (!showModal) return null;
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const imagePreviewUrl = image ? URL.createObjectURL(image) : null;

  useEffect(() => {
    if (showModal) {
      setTitle("");
      setTags([]);
      setImage(null);
    }
  }, [showModal]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleCreate = async () => {
    if (!validate()) {
      console.log("Errore: ", errors);
      return;
    }

    try {
      const newPost = await createPost({
        title,
        tags: tags,
        imageFile: image,
      });

      onCreate(newPost);
      alert("Post creato con successo!");
      onClickClose();
    } catch (err) {
      console.error(err);
      alert("Errore nella creazione del post, ritenta");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Il titolo è obbligatorio.";
    } else if (title.length <= 4)
      newErrors.title = "Il titolo deve contenere almeno 5 caratteri.";

    if (!image) {
      newErrors.image = "Devi selezionare un'immagine.";
    }

    if (tags.length > 0) {
      if (tags.length > 4) {
        newErrors.tags = "Puoi inserire al massimo 4 tag.";
      } else {
        const invalidTag = tags.find((tag) => !/^[a-zA-Z0-9\s]+$/.test(tag));
        if (invalidTag) {
          newErrors.tags =
            "I tag possono contenere solo lettere, numeri e spazi.";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="modal-overlay" onClick={onClickClose}>
      <div className="modal-horizontal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-left">
          <input
            type="file"
            accept="image/*"
            required
            onChange={handleImageChange}
            className="image-input"
          />
          {imagePreviewUrl && (
            <img
              src={imagePreviewUrl}
              alt="Anteprima"
              className="image-preview"
            />
          )}
          {errors.image && <p className="input-error">{errors.image}</p>}
        </div>

        <div className="modal-right">
          <img src={logo} alt="Logo" className="modal-logo" />
          <h2>Nuovo Post</h2>

          <input
            type="text"
            placeholder="Titolo"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <p className="input-error">{errors.title}</p>}

          <ReactTagInput
            tags={tags}
            onChange={(newTags) => setTags(newTags)}
            placeholder="Aggiungi un tag e premi invio"
          />
          {errors.tags && <p className="input-error">{errors.tags}</p>}

          <div className="modal-actions">
            <button onClick={() => handleCreate()}>Crea</button>
            <button onClick={onClickClose}>Annulla</button>
          </div>
        </div>
      </div>
    </div>
  );
}

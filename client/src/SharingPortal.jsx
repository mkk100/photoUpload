import "./App.css";
import { useState } from "react";
import { useEffect } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const socket = io.connect("https://photo-upload-api.vercel.app/");
export default function SharingPortal() {
  const [images, setImages] = useState([]);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const handleImage = async (src) => {
      const newImage = { src, id: uuidv4() }; // Create new image object with ID
      setImages((images) => [...images, newImage]); // Update state with new image data
    };
    socket.on("sentImg", handleImage);
    socket.on("updated", async (data) => {
      setImages([]);
      setImages([...data]);
      setDel(false);
    });
    return () => {
      socket.off("sentImg", handleImage);
    };
  }, []); // Empty dependency array to run useEffect only once
  useEffect(() => {
    if (del) {
      socket.emit("del_image", images);
    }
  }, [del]);
  const deleteImage = (id) => {
    const filteredImages = images.filter((image) => image.id !== id);
    setImages(filteredImages);
    setDel(true);
  };
  const sendImage = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        socket.emit("submitImg", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const downloadAllImages = async () => {
    for (const image of images) {
      const { src, id } = image; // Destructure src and id (if available)
      const filename = id
        ? `${id}.${src.split(".").pop()}`
        : `image_${images.indexOf(image) + 1}.${src.split(".").pop()}`; // Generate unique filenames

      await downloadImage(src, filename);
    }
  };
  const downloadImage = async (src, filename) => {
    const response = await fetch(src);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = blob;
    link.click();
  };
  return (
    <div className="outershell">
      <input id="files" type="file" onChange={sendImage} multiple />
      <div>
        {/* Image Gallery with Delete Buttons */}
        {images.length > 0 && (
          <div className="image-gallery">
            <div>{images.user}</div>
            {images.map((image) => (
              <div key={image.id}>
                <img
                  src={image.src}
                  alt="Received Image"
                  id={image.id}
                  className="images"
                />
                <button onClick={() => deleteImage(image.id)} className="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <a onClick={downloadAllImages} className="download">
        Download All
      </a>
    </div>
  );
}

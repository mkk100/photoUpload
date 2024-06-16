import "./App.css";
import { useState } from "react";
import { useEffect } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const socket = io.connect("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);
  const [images, setImages] = useState([]);
  const [del, setDel] = useState(false);
  const sendMessage = async () => {
    await socket.emit("send_message", { message });
    setMessageReceived([...messageReceived, message]);
  };
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageReceived([...messageReceived, data.message]);
    });

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

  return (
    <div className="outershell">
      <input id="files" type="file" onChange={sendImage} multiple />
      <div>
        {/* Display received messages */}
        {messageReceived && (
          <div>
            {messageReceived.map((message) => (
              <h1>{message}</h1>
            ))}
          </div>
        )}
        {/* Image Gallery with Delete Buttons */}
        {images.length > 0 && (
          <div className="image-gallery">
            {images.map((image) => (
              <div key={image.id}>
                <img
                  src={image.src}
                  alt="Received Image"
                  id={image.id}
                  class="images"
                />
                <button onClick={() => deleteImage(image.id)}>
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
    </div>
  );
}

export default App;

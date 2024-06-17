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
  const [user, setUser] = useState("");
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
    socket.on("username", (data) => {
      setUser(data);
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
  const setuser = () => {
    socket.emit("sendUser", document.getElementById("user").value);
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
    link.download = filename;
    link.click();
  };

  return (
    <div className="outershell">
      <input id="user" type="text" placeholder="username" />
      <button id="button" onClick={() => setuser()}>
        Submit
      </button>
      <input id="files" type="file" onChange={sendImage} multiple />
      <div>
        {/* Image Gallery with Delete Buttons */}
        {images.length > 0 && user && (
          <div className="image-gallery" id={user === images[-1]}>
            <div>{user}</div>
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
      <a onClick={downloadAllImages}>Download</a>
    </div>
  );
}

export default App;

import "./App.css";
import React, { useState } from "react";
import io from "socket.io-client";
const socket = io.connect("http://localhost:3001");

function App() {
  const [selectedImages, setSelectedImages] = useState([]);

  // Function to handle file selection
  const handleFileChange = (event) => {
    const newImages = Array.from(event.target.files); // Convert FileList to array
    setSelectedImages((prevImages) => [...prevImages, ...newImages]); // Update state with new and previous selections
  };

  // Function to handle sending selected images
  const sendImages = () => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Send each image data to the server (replace with your server-side logic)
      socket.emit("send_images", e.target.result); // Send image data as base64 string (adjust based on server implementation)
    };

    // Loop through selected images and read them one by one
    selectedImages.forEach((image) => {
      reader.readAsDataURL(image);
    });
  };

  return (
    <div className="outershell">
      <h1>PhotoUpload (Multiple)</h1>
      {selectedImages.length > 0 && (
        <div>
          {/* Display selected images */}
          {selectedImages.map((image) => (
            <img
              key={image.name} // Add a unique key for each image
              alt="not found"
              width={"250px"}
              src={URL.createObjectURL(image)}
            />
          ))}
          <br /> <br />
          {/* Button to remove all selected images */}
          <button onClick={() => setSelectedImages([])}>Remove All</button>
        </div>
      )}

      <br />
      <input
        type="file"
        multiple
        name="myImages" // Change name to plural
        onChange={handleFileChange}
      />
      <button onClick={sendImages}>Upload Images</button>
    </div>
  );
}

export default App;

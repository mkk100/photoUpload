import "./App.css";
import { useState } from "react";
import { useEffect } from "react";
import io from "socket.io-client";
import { useRef } from "react";
const socket = io.connect("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const input = document.getElementById("inp");
  const [fileSelected, setFileSelected] = useState([]);
  const [messageReceived, setMessageReceived] = useState([]);
  const [imageReceived, setImageReceived] = useState([]);
  const sendMessage = async () => {
    await socket.emit("send_message", { message: input.value });
    setMessageReceived([...messageReceived, input.value]);
  };
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageReceived([...messageReceived, data.message]);
    });

    const handleImage = (src) =>{
      // Create Img...
      var img = document.createElement('img')
      img.src = src
      img.width = 200
      img.height = 200
      document.querySelector('div').append(img)
    }
    socket.on('sentImg',handleImage)
    return () =>{
      socket.off('sentImg',handleImage)
    }
  });
  const sendImage = async (e) => { // make this thing accept multiple inputs and send out multiple inputs
    console.log(e.target.files)
    if (e.target.files.length <= 0) return;
    for (const file of e.target.files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        socket.emit("submitImg", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="outershell">
      <input
        type="text"
        placeholder="Message"
        id="inp"
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <input type="file" multiple id="img" onChange= {sendImage} /> Upload
        <div>
          {messageReceived && (
            <div>
              {messageReceived.map((message) => {
                return <h1>{message}</h1>;
              })}
            </div>
          )}
        </div>
    </div>
  );
}

export default App;

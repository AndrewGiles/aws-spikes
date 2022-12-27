import { useEffect, useRef, useState } from "react"

const roomId = 15;
const webSocketBaseURL = import.meta.env.VITE_SOCKET_URL;
const searchParams = new URLSearchParams({
  roomId,
});

const ws = new WebSocket(`${webSocketBaseURL}?${searchParams.toString()}`);

function App() {

  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {

    const onOpen = e => console.log('opened');
    const onClose = e => console.log('closed');
    const onError = e => console.log('errored', e);
    const onMessage = e => console.log(e) || setMessages(messages => [...messages, JSON.parse(e.data).msg]);

    ws.addEventListener('open', onOpen);
    ws.addEventListener('close', onClose);
    ws.addEventListener('error', onError);
    ws.addEventListener('message', onMessage);

    return () => {
      ws.removeEventListener('open', onOpen);
      ws.removeEventListener('close', onClose);
      ws.removeEventListener('error', onError);
      ws.removeEventListener('message', onMessage);
    }
  }, []);

  const handleSend = () => {
    ws.send(JSON.stringify({
      roomId,
      action: 'message',
      msg: inputRef.current.value,
    }))
    inputRef.current.value = '';
  }

  return (
    <div className="absolute inset-0 bg-sky-200 flex items-center justify-center p-16">
      <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg">
        <div className="p-2 text-xl border-b">Chat App</div>
        <div className="p-2 flex-grow overflow-auto">
          {messages.map((message, i) => (
            <div key={i}>{message}</div>
          ))}
        </div>
        <div className="flex">
          <input
            className="h-full p-1 flex-grow border"
            ref={inputRef}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button className="px-4 py-2 bg-blue-300 hover:bg-blue-400"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div >
  )
}

export default App

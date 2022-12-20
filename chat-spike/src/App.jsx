import { useEffect, useRef, useState } from "react"

const GAME_ID = 15;
const webSocketBaseURL = import.meta.env.VITE_SOCKET_URL;
const searchParams = new URLSearchParams({
  gameId: GAME_ID,
});

const ws = new WebSocket(`${webSocketBaseURL}?${searchParams.toString()}`);

function App() {
  
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  
  useEffect(() => {

    const onOpen = e => console.log('opened');
    const onClose = e => console.log('closed');
    const onError = e => console.log('errored', e);
    const onMessage = e => console.log(e) || setMessages(messages => [...messages, JSON.parse(e.data).message]);

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

  }, [])

  return (
    <div className="absolute inset-0 bg-sky-200 flex items-center justify-center">
      <div className="w-1/2 min-w-fit h-2/3 flex flex-col bg-white rounded-lg shadow-lg">
        <div className="flex-grow overflow-auto">
          {messages.map((message, i) => (
            <div key={i}>{message}</div>
          ))}
        </div>
        <div className="flex">
          <input className="h-full p-1 flex-grow border" ref={inputRef} />
          <button className="px-4 py-2 bg-blue-300 hover:bg-blue-400"
            onClick={() => {
              ws.send(JSON.stringify({
                action: 'message',
                msg: inputRef.current.value,
              }));
              // ws.send(JSON.stringify({
              //   action: 'dispatch',
              //   type: 'ATTACK',
              //   payload: {
              //     direction: 'LEFT',
              //     x: 3,
              //     y: 2,
              //   },
              // }))
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div >
  )
}

export default App

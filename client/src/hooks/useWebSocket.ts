// import { useEffect, useRef, useState } from "react";
// import type { Request } from '../types/Request.ts';

// export function useWebSocket(url: string, endpoint: string) {
//   const ws = useRef<WebSocket | null>(null);
//   const [newRequest, setNewRequest] = useState<Request | null>(null);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     ws.current = new WebSocket(url);
    

//     ws.current.onopen = () => {
//       console.log("WebSocket connected");
//       ws.current?.send(JSON.stringify({ token: `Bearer ${localStorage.getItem(`basket_${endpoint}`)}`}));
//       setConnected(true);
//     };

//     ws.current.onmessage = async (event) => {
//       let newRequest = JSON.parse(event.data);
//       console.log("new request", newRequest);
//       setNewRequest(newRequest);
//     };

//     ws.current.onclose = () => {
//       console.log("WebSocket disconnected");
//       setConnected(false);
//     };

//     ws.current.onerror = (err) => {
//       console.error("WebSocket error", err);
//     };

//     return () => {
//       ws.current?.close();
//       ws.current = null;
//     };
//   }, []);

//   const sendMessage = (msg: string) => {
//     if (ws.current?.readyState === WebSocket.OPEN) {
//       ws.current.send(msg);
//     }
//   };

//   return { newRequest, sendMessage, connected };
// }
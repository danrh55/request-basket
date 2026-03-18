import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import RequestList from './RequestList.tsx';
import type { Request } from '../types/Request.ts';
// import { useWebSocket } from '../hooks/useWebSocket';

export default function Basket() {
  const [requests, setRequests] = useState<Array<Request>>([]);
  let { url } = useParams();
  const sseConnection = useRef<EventSource | null> (null);
  // const { newRequest } = useWebSocket(`/ws/baskets/${url}`, url!);

  // function handleNewRequest() {
  //   if (newRequest) setRequests([...requests, newRequest]);
  // }

  // useEffect(handleNewRequest, [newRequest]);

  function initiateSSEConnection() {
    const webhookEventSource = new EventSource(`/api/webhook/${url}`);

    webhookEventSource.onopen = (_e) => {
      console.log("SSE connection established");
    }

    webhookEventSource.onmessage = (e) => {
      const newRequest = JSON.parse(e.data);
      setRequests(prev => [...prev, newRequest]);
    }

    return webhookEventSource;
  }

  function getRequests() {
    (async () => {
      try {
        let response = await fetch(`/api/baskets/${url}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(`basket_${url}`)}`,
          }
        });
        if (response.ok) {
          let requests = await response.json();
          setRequests(requests);
        } else {
          let { error } = await response.json();
          console.error(error);
        }
      } catch (e: Error | unknown) {
        if (e instanceof Error) {
          console.error(e)
        }
      }
    })();

    sseConnection.current = initiateSSEConnection();
  }

  useEffect(getRequests, []);
  
  async function handleClearBasket() {
    let options = {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(`basket_${url}`)}`,
      }
    };

    try {
      const response = await fetch(`/api/${url}/clear`, options);
      if (!response.ok) {
        const { error } = await response.json();
        console.error(error);
        return;
      } 
      
      const { deletedCount } = await response.json();
      console.log(`Deleted ${deletedCount} responses`);
      setRequests([]);
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  } 
  
  return (
    <div className="basket-container" id="basket">
      <h1 className="basket-title">Basket Name: {url}</h1>
      <div className="basket-list-wrapper">
        <RequestList requests={requests} />
      </div>
      <button onClick={handleClearBasket}
              style={{"backgroundColor": 'red'}}>
                Clear Basket
      </button>
      <Link onClick={() => {
          sseConnection.current?.close();
          console.log(`${url} SSE connection closed.`);
        }} className="back-link" to="/">Back</Link>
    </div>
  )
}
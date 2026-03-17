import type { Request, Response } from "express";
import { mongoModel } from "../models/mongoModel.js";
import { pgModel } from "../models/pgModel.js";
import type { RequestData } from "../types/requests.js";
// import { WebSocket } from "ws";

// const wsConnection = new Map();

const SSEConnection = new Map();

export const basketController = {
  // handleGetBaskets(req: Request, res: Response) {

  // },

  // handleRedirectToBaskets(req: Request, res: Response) {
  //   res.redirect("/baskets");
  // },

  // async createWsConnection(ws: WebSocket, req: Request) {
  //   const endpoint = req.params.endpoint as string;
  //   wsConnection.set(endpoint, ws);

  //   ws.on('message', async (msg) => {
  //     const { token } = JSON.parse(msg.toString());
  //     const sentToken = token?.replace('Bearer ', '');

  //     if (sentToken !== await pgModel.getBasketToken(endpoint)) {
  //       ws.send(JSON.stringify({ error: "Invalid token. Unauthorized access."}));
  //       ws.close();
  //       return;
  //     }
  //   });

  //   ws.on('close', () => {
  //     wsConnection.delete(endpoint);
  //   });
  // },

  handleSSERequest(req: Request<{ endpoint: string }>, res: Response) {
    const { endpoint } = req.params;
    const sentToken = req.headers.authorization?.replace('Bearer ', '');

    res.set({
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    });
    res.flushHeaders();

    SSEConnection.set(endpoint, res);

    req.on('close', () => {
      SSEConnection.delete(endpoint);
      console.log(`${endpoint} SSE connection closed.`);
    });
  },

  async handleGetBasketRequests(req: Request<{ endpoint: string }>, res: Response) {
    const { endpoint } = req.params;
    const sentToken = req.headers.authorization?.replace('Bearer ', '');

    if (sentToken === await pgModel.getBasketToken(endpoint)) {
      try {
        const requests = await mongoModel.getBasketRequests(endpoint);
        res.status(200).json(requests);
      } catch (e) {
        console.error(e);
        res.status(400).json({ error: "Failed to retrieve basket"});
      }
    } else {
      res.status(401).json({ error: "Invalid token. Unauthorized access."});
    }
  },

  async handleCreateNewBasket(req: Request<{ endpoint: string }>, res: Response) {
    const { endpoint } = req.body

    if (await pgModel.basketExists(endpoint)) {
        res.status(409).json({ error: "Endpoint already taken. Please choose another endpoint." });
    } else {
      try {
        const token = await pgModel.addNewBasket(endpoint);
        res.status(200).json({ [`basket_${endpoint}`]: token });
      } catch (e) {
        res.status(400).json({ error: "Basket could not be created." });
      }
    }
  },

  async handleWebhookRequest(req: Request<{ endpoint: string }>, res: Response) {
    const { endpoint } = req.params;
    const { method, headers, body } = req;
    const sentToken = req.headers.authorization?.replace('Bearer ', '');
    // const ws = wsConnection.get(endpoint);
    const sse = SSEConnection.get(endpoint)
   
    if (sentToken === await pgModel.getBasketToken(endpoint) && sse) {
      const data: RequestData = {
        endpoint,
        method,
        headers,
        body,
      };

      if (endpoint === 'favicon.ico') return;

      try {
        await mongoModel.addWebhookRequest(data);
        // ws.send(JSON.stringify(data));
        sse.write(`data: ${JSON.stringify(data)}\n\n`);
        res.status(200).json({ msg: "Webhook message received." });
      } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Webhook request failed.'});
      }
    } else {
      res.status(401).json({ error: "Invalid token. Unauthorized access." });
    }
  },

  async handleClearBasket(req: Request<{ endpoint: string }>, res: Response) {
    const { endpoint } = req.params;
    const sentToken = req.headers.authorization?.replace('Bearer ', '');

    if (sentToken === await pgModel.getBasketToken(endpoint)) {
      try {
        const { deletedCount } = await mongoModel.clearBasket(endpoint);
        res.status(200).json({ deletedCount });
      } catch (e) {
        res.status(400).json({ error: "Basket could not be cleared." });
      }
    } else {
      res.status(401).json({ error: "Invalid token. Unauthorized access." });
    }
  },
};

import { basketController } from "../controllers/basketController.js";
export function registerHttpRoutes(router) {
    // router.get("/baskets", basketController.handleGetBaskets);
    // router.get("/", basketController.handleRedirectToBaskets);
    router.get("/api/webhook/:endpoint", basketController.handleSSERequest);
    router.get("/api/baskets/:endpoint", basketController.handleGetBasketRequests);
    router.post("/api/baskets/create", basketController.handleCreateNewBasket);
    router.all("/api/:endpoint", basketController.handleWebhookRequest);
    router.put("/api/:endpoint/clear", basketController.handleClearBasket);
}
//# sourceMappingURL=httpRoutes.js.map
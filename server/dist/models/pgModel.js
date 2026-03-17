import { generateToken } from "../services/token.js";
import { pool } from "./dbConnection.js";
export const pgModel = {
    async addNewBasket(endpoint) {
        const token = generateToken(endpoint);
        const command = 'INSERT INTO baskets (basket_endpoint, token) VALUES ($1, $2)';
        try {
            await pool.query(command, [endpoint, token]);
            return token;
        }
        catch (e) {
            console.error(e);
            throw new Error('Failed to create a new basket.');
        }
    },
    async getBasketToken(endpoint) {
        const command = 'SELECT token FROM baskets WHERE basket_endpoint = $1;';
        try {
            const res = await pool.query(command, [endpoint]);
            return res.rows.length > 0 ? res.rows[0].token : null;
        }
        catch (e) {
            console.error(e);
            throw new Error('Query failed to retrieve a token for given endpoint.');
        }
    },
    async basketExists(endpoint) {
        try {
            const token = await this.getBasketToken(endpoint);
            return token !== null;
        }
        catch (e) {
            console.error(e);
            throw new Error("Something went wrong trying to retrieve basket token.");
        }
    },
};
//# sourceMappingURL=pgModel.js.map
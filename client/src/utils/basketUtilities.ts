import type { BasketToken } from "../types/Token";
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function createBasketName() {
  let result = '';

  for (let count = 0; count < 8; count++) {
    let randomIndex = Math.floor(Math.random() * 62);
    result += BASE62[randomIndex];
  }
  
  return result;
}

export function isValidBasketName(name: string) {
  // name must be between 8-25 chars and be alphanumeric
  const regex = /^[a-zA-Z0-9]{8,25}$/;
  return regex.test(name);
}

export function getBasketsFromStorage() {
  let tokens = Object.entries(localStorage).filter((entry: [string, string]) => {
    return /^basket_/.test(entry[0]);
  });

  let tokenArray = tokens.map((pair: [string, string]) => {
    let key: string = pair[0].replace('basket_', '');
    let value: string = pair[1];
    return Object.fromEntries([[key, value]]) as BasketToken;
  });

  return tokenArray;
}
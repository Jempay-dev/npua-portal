// A tiny in-browser "database" for the front-end-only stage.
// Data is kept in localStorage so changes survive a page refresh.
// Later every function here will be replaced by calls to the real backend.

import { useSyncExternalStore } from "react";
import { createSeed } from "./seed.js";

const STORAGE_KEY = "npua-data-v1";
const listeners = new Set();
let data = load();

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // storage blocked or broken → start from the demo data
  }
  return createSeed();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore: the site still works, it just won't remember changes
  }
}

function setData(next) {
  data = next;
  save();
  listeners.forEach((listener) => listener());
}

/* ---------- Reading ---------- */

export const getData = () => data;

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React hook: returns the whole database and re-renders when it changes. */
export function useData() {
  return useSyncExternalStore(subscribe, getData, getData);
}

/* ---------- Writing ---------- */

export const newId = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function addItem(collection, item) {
  setData({ ...data, [collection]: [...data[collection], item] });
}

export function updateItem(collection, id, changes) {
  setData({
    ...data,
    [collection]: data[collection].map((item) => (item.id === id ? { ...item, ...changes } : item)),
  });
}

export function removeItem(collection, id) {
  setData({ ...data, [collection]: data[collection].filter((item) => item.id !== id) });
}

/** Replace whole collections/values at once, e.g. setValues({ schedule: {...} }). */
export function setValues(changes) {
  setData({ ...data, ...changes });
}

/** Restore the original demo data. */
export function resetData() {
  setData(createSeed());
}

// src/globals.js
export let parser;
export let embedder;
export let db;
export let table;

export function setParser(newParser) {
    parser = newParser;
}

export function setEmbedder(newEmbedder) {
    embedder = newEmbedder;
}

export function setDb(newDb) {
    db = newDb;
}

export function setTable(newTable) {
    table = newTable;
}

const DB_NAME = "envDB";
const STORE_NAME = "variables";

export async function initializeIndexedDB(variables) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = function (event) {
      reject("Error opening IndexedDB");
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });

      store.transaction.oncomplete = function () {
        resolve("IndexedDB initialized");
      };
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      variables.forEach((variable) => {
        store.put(variable);
      });

      transaction.oncomplete = function () {
        db.close();
      };
    };
  });
}

export async function getAllVariablesFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = function (event) {
      reject("Error opening IndexedDB");
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.getAll();

      getRequest.onsuccess = function () {
        resolve(getRequest.result);
      };

      getRequest.onerror = function () {
        reject("Error retrieving data from IndexedDB");
      };

      transaction.oncomplete = function () {
        db.close();
      };
    };
  });
}

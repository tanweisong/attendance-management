import axios from "axios";

const url = "../api/table";

class TableService {
  static getTables(email) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.get(`${url}/${email}`);
        const data = res.data;

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  static createTables(oData) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.post(url, oData);
        const data = res.data;

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  static resetTable(oData) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.put(url + "/reset", oData);
        const data = res.data;

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  static searchTables(oData) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.post(url + "/search", oData);
        const data = res.data;

        resolve(data);
      } catch (error) {
        reject(err);
      }
    });
  }

  static updateTables(oData) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.put(url, oData);
        const data = res.data;

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default TableService;

import axios from "axios";

const url = "api/login";

class LoginService {
  static createLogin(email, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.post(url, {
          email,
          password
        });
        const data = res.data;

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  static getLogin(email) {
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

  static updateConfiguration(configuration) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.put(url, configuration);
        const data = res.data;

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default LoginService;

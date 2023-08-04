import axios from "axios";
import LocalStorage, { LocalStorageType } from "./LocalStorage";
import jwt_decode from "jwt-decode";

const FetchApi = axios.create({});

FetchApi.interceptors.request.use(
  async (config) => {
    const currentDate = new Date();
    const token = LocalStorage.loadData(LocalStorageType.TOKEN);
    if (token) {
      const decoded: any = jwt_decode(token);
      if (decoded.exp * 1000 < currentDate.getTime()) {
        try {
          const uri = `http://localhost:5000/users/token`;
          const result = await axios.get(uri, {
            withCredentials: true,
          });
          const newtoken = result.data.token;
          config.headers.Authorization = `Bearer ${newtoken}`;
          localStorage.setItem("token", newtoken);
          return config;
        } catch (error: any) {
          if (error.response.status == 401) {
            LocalStorage.removeData(LocalStorageType.TOKEN);

            return Promise.reject({
              status: 401,
              msg: `Error, ${error.response.data.msg}`,
            });
          }
          return Promise.reject(error);
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }
    }
    return Promise.reject({ status: 401, msg: "Your not login!" });
  },
  (error) => {
    return Promise.reject(error);
  }
);


export { FetchApi };

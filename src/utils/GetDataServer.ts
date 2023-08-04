import { FetchApi } from "./FetchApi";

interface IPut {
  data: object;
  id: string | number;
}

interface IData {
  // data: string;
  FIND: (options: IFindOption) => Promise<object>;
  FINDONE: (id: String) => Promise<any>;
  CREATE: (data: object) => Promise<any>;
  UPDATE: (data: IPut) => Promise<any>;
  DELETE: (id: string | number) => Promise<boolean>;
}

interface IFindOption {
  limit?: number;
  page?: number | String;
  fields?: String[];
  filters?: [String, String, String][];
  orderBy?: { state: String; sort: Number };
  search?: String;
  params?: String;
}

export enum DataAPI {
  SCHEDULE = "schedule",
  SCHEDULEITEM = "scheduleitem",
  WAREHOUSE = "warehouse",
  PACKING = "schedulepacking",
  PACKINGID = "packingid",
  USERS = "users",
  CHAT = "chat",
  MESSAGE = "message",
  WORKFLOW = "workflow",
  ROLEPROFILE = "roleprofile",
}

class RequestData implements IData {
  data: DataAPI;
  constructor(requestData: DataAPI) {
    this.data = requestData;
  }

  FIND = async (options: IFindOption): Promise<object> => {
    let fields: String = ``;
    let filters: String = ``;
    let orderBy: String = ``;
    let search: String = ``;
    let params: String = ``;

    try {
      if (options.fields) {
        fields = `&&fields=${JSON.stringify(options.fields)}`;
      }
      if (options.params) {
        params = `${options.params}`;
      }
      if (options.filters) {
        filters = `&&filters=${JSON.stringify(options.filters)}`;
      }
      if (options.search) {
        search = `&&search=${options.search}`;
      }

      if (options.orderBy) {
        orderBy = `&&order_by={"${options.orderBy.state}":${options.orderBy.sort}}`;
      }
      const uri = `${import.meta.env.VITE_PUBLIC_URI}/${
        this.data
      }${params}?limit=${options.limit ?? "0"}&page=${
        options.page ?? "0"
      }${fields}${filters}${orderBy}${search}`;
      const result: any = await FetchApi.get(uri);
      return result.data;
    } catch (error: any) {
      return Promise.reject(error);
    }
  };

  FINDONE = async (id: String): Promise<any> => {
    try {
      const uri = `${import.meta.env.VITE_PUBLIC_URI}/${this.data}/${id}`;
      const result: any = await FetchApi.get(uri);
      return result.data;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  CREATE = async (data: object): Promise<any> => {
    try {
      const uri = `${import.meta.env.VITE_PUBLIC_URI}/${this.data}`;
      const result = await FetchApi.post(uri, data);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  UPDATE = async (data: IPut): Promise<any> => {
    try {
      const uri = `${import.meta.env.VITE_PUBLIC_URI}/${this.data}/${data.id}`;
      const result = await FetchApi.put(uri, data.data);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  DELETE = async (id: String | number): Promise<any> => {
    try {
      const uri = `${import.meta.env.VITE_PUBLIC_URI}/${this.data}/${id}`;
      const result = await FetchApi.delete(uri);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

class GetDataServer {
  static ProsesData = (dataApi: DataAPI): IData => {
    return new RequestData(dataApi);
  };
}

export default GetDataServer.ProsesData;

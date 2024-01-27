import jwt_decode from "jwt-decode";


export enum LocalStorageType {
  TOKEN = "token",
  FILTERSCHEDULE = "filterschedule",
  FILTERCALLSHEET = "filtercallsheet",
  FILTERVISIT = "filtervisit",
  FILTERUSER = "filteruser",
  FILTERBRANCH = "filterbranch",
  FILTERCG = "fiterCustomer",
  FILTERCUSTOMER = "fiterCG",
  FILTERTAG = "fiterTags",
  FILTERCONTACT = "filtercontact",
  FILTERTOPIC = "filterTopic",
  FILTERPERMISSION = "filterpermission",
  FILTERMEMO = "filtermemo",
  FILTERNAMING = "filternaming",
  FILTERREPORTNOTE = "filterreportnotes",
  FILTERREPORTSCHEDULE = "reportschedule",
  FILTERWORKFLOWSTATE = "filterworkflowstate",
  FILTERWORKFLOWACTION = "filterworkflowaction",
  FILTERWAACCOUNT = "filterwaacount",
  FILTERASSESMENTSCHEDULE = "filterassesmentschedule",
  FILTERASSESMENT = "filterassesment",
  FILTERREPORTASSESMENT = "filterreportassesment",
  FILTERASSESMENTTEMPLATE = "filterassesmenttemplate",
  
}

class LocalStorage {
  public static loadData = (type: LocalStorageType): string | undefined => {
    try {
      const serializedState = localStorage.getItem(`${type}`);
      if (serializedState === null) {
        return undefined;
      }
      return serializedState;
    } catch (err) {
      return undefined;
    }
  };

  public static saveData = (type: LocalStorageType, state: string): void => {
    try {
      localStorage.setItem(`${type}`, state);
    } catch (err) {
    }
  };

  public static removeData = (type: LocalStorageType): void => {
    localStorage.removeItem(`${type}`);
  };

  public static  getUser = (): any => {
    const token = LocalStorage.loadData(LocalStorageType.TOKEN);
    if (token) {
      const decoded: any = jwt_decode(token);
      return decoded;
    }

    return {};
  };

}

export default LocalStorage;
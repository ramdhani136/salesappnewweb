import { useEffect, useRef, useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { InputComponent } from "../atoms";
import CloseIcon from "@mui/icons-material/Close";
import { LocalStorage, LocalStorageType } from "../../utils";
import { IInfiniteScroll, IListInput, IValue } from "../atoms/InputComponent";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";

export interface IDataFilter {
  name: String;
  alias: String;
  oprator: String;
  typeof: String;
  listData?: IListInput[];
  value: {
    valueData: any;
    valueInput: String;
  };
  infiniteData?: DataAPI;
}

export interface IFilter {
  name: {
    valueData: any;
    valueInput: String;
  };
  operator: {
    valueData: any;
    valueInput: String;
  };
  value: {
    valueData: any;
    valueInput: String;
  };
  listData?: IListInput[];
  loading?: boolean;
  infiniteScroll?: IInfiniteScroll | undefined;
  loadingMore?: boolean;
  hasMore?: boolean;
  page?: Number;
}

interface IProps {
  listFilter: IDataFilter[];
  filter: any[];
  setFilter: any;
  localStorage?: LocalStorageType;
}

const FilterTableComponent: React.FC<IProps> = ({
  listFilter,
  setFilter,
  localStorage,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [tableFilter, setTableFilter] = useState<IFilter[]>([]);

  const getValue = async (data: {
    endpoint: DataAPI;
    search?: string | String;
    refresh?: boolean;
    currentData: IListInput[];
  }): Promise<any> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }

      let isFilter: [String, String, String][] = [];

      if (data.endpoint !== DataAPI.WORKFLOWSTATE) {
        isFilter.push(["status", "!=", "0"]);
      }

      const result: any = await GetDataServer(data.endpoint).FIND({
        search: data.search ?? "",
        limit: 30,
        page: `${data.refresh ? 1 : 1}`,
        filters: isFilter,
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value:
              data.endpoint === DataAPI.WORKFLOWSTATE ? item.name : item._id,
            data: item,
          };
        });
        // setValueHasMore(result.hasMore);
        // setValuePage(result.nextPage);
        if (!data.refresh) {
          return [...data.currentData, ...listInput];
        } else {
          return [...listInput];
        }
      }

      // setValueLoading(false);
      // setValueMoreLoading(false);
    } catch (error: any) {
      return [];
      // setValueLoading(false);
      // setValueMoreLoading(false);
      // setValueHasMore(false);
    }
  };

  // const ResetValue = () => {
  //   setListValue([]);
  //   setValueHasMore(false);
  //   setValuePage(1);
  //   setValueLoading(true);
  // };

  const listDoc = () => {
    const data = listFilter.map((item) => {
      return {
        name: item.alias,
        value: item.name,
      };
    });

    return data;
  };

  const getStorage = (refresh: boolean) => {
    if (localStorage) {
      const storageFilter: string | null | undefined =
        LocalStorage.loadData(localStorage);
      if (storageFilter) {
        const prevFilter: IFilter[] = JSON.parse(storageFilter);
        let isFilter: any = [];
        prevFilter.map((item: IFilter, index: any) => {
          isFilter[index] = [
            item.name.valueData,
            item.operator.valueData,
            item.value.valueData,
          ];
        });

        if (refresh) {
          setFilter(isFilter);
        }
        setTableFilter(prevFilter);
      }
    }
  };

  useEffect(() => {
    getStorage(true);
  }, []);

  const getOperator = (doc: string) => {
    const docByFilter = listFilter.filter((item) => item.name === doc);
    if (docByFilter.length > 0) {
      const data = docByFilter.map((item: any) => {
        if (item.operator.length > 0) {
          const isOperator = item.operator.map((op: any) => {
            return { name: op, value: op };
          });
          return isOperator;
        }

        return [];
      });
      return data[0];
    } else {
      return [];
    }
  };

  const getListValue = async (doc: string, search?: String): Promise<any> => {
    const docByFilter = listFilter.filter((item) => item.name === doc);
    if (docByFilter.length > 0) {
      if (docByFilter[0].infiniteData) {
        try {
          const getData = await getValue({
            currentData: [],
            endpoint: docByFilter[0].infiniteData,
            refresh: true,
            search: search ?? "",
          });
          return getData;
        } catch (error) {
          return [];
        }
      } else if (docByFilter[0].listData) {
        return docByFilter[0].listData;
      } else {
        return [];
      }
    } else {
      return [];
    }
  };

  const getType = (doc: String): String => {
    const docByFilter: any = listFilter.filter((item) => item.name === doc);
    if (docByFilter.length > 0) {
      if (docByFilter[0].typeOf == "date") {
        return "date";
      }
      if (docByFilter[0].typeOf == "number") {
        return "number";
      }
      return "text";
    } else {
      return "Text";
    }
  };

  const modalRef = useRef<any>();

  const addFilter = () => {
    const notValidFilter = tableFilter.filter((item) => {
      return (
        item.name.valueData == "" ||
        item.operator.valueData == "" ||
        item.value.valueData == ""
      );
    });

    if (notValidFilter.length === 0) {
      setTableFilter([
        ...tableFilter,
        {
          name: { valueData: "", valueInput: "" },
          operator: { valueData: "", valueInput: "" },
          value: { valueData: "", valueInput: "" },
        },
      ]);
    }
  };

  const applyFilter = () => {
    const validFilter = tableFilter.filter((item) => {
      return (
        item.name.valueData !== "" &&
        item.operator.valueData !== "" &&
        item.value.valueData !== ""
      );
    });

    setTableFilter(validFilter);
    setOpen(false);

    if (validFilter.length > 0) {
      let isFilter: any = [];
      validFilter.map((item, index) => {
        isFilter[index] = [
          item.name.valueData,
          item.operator.valueData,
          item.value.valueData,
        ];
      });
      setFilter(isFilter);
      if (localStorage) {
        const getDefault = tableFilter.map((item: any) => {
          return {
            ...item,
            hasMore: false,
            listData: [],
            loading: false,
            page: 1,
          };
        });
        LocalStorage.saveData(localStorage, JSON.stringify(getDefault));
      }
    } else {
      setFilter([]);
      if (localStorage) {
        LocalStorage.removeData(localStorage);
      }
    }
  };

  const IsInfiniteData = (doc: String): boolean => {
    const docByFilter: any = listFilter.filter((item) => item.name === doc);
    if (docByFilter.length > 0) {
      if (docByFilter[0].infiniteData) {
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    let handler = (e: any) => {
      if (!modalRef.current?.contains(e.target)) {
        if (open) {
          getStorage(false);
        }
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  return (
    <div className="z-10 relative bg-white   border-[1.5px] rounded-md ml-2 cursor-pointer hover:bg-gray-50 duration-200">
      <div
        className="flex items-center  px-2 py-[7.1px] "
        onClick={() => {
          setOpen(!open);
        }}
      >
        <FilterListIcon style={{ fontSize: 17 }} />
        {tableFilter.length > 0 && (
          <h6 className=" rounded-full inline px-[5px]  text-[0.8em] mx-1 font-normal bg-red-200 text-red-500">
            {tableFilter.length}
          </h6>
        )}
        <h6 className="font-normal">Filter</h6>
      </div>
      {open && (
        <div
          ref={modalRef}
          className=" bg-white  border-[1.5px] border-gray-200 w-[600px] h-auto max-h-[320px] absolute  top-[38px]  left-0 rounded-md drop-shadow-md"
        >
          {tableFilter.length === 0 && (
            <h4 className="w-full border-b-[1.5px] border-[#f1eeee] flex-1 text-center py-6 text-gray-300 font-normal">
              No Filter
            </h4>
          )}
          <ul
            className={`max-h-[200px] h-auto px-6 scrollbar-none my-6 ${
              tableFilter.length > 4 && "overflow-y-auto my-4"
            }`}
          >
            {tableFilter.map((item, index) => {
              return (
                <li
                  key={index}
                  className="flex mb-3 relative text-[0.95em] items-center"
                >
                  <InputComponent
                    value={{
                      valueData: item.name.valueData,
                      valueInput: item.name.valueInput,
                    }}
                    onChange={(e) => {
                      item.name.valueInput = e;
                      setTableFilter([...tableFilter]);
                    }}
                    className="mr-3"
                    list={listDoc()}
                    onSelected={(e) => {
                      item.name.valueData = e.value;
                      item.name.valueInput = e.name;
                      setTableFilter([...tableFilter]);
                    }}
                    onReset={() => {
                      item.name.valueData = "";
                      item.name.valueInput = "";
                      item.operator.valueData = "";
                      item.operator.valueInput = "";
                      item.value.valueData = "";
                      item.value.valueInput = "";
                      setTableFilter([...tableFilter]);
                    }}
                    mandatoy
                    modalStyle="mt-2"
                    placeholder="Select Doc"
                    inputStyle="text-[0.95em]"
                  />
                  <InputComponent
                    modalStyle="mt-2"
                    value={{
                      valueData: item.operator.valueData,
                      valueInput: item.operator.valueInput,
                    }}
                    className="mr-3 w-[250px]"
                    list={getOperator(`${item.name.valueData}`)}
                    disabled={!item.name.valueData}
                    onSelected={(e) => {
                      item.operator.valueData = e.value;
                      item.operator.valueInput = e.value;
                      setTableFilter([...tableFilter]);
                    }}
                    onChange={(e) => {
                      item.operator.valueInput = e;
                      setTableFilter([...tableFilter]);
                    }}
                    onReset={() => {
                      item.operator.valueData = "";
                      item.operator.valueInput = "";
                      item.value.valueData = "";
                      item.value.valueInput = "";
                      setTableFilter([...tableFilter]);
                    }}
                    inputStyle="text-center text-[0.96em] w-[100px]"
                    mandatoy
                  />

                  <InputComponent
                    loading={item.loading ?? false}
                    modalStyle="mt-2"
                    infiniteScroll={{
                      active: IsInfiniteData(`${item.name.valueData}`) ?? false,
                      loading: false,
                      hasMore: false,
                      next: () => {},
                      onSearch: async (e) => {
                        try {
                          const data = await getListValue(
                            `${item.name.valueData}`,
                            e
                          );
                          item.listData = data;
                        } catch (error) {
                          item.listData = [];
                          console.error(error);
                        }
                        item.loading = false;
                        setTableFilter([...tableFilter]);
                      },
                    }}
                    onCLick={async () => {
                      item.loading = true;
                      item.listData = [];
                      setTableFilter([...tableFilter]);
                      const data = await getListValue(
                        `${item.name.valueData}`,
                        item.value.valueInput
                      );
                      item.loading = false;
                      item.listData = data;
                      setTableFilter([...tableFilter]);
                    }}
                    value={item.value}
                    type={getType(`${item.name.valueData}`).toString()}
                    className="mr-3"
                    list={item.listData ?? []}
                    onSelected={(e) => {
                      item.value.valueData = e.value;
                      item.value.valueInput = e.name;
                      if (IsInfiniteData(`${item.name.valueData}`)) {
                        item.hasMore = false;
                        item.listData = [];
                        item.loading = true;
                        item.page = 1;
                      }

                      setTableFilter([...tableFilter]);
                    }}
                    onChange={(e) => {
                      if (IsInfiniteData(`${item.name.valueData}`)) {
                        item.hasMore = false;
                        item.listData = [];
                        item.loading = true;
                        item.page = 1;
                      }

                      item.value.valueInput = e;
                      if (
                        item.operator.valueData === "like" ||
                        item.operator.valueData === "notlike" ||
                        getType(`${item.name.valueData}`).toString() ==
                          "number" ||
                        getType(`${item.name.valueData}`).toString() == "date"
                      ) {
                        item.value.valueData = e;
                      }
                      setTableFilter([...tableFilter]);
                    }}
                    onReset={() => {
                      if (IsInfiniteData(`${item.name.valueData}`)) {
                        item.hasMore = false;
                        item.listData = [];
                        item.loading = true;
                        item.page = 1;
                      }
                      item.value.valueData = "";
                      item.value.valueInput = "";
                      setTableFilter([...tableFilter]);
                    }}
                    inputStyle="text-[0.96em]"
                    disabled={!item.operator.valueData}
                    mandatoy
                  />
                  <CloseIcon
                    onClick={() => {
                      tableFilter.splice(index, 1);
                      setTableFilter([...tableFilter]);
                    }}
                    style={{ fontSize: 18 }}
                    className="text-gray-300"
                  />
                </li>
              );
            })}
          </ul>
          <div
            className={` w-[90%] ml-[5%]  flex py-5 text-sm  sticky bottom-0 ${
              tableFilter.length > 0 && "border-t"
            } bg-white `}
          >
            <div className="flex-1 font-normal flex items-center text-gray-700 opacity-70 hover:opacity-100 duration-200 ">
              <AddIcon style={{ fontSize: 12 }} className="mt-[1px]" />
              <h5 onClick={addFilter}>Add Filter</h5>
            </div>
            <div className="font-normal">
              <h5
                className="border py-[3px] px-2 rounded-md inline bg-gray-50 opacity-80 hover:opacity-100 duration-200"
                onClick={() => {
                  setTableFilter([]);
                }}
              >
                Clear Filter
              </h5>
              <h5
                onClick={applyFilter}
                className="ml-2 border inline py-[3px] px-2 bg-[#1976d3] border-[#166abd] text-white rounded-md  opacity-80 hover:opacity-100 duration-200"
              >
                Aplly Filter
              </h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterTableComponent;

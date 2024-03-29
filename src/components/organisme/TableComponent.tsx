import { IconButton } from "../atoms";
import { useState, useRef, useEffect } from "react";
import SyncLoader from "react-spinners/SyncLoader";
import { IListIconButton } from "../atoms/IconButton";
import SouthIcon from "@mui/icons-material/South";
import NorthIcon from "@mui/icons-material/North";
import CloseIcon from "@mui/icons-material/Close";
import { FilterTableComponent } from "../moleculs";
import { IDataFilter } from "../moleculs/FilterTableComponent";
import { LocalStorageType } from "../../utils";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { RiseLoader } from "react-spinners";

export interface IDataTables {
  [key: string]: JSX.Element | String | number | boolean;
}

export interface IColumns {
  header: String;
  accessor: String;
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
}

interface IButtonInsert {
  onCLick(): void | Promise<void>;
  status: Boolean;
  title?: string;
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
  icon?: {
    icon: any;
    className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
    size?: number;
  };
}

interface Iprops {
  disabled?: Boolean;
  width?: string;
  auto?: boolean;
  columns: IColumns[];
  data: IDataTables[];
  setData: any;
  selectedData?: IDataTables[];
  setSelectedData?: any;
  fetchMore(): Promise<any>;
  loadingMore?: boolean;
  hasMore: boolean;
  total: number;
  sort: IListIconButton[];
  isSort: String;
  isOrderBy: number;
  setOrderBy(): void | Promise<void>;
  getAllData?(): void | Promise<void>;
  onRefresh(): void | Promise<void>;
  buttonInsert?: IButtonInsert;
  listFilter?: IDataFilter[];
  filter: any[];
  setFilter: any;
  localStorage?: LocalStorageType;
  setSearch: any;
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
  moreSelected?: IListIconButton[];
  disabledRadio?: boolean;
  customButton?: IButtonInsert[];
}

const TableComponent: React.FC<Iprops> = ({
  columns,
  data,
  selectedData,
  setSelectedData,
  fetchMore,
  hasMore,
  loadingMore,
  total,
  sort,
  isSort,
  isOrderBy,
  setOrderBy,
  getAllData,
  listFilter,
  filter,
  setFilter,
  localStorage,
  setSearch,
  className,
  buttonInsert,
  onRefresh,
  moreSelected,
  disabled,
  width,
  disabledRadio = false,
  customButton,
}) => {
  const [value, setValue] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const [scrollValue, setScrollValue] = useState<number>(0);

  const handleAllChecked = (event: any) => {
    if (selectedData) {
      if (event.target.checked) {
        var mergedData = [...data, ...selectedData];
        var uniqueEntries = new Map();
        mergedData.forEach((item) => {
          uniqueEntries.set(item.id, item);
        });
        var finalData = [...uniqueEntries.values()];
        setSelectedData(finalData);
      } else {
        const gentSelectedData = selectedData.filter(
          (item1) => !data.find((item2) => item2.id === item1.id)
        );
        setSelectedData(gentSelectedData);
      }
      setSelectAll(event.target.checked);
    }
  };

  const handleChange = (data: IDataTables, event: any) => {
    if (selectedData) {
      if (event.target.checked) {
        setSelectedData([...selectedData, data]);
      } else {
        const genSelected = selectedData.filter(
          (item: any) => item.id !== data.id
        );
        setSelectAll(false);
        setSelectedData(genSelected);
      }
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(value);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value]);

  useEffect(() => {
    const notSelect = data.find((item) => !item.checked);
    if (notSelect) {
      setSelectAll(false);
    }
  }, [data]);

  const cekIsSelected = (id: String): boolean => {
    if (selectedData) {
      const result = selectedData.some((item) => item.id === id);
      return result;
    }
    return false;
  };

  const handleScroll = async () => {
    if (scrollableDivRef.current) {
      setScrollValue(scrollableDivRef.current.scrollTop);
      if (!loading && hasMore) {
        if (
          scrollableDivRef.current.scrollTop +
            scrollableDivRef.current.clientHeight >=
          scrollableDivRef.current.scrollHeight - 1
        ) {
          setLoading(true);
          await fetchMore();
          setLoading(false);
        }
      }
    }
  };

  return (
    <div
      className={`w-[97.5%] flex flex-col border border-[#e6e7e9] flex-1 bg-white ml-[1.25%]  mb-3 rounded-md drop-shadow-md overflow-hidden  ${className}`}
      id="scrollableDiv"
    >
      <div className="w-full z-30  p-3 sticky top-0 flex items-center justify-between py-5 border-b bg-white">
        <div className="text-md ml-4 text-gray-600 font-semibold flex items-center">
          ({data.length} {total ? `Of ${total}` : "Items"})
          <div className="w-60 border h-10 rounded-md  ml-4 bg-gray-50 flex items-center relative">
            <input
              className=" flex-1  px-3 pr-8 h-full rounded-md bg-gray-50 placeholder:text-gray-300 placeholder:font-normal"
              placeholder="Search"
              onChange={(e) => setValue(e.target.value)}
              value={value}
            />
            <CloseIcon
              className="mr-[5px] text-gray-200 cursor-pointer absolute right-0"
              style={{ fontSize: 18 }}
              onClick={() => setValue("")}
            />
          </div>
          {listFilter && (
            <FilterTableComponent
              filter={filter}
              setFilter={setFilter}
              listFilter={listFilter}
              localStorage={localStorage}
            />
          )}
          {selectedData && selectedData.length > 0 && (
            <h4 className="ml-3 text-[#6f7477] text-md font-normal">
              {selectedData.length} Items Selected
            </h4>
          )}
        </div>
        <div className="flex">
          {buttonInsert && buttonInsert.status && (
            <IconButton
              Icon={buttonInsert.icon?.icon}
              callback={buttonInsert.onCLick}
              name={buttonInsert.title ?? "New Data"}
              className={`py-1 px-2 mr-[7px] opacity-70 bg-green-800 border-green-900 hover:opacity-100 duration-300  ${buttonInsert.className}`}
              iconSize={buttonInsert.icon?.size ?? 17}
              classIcon={buttonInsert.icon?.className}
            />
          )}

          {customButton !== undefined &&
            customButton.map((item,index) => {
              if (item.status) {
                return (
                  <IconButton
                  key={index}
                    callback={item.onCLick}
                    name={item.title}
                    className={`py-1 px-2 mr-[7px] duration-100 ${item.className}`}
                    iconSize={item.icon?.size ?? 17}
                  />
                );
              }
            })}

          {getAllData != undefined && (
            <IconButton
              callback={getAllData}
              name="All Data"
              className="py-1 px-2 mr-[7px] hover:bg-gray-100 duration-100"
              iconSize={17}
              primary
            />
          )}

          {selectedData && selectedData.length > 0 && moreSelected && (
            <IconButton
              classModal="top-[29px]"
              primary
              Icon={MoreHorizIcon}
              iconSize={15}
              classIcon="mt-1"
              list={moreSelected}
              iconListDisabled
              className={` duration-100 mr-2 px-2`}
            />
          )}

          <IconButton
            Icon={RefreshIcon}
            callback={onRefresh}
            // name="Actions"
            // list={list}
            // iconListDisabled
            classIcon="mt-1"
            primary
            iconSize={18}
            className="mr-[7px] cursor-pointer py-[4.5px] opacity-70 px-[7px] hover:opacity-100 duration-100 "
          />

          <IconButton
            callback={setOrderBy}
            Icon={isOrderBy === 1 ? NorthIcon : SouthIcon}
            className=" flex py-1 px-2 rounded-r-none  hover:bg-gray-100 duration-100"
            iconSize={13}
            primary
          />
          <IconButton
            name={isSort}
            list={sort}
            className="py-[4.8px] px-2 border-l-0 rounded-l-none hover:bg-gray-100 duration-200"
            iconSize={17}
            primary
          />
        </div>
      </div>
      <div
        className="flex-1 overflow-auto  "
        ref={scrollableDivRef}
        onScroll={handleScroll}
      >
        {loading && (
          <div className="w-auto  bottom-5 left-1/2 inline py-1 px-2 text-center absolute text-md text-gray-400">
            <SyncLoader
              color="#36d7b6"
              loading={true}
              size={8}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        )}
        {loadingMore && (
          <div className="w-full h-[250px] items-center flex justify-center">
            <RiseLoader
              color="#36d7b6"
              loading={true}
              size={8}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        )}
        {data.length > 0 ? (
          <table
            className={`${
              data.length > 0 ? (width ? width : "w-full") : "w-full"
            } border-separate border-spacing-0`}
          >
            <thead>
              <tr>
                <th
                  className={`font-normal  text-gray-600 text-md top-0 sticky bg-white text-left py-3 px-4   ${
                    scrollValue > 0 && "border-b py-4 duration-300 "
                  }`}
                >
                  {!disabledRadio && selectedData && (
                    <input
                      className="w-[14px] accent-slate-600"
                      type="checkbox"
                      onChange={(e) => handleAllChecked(e)}
                      checked={selectAll}
                      disabled={disabled ? true : false}
                    />
                  )}
                </th>

                {columns.map((col, index) => (
                  <th
                    key={index}
                    className={`font-normal sticky top-0 bg-white text-gray-800 text-md py-3  z-10 text-left ${
                      scrollValue > 0 && "border-b py-4 duration-300"
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item: any, index) => {
                return (
                  <tr
                    key={index}
                    className={`text-md border-b border-[#ebeceb] hover:bg-gray-50 cursor-pointer ${
                      cekIsSelected(item.id) &&
                      "bg-gray-100 border-gray-300 border"
                    }`}
                  >
                    <td className="py-[15px] px-4">
                      {!disabledRadio && selectedData && (
                        <input
                          className="w-[14px] accent-slate-600"
                          type="checkbox"
                          checked={cekIsSelected(item.id)}
                          onChange={(e) => handleChange(item, e)}
                          disabled={disabled ? true : false}
                        />
                      )}
                    </td>
                    {columns.map((col: IColumns, id) => (
                      <td className={`${col.className}`} key={id}>
                        {item[`${col.accessor}`]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          !loading &&
          !loadingMore && (
            <h4 className="text-center py-32 text-gray-400 font-normal">
              Data not found
            </h4>
          )
        )}
      </div>
    </div>
  );
};

export default TableComponent;

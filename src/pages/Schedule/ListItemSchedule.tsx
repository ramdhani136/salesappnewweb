import moment from "moment";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import {
  ButtonStatusComponent,
  InfoDateComponent,
} from "../../components/atoms";
import { IDataFilter } from "../../components/moleculs/FilterTableComponent";
import TableComponent, {
  IColumns,
  IDataTables,
} from "../../components/organisme/TableComponent";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import { AlertModal, FetchApi } from "../../utils";
import { LoadingComponent } from "../../components/moleculs";
import { useDispatch } from "react-redux";
import { modalSet } from "../../redux/slices/ModalSlice";
import ModalSetSTockManual from "./ModalSetSTockManual";

interface IProps {
  props: any;
}

const ListItemSchedule: React.FC<IProps> = ({ props }) => {
  const [data, setData] = useState<IDataTables[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalData, setTotalData] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [sort, setSort] = useState<any[]>([]);
  const [isSort, setIsort] = useState<string>("updatedAt");
  const [isOrderBy, setOrderBy] = useState<number>(-1);
  const [limit, setLimit] = useState<number>(20);
  const [listFilter, setListFilter] = useState<IDataFilter[]>([]);
  const [search, setSeacrh] = useState<String>("");
  const [filter, setFilter] = useState<any[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeProgress, setActiveProgress] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalIndex, setTotalIndex] = useState<number>(0);
  const [onDeleteProgress, setOnDeleteProgress] = useState<String>("");
  const [currentPercent, setCurrentPercent] = useState<number>(0);

  const columns: IColumns[] = useMemo(
    (): IColumns[] => [
      { header: "Item Code", accessor: "item_code", className: "w-[14%]" },
      { header: "Item Name", accessor: "item_name", className: "w-[28%]" },
      { header: "Stocker", accessor: "stocker", className: "w-[10%]" },
      { header: "Status", accessor: "status", className: "w-[12%]" },
      { header: "Stock", accessor: "actual_qty", className: "w-[6.5%]" },
      { header: "Checked", accessor: "real_qty", className: "w-[6.5%]" },
      { header: "Uom", accessor: "uom", className: "w-[6.5%]" },
      { header: "", accessor: "updatedAt", className: "w-[21%]" },
    ],
    []
  );

  // const getItem = async (data: any): Promise<void> => {
  //   if (props.allow.barcode) {
  //   } else {
  //     if (props.status == 1) {
  //       ShowModalPackingId(data);
  //     }
  //   }
  // };

  const ShowModalPackingId = (params?: {}) => {
    dispatch(
      modalSet({
        active: true,
        Children: ModalSetSTockManual,
        title: "",
        props: { params, onRefresh },
      })
    );
  };

  const getData = async (): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.SCHEDULEITEM).FIND({
        filters: [...filter, ["schedule.name", "=", `${props.name}`]],
        limit: limit,
        page: page,
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });
      if (result.data.length > 0) {
        const generateData = result.data.map((item: any): IDataTables => {
          return {
            id: item._id,
            checked: false,
            item_code: (
              <a href={`/schedule/${props.name}/${item._id}`}>
                {item.item_code}
              </a>
            ),
            // item_code: props.allow.manual ? (
            //   <h4 onClick={() => getItem(item)}>{item.item_code}</h4>
            // ) : (
            //   <a href={`/schedule/${props.name}/${item._id}`}>
            //     {item.item_code}
            //   </a>
            // ),
            code: `${item.item_code} - ${item.item_name}`,
            item_name: (
              <a href={`/schedule/${props.name}/${item._id}`}>
                {item.item_name}
              </a>
            ),
            // item_name: props.allow.manual ? (
            //   <h4 onClick={() => getItem(item)}>{item.item_name}</h4>
            // ) : (
            //   <a href={`/schedule/${props.name}/${item._id}`}>
            //     {item.item_name}
            //   </a>
            // ),
            stocker: <div className="text-left">{item.stocker}</div>,
            uom: <div className="text-center">{item.stock_uom}</div>,
            status: (
              <ButtonStatusComponent
                status={item.status}
                name={
                  item.status == 0
                    ? "Open"
                    : item.status == 1
                    ? "Completed"
                    : "Not Match"
                }
              />
            ),
            real_qty: (
              <div className="text-center font-medium text-[0.96em]">
                {item.real_qty.toLocaleString()}
              </div>
            ),
            actual_qty: (
              <div className="text-center font-medium text-[0.96em]">
                {item.actual_qty.toLocaleString()}
              </div>
            ),
            updatedAt: (
              <div className="inline text-gray-600 text-[0.93em]">
                <InfoDateComponent date={item.updatedAt} className="-ml-9" />
              </div>
            ),
          };
        });

        const genSort: any[] = result.filters.map((st: any): any => {
          return {
            name: st.name,
            onClick: () => {
              setData([]);
              setHasMore(false);
              setPage(1);
              setIsort(st.name);
              setRefresh(true);
            },
          };
        });
        setListFilter(result.filters);
        setSort(genSort);
        setTotalData(result.total);
        setHasMore(result.hasMore);
        setPage(result.nextPage);
        setData([...data, ...generateData]);
      }
      setRefresh(false);
      setLoading(false);
    } catch (error) {
      setTotalData(0);
      setLoading(false);
      setRefresh(false);
    }
  };

  const getAllData = () => {
    setData([]);
    setHasMore(false);
    setPage(1);
    setLimit(0);
    setLoading(true);
    setRefresh(true);
  };

  const onRefresh = () => {
    setData([]);
    setPage(1), setHasMore(false);
    setRefresh(true);
  };

  const getERPItem = (): void => {
    AlertModal.confirmation({
      onConfirm: async (): Promise<void> => {
        try {
          setLoading(true);
          const uri = `${import.meta.env.VITE_PUBLIC_URI}/schedule/refresh/${
            props.name
          }`;
          await FetchApi.get(uri);
          onRefresh();
        } catch (error) {
          AlertModal.Default({
            icon: "error",
            title: "Error",
            text: "Error Network",
          });
          setLoading(false);
        }
      },
      confirmButtonText: "Yes, do it!",
      text: "This will take a lot of time",
    });
  };

  const getSelected = () => {
    const isSelect = data.filter((item) => item.checked === true);
    return isSelect;
  };

  const onDelete = async (e: any[]): Promise<void> =>
    AlertModal.confirmation({
      onConfirm: async (): Promise<void> => {
        const data: any[] = getSelected();
        setLoading(true);
        try {
          setActiveProgress(true);
          for (const item of data) {
            await GetDataServer(DataAPI.SCHEDULEITEM).DELETE(item.id);
            const index = data.indexOf(item);
            let percent = (100 / data.length) * (index + 1);
            setCurrentIndex(index);
            setOnDeleteProgress(item.code);
            setCurrentPercent(percent);
            setTotalIndex(data.length);
          }
          setActiveProgress(false);
          onRefresh();
        } catch (error: any) {
          AlertModal.Default({
            icon: "error",
            title: "Error",
            text: error.response.data.msg ?? "Error Network",
          });
          setLoading(false);
          setActiveProgress(false);
        }
      },
    });

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (refresh) {
      getData();
    }
  }, [refresh]);

  useEffect(() => {
    onRefresh();
  }, [filter, search]);

  return (
    <div className="min-h-[300px] max-h-[400px] flex">
      {loading ? (
        <div className="w-full  flex items-center justify-center">
          <LoadingComponent
            animate={{ icon: HashLoader, color: "#36d7b6", size: 40 }}
            showProgress={{
              active: activeProgress,
              currentIndex: currentIndex,
              currentPercent: currentPercent,
              onProgress: onDeleteProgress,
              totalIndex: totalIndex,
            }}
          />
        </div>
      ) : (
        <TableComponent
          moreSelected={[{ name: "Delete", onClick: onDelete }]}
          setSearch={setSeacrh}
          setData={setData}
          listFilter={listFilter}
          hasMore={hasMore}
          fetchMore={getData}
          columns={columns}
          data={data}
          total={totalData}
          sort={sort}
          isSort={isSort}
          isOrderBy={isOrderBy}
          setOrderBy={() => {
            setData([]);
            setHasMore(false);
            setPage(1);
            let getOrder = isOrderBy === 1 ? -1 : 1;
            setOrderBy(getOrder);
            setRefresh(true);
          }}
          getAllData={getAllData}
          filter={filter}
          setFilter={setFilter}
          className="ml-[3px]"
          onRefresh={() => {
            setData([]);
            setPage(1), setHasMore(false);
            setLoading(true);
            setRefresh(true);
          }}
          disabled={props.status != 1 && props.status != 0}
          buttonInsert={{
            onCLick: getERPItem,
            status: props.status == 1 || props.status == 0,
            title: "Update List",
            icon: { icon: SyncAltIcon, className: "mr-1 mt-1", size: 13 },
          }}
        />
      )}
    </div>
  );
};

export default React.memo(ListItemSchedule);

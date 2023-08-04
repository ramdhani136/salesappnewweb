import moment from "moment";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import { ButtonStatusComponent, InputComponent } from "../../components/atoms";
import { IDataFilter } from "../../components/moleculs/FilterTableComponent";
import TableComponent, {
  IColumns,
  IDataTables,
} from "../../components/organisme/TableComponent";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import { useDispatch, useSelector } from "react-redux";
import { modalSet } from "../../redux/slices/ModalSlice";
import ModalPackingId from "./ModalPackingId";
import { AlertModal } from "../../utils";
import { LoadingComponent } from "../../components/moleculs";

interface IProps {
  props: any;
  scheduleRefresh: any;
}

interface IDateProps {
  date: String;
}

const ScheduleItemPacking: React.FC<IProps> = ({ props, scheduleRefresh }) => {
  // Info Date COmponent
  const InfoDateComponent: React.FC<IDateProps> = ({ date }) => {
    const [open, setOpen] = useState<boolean>(false);
    return (
      <div
        className={`inline text-gray-600 text-[0.93em]  `}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <h5 className="mr-2 inline">-</h5>
        <h5 className="inline ">{moment(`${date}`).fromNow()}</h5>
        <h6
          className={`${
            !open && "hidden"
          } duration-300 absolute -ml-3 -mt-12 text-white border text-center w-[160px] rounded-md py-1 px-2 bg-gray-900`}
        >
          {moment(`${date}`).format("lll")}
        </h6>
      </div>
    );
  };

  // End

  const [data, setData] = useState<IDataTables[]>([]);
  const [defaultData, setDefaultData] = useState<IDataTables[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalData, setTotalData] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [activeProgress, setActiveProgress] = useState<boolean>(false);
  const [sort, setSort] = useState<any[]>([]);
  const [isSort, setIsort] = useState<string>("createdAt");
  const [isOrderBy, setOrderBy] = useState<number>(-1);
  const [limit, setLimit] = useState<number>(20);
  const [listFilter, setListFilter] = useState<IDataFilter[]>([]);
  const [search, setSeacrh] = useState<String>("");
  const [filter, setFilter] = useState<any[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalIndex, setTotalIndex] = useState<number>(0);
  const [onDeleteProgress, setOnDeleteProgress] = useState<String>("");
  const [currentPercent, setCurrentPercent] = useState<number>(0);

  const columns: IColumns[] = useMemo(
    (): IColumns[] => [
      { header: "Item Packing", accessor: "id_packing", className: "w-[20%]" },
      { header: "Status", accessor: "status", className: "w-[15%]" },
      { header: "Packing Qty", accessor: "conversion", className: "w-[10%]" },
      { header: "Real Qty", accessor: "actual_qty", className: "w-[10%]" },
      { header: "UOM", accessor: "stock_uom", className: "w-[10%]" },
      { header: "Checked By", accessor: "checkedBy", className: "w-[15%]" },
      { header: "", accessor: "updatedAt", className: "w-[15%]" },
    ],
    []
  );

  const getData = async (): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.PACKING).FIND({
        filters: [...filter, ["schedule.scheduleItem", "=", `${props._id}`]],
        limit: limit,
        page: page,
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });
      if (result.data.length > 0) {
        setDefaultData(result.data);
        const generateData = result.data.map((item: any): IDataTables => {
          return {
            id: item._id,
            checked: false,
            packing: item.id_packing,
            id_packing: (
              <button
                onClick={() => {
                  ShowModalPackingId(item);
                }}
              >
                {item.id_packing !== "" ? item.id_packing : "(No Packing ID)"}
              </button>
            ),
            stock_uom: <div className="text-center">{item.stock_uom}</div>,
            status: (
              <ButtonStatusComponent
                status={item.status}
                name={
                  item.status == 0
                    ? "Not Match"
                    : item.status == 2
                    ? "Manual"
                    : "Match"
                }
              />
            ),
            conversion: (
              <div className="text-center font-medium text-[0.96em]">
                {item.conversion.toLocaleString()}
              </div>
            ),
            actual_qty: (
              <div className="text-center font-medium text-[0.96em]">
                {item.actual_qty.toLocaleString()}
              </div>
            ),
            checkedBy: (
              <div className=" font-medium text-[0.96em]">
                {item.checkedBy.name}
              </div>
            ),
            updatedAt: (
              <>
                <InfoDateComponent date={item.createdAt} />
              </>
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

  const ShowModalPackingId = (params?: {}) => {
    const getRefresh = () => {
      scheduleRefresh();
      onRefresh();
    };
    if (params) {
      props = { ...props, params };
    }
    dispatch(
      modalSet({
        active: true,
        Children: ModalPackingId,
        title: "",
        props: { ...props, onRefresh: getRefresh, data: defaultData },
      })
    );
  };

  const getSelected = () => {
    const isSelect = data.filter((item) => item.checked === true);
    return isSelect;
  };

  const deletePacking = async (e: any[]): Promise<void> =>
    AlertModal.confirmation({
      onConfirm: async (): Promise<void> => {
        const data: any[] = getSelected();
        setLoading(true);
        try {
          setActiveProgress(true);
          for (const item of data) {
            await GetDataServer(DataAPI.PACKING).DELETE(item.id);
            const index = data.indexOf(item);
            let percent = (100 / data.length) * (index + 1);
            setCurrentIndex(index);
            setOnDeleteProgress(item.packing);
            setCurrentPercent(percent);
            setTotalIndex(data.length);
          }
          navigate(0);
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

  console.log(props.schedule.allow);

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
          moreSelected={[{ name: "Delete", onClick: deletePacking }]}
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
          buttonInsert={{
            status: props.schedule.status == 1,
            onCLick: ShowModalPackingId,
            title: `${
              props.schedule.allow.barcode === true &&
              props.schedule.allow.manual === false
                ? "Insert Packing ID"
                : "Add Stock"
            }`,
          }}
          disabled={props.schedule.status != 1}
        />
      )}
    </div>
  );
};

export default React.memo(ScheduleItemPacking);

import moment from "moment";
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import { InfoDateComponent } from "../../components/atoms";
import { IDataFilter } from "../../components/moleculs/FilterTableComponent";
import TableComponent, {
  IColumns,
  IDataTables,
} from "../../components/organisme/TableComponent";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import { AlertModal } from "../../utils";
import { LoadingComponent } from "../../components/moleculs";
import { useDispatch } from "react-redux";
import { modalSet } from "../../redux/slices/ModalSlice";
import FormNotePage from "./FormNotePage";

interface IProps {
  props: any;
}

const TaskPage: React.FC<IProps> = ({ props }) => {
  const docData = props.data;
  const status = props.status;
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
      { header: "Title", accessor: "title", className: "w-[30%]" },
      { header: "Notes", accessor: "notes", className: "w-[40%]" },
      { header: "From", accessor: "from", className: "w-[15%]" },
      { header: "Doc", accessor: "doc", className: "w-[15%]" },
      // { header: "Action", accessor: "action", className: "w-[15%]" },
    ],
    []
  );

  const GetFormNote = (id?: string) => {
    dispatch(
      modalSet({
        active: true,
        Children: FormNotePage,
        title: "",
        props: { id: id ?? undefined, doc: docData, onRefresh: getData },
        className: "w-[63%] h-[98%]",
      })
    );
  };

  const getData = async (props?: { refresh?: boolean }): Promise<any> => {
    try {
      if (docData.length > 0) {
        const generateData = docData.map((item: any): IDataTables => {
          return {
            title: <h4 className="mx-2 ">{item.title}</h4>,
            notes: <h4 className="mx-2 py-2">{item.notes}</h4>,
            from: <h4 className="mx-2">{item.from}</h4>,
            doc: <h4 className="mx-2">{item.name}</h4>,
            action:
              status == "0" ? (
                <button onClick={ShowFormNote} className="border rounded-md bg-green-600 border-green-700 hover:bg-green-700 hover:border-green-800 duration-100 text-sm  text-white px-2 py-1 mr-1 mb-1 ">
                  Create Note
                </button>
              ) : (
                ""
              ),
          };
        });

        if (!props?.refresh) {
          setData([...data, ...generateData]);
        } else {
          setData([...generateData]);
        }
      }
      setRefresh(false);
      setLoading(false);
    } catch (error) {
      if (props?.refresh) {
        setData([]);
      }

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
            await GetDataServer(DataAPI.NOTE).DELETE(item.id);
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

  const ShowFormNote = () => {
    dispatch(
      modalSet({
        active: true,
        Children: FormNotePage,
        title: "",
        props: { doc: docData },
        className: "w-[63%] h-[98%]",
      })
    );
  };

  return (
    <>
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
            disabledRadio
            moreSelected={[{ name: "Delete", onClick: onDelete }]}
            setSearch={setSeacrh}
            setData={setData}
            // listFilter={listFilter}
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
            disabled={docData.status !== "0" ? true : false}
          />
        )}
      </div>
      {docData.status == "0" && (
        <a
          onClick={() => {
            GetFormNote();
          }}
          className="duration-100 hover:cursor-pointer hover:bg-gray-200 border px-2 py-1 ml-1 rounded-md inline bg-gray-100 text-[0.95em]"
        >
          Add Row
        </a>
      )}
    </>
  );
};

export default React.memo(TaskPage);

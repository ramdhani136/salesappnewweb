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
  type: string;
}

const NotesPage: React.FC<IProps> = ({ props, type }) => {
  const docId = props.docId;
  const docData = props.data;
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
  const [selectedData, setSelectedData] = useState<IDataTables[]>([]);

  const columns: IColumns[] = useMemo(
    (): IColumns[] => [
      { header: "Topic", accessor: "topic", className: "w-[20%]" },
      { header: "Activity", accessor: "activity", className: "w-[25%]" },
      { header: "Feedback", accessor: "feedback", className: "w-[25%]" },
      { header: "Tags", accessor: "tags", className: "w-[15%]" },
      { header: "", accessor: "updatedAt", className: "w-[11%]" },
    ],
    []
  );

  const GetFormNote = (id?: string) => {
    dispatch(
      modalSet({
        active: true,
        Children: FormNotePage,
        title: "",
        props: {
          id: id ?? undefined,
          doc: docData,
          onRefresh: getData,
          type: type,
        },
        className: "w-[63%] h-[98%]",
      })
    );
  };

  const getData = async (props?: { refresh?: boolean }): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.NOTE).FIND({
        filters: [...filter, ["doc._id", "=", `${docId}`]],
        limit: limit,
        page: props?.refresh ? 1 : page,
        orderBy: { sort: isOrderBy, state: isSort },
        search: props?.refresh ? "" : search,
      });
      if (result.data.length > 0) {
        const generateData = result.data.map((item: any): IDataTables => {
          return {
            id: item._id,
            topic: (
              <b
                className="font-medium"
                onClick={() => {
                  GetFormNote(item._id);
                }}
              >
                {item.topic.name}
              </b>
            ),
            updatedAt: (
              <div className="inline text-gray-600 text-[0.93em]">
                <InfoDateComponent date={item.updatedAt} className="-ml-9" />
              </div>
            ),
            activity: (
              <h4 className="mr-10 py-3 text-[0.95em]">{item.task ?? ""}</h4>
            ),
            feedback: (
              <h4 className="mr-10 py-3 text-[0.95em]">{item.result}</h4>
            ),
            tags: (
              <div className="p-2">
                {item.tags &&
                  item.tags.map((i: any, index: number) => {
                    return (
                      <button
                        key={index}
                        className="border rounded-md bg-red-600 border-red-700  text-sm  text-white px-2 py-1 mr-1 mb-1"
                      >
                        {i.name}
                      </button>
                    );
                  })}
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
        const genListFilter = result.filters.map((i: any) => {
          let endpoint: DataAPI | undefined;
          switch (i.alias) {
            case "CreatedBy":
              endpoint = DataAPI.USERS;
              break;
            case "WorkflowState":
              endpoint = DataAPI.WORKFLOWSTATE;
              break;
            case "Customer":
              endpoint = DataAPI.CUSTOMER;
              break;
            case "Topic":
              endpoint = DataAPI.TOPIC;
              break;
            case "Tag":
              endpoint = DataAPI.TAGS;
              break;
            case "Branch":
              endpoint = DataAPI.BRANCH;
              break;
            case "CustomerGroup":
              endpoint = DataAPI.GROUP;
              break;
            default:
              endpoint = undefined;
              break;
          }

          if (endpoint) {
            i["infiniteData"] = endpoint;
          }

          return i;
        });
        setListFilter(genListFilter);
        setSort(genSort);
        setTotalData(result.total);
        setHasMore(result.hasMore);
        setPage(result.nextPage);

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

  const onDelete = async (e: any[]): Promise<void> =>
    AlertModal.confirmation({
      onConfirm: async (): Promise<void> => {
        const data: any[] = selectedData;
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
          setSelectedData([]);
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
            selectedData={selectedData}
            setSelectedData={setSelectedData}
            width="w-[120%]"
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

export default React.memo(NotesPage);

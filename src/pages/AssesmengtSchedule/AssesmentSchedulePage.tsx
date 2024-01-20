import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ButtonStatusComponent,
  IconButton,
  InfoDateComponent,
} from "../../components/atoms";
import { AlertModal, LocalStorageType, Meta, useKey } from "../../utils";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import AddIcon from "@mui/icons-material/Add";
import { TableComponent } from "../../components/organisme";
import {
  IColumns,
  IDataTables,
} from "../../components/organisme/TableComponent";
import {
  LoadingComponent,
  ProgressBarComponent,
} from "../../components/moleculs";
import moment from "moment";
import { IDataFilter } from "../../components/moleculs/FilterTableComponent";
export const AssesmentSchedulePage: React.FC = (): any => {
  const [data, setData] = useState<IDataTables[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedData, setSelectedData] = useState<IDataTables[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalData, setTotalData] = useState<number>(0);
  const [page, setPage] = useState<String>("1");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [sort, setSort] = useState<any[]>([]);
  const [isSort, setIsort] = useState<string>("createdAt");
  const [isOrderBy, setOrderBy] = useState<number>(-1);
  const [limit, setLimit] = useState<number>(20);
  const [listFilter, setListFilter] = useState<IDataFilter[]>([]);
  const [search, setSeacrh] = useState<String>("");
  const [filter, setFilter] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalIndex, setTotalIndex] = useState<number>(0);
  const [onDeleteProgress, setOnDeleteProgress] = useState<String>("");
  const [currentPercent, setCurrentPercent] = useState<number>(0);
  const [activeProgress, setActiveProgress] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const metaData = {
    title: "Assesment Schedule - Sales App Ekatunggal",
    description: "Halaman assesment schedule sales web system",
  };

  const navigate = useNavigate();

  const columns: IColumns[] = useMemo(
    () => [
      { header: "Name", accessor: "name", className: "w-auto" },
      { header: "Status", accessor: "workflowState", className: "w-auto" },
      { header: "User", accessor: "user", className: "w-auto" },
      { header: "Progress", accessor: "progress", className: "w-auto" },
      { header: "Active Date", accessor: "activeDate", className: "w-auto" },
      { header: "Deactive Date", accessor: "deactiveDate", className: "w-auto" },
      { header: "Created By", accessor: "createdBy", className: "w-auto" },
      { header: "", accessor: "updatedAt", className: "w-auto" },
    ],
    []
  );

  const getData = async (): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.ASSESMENTSCHEDULE).FIND({
        limit: limit,
        page: page,
        filters: filter,
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      if (result.data.length > 0) {
        const generateData = result.data.map((item: any): IDataTables => {
          console.log(item)
          let width = item.progress;
          return {
            id: item._id,
            createdBy: item.createdBy.name,
            doc: <h4 className="mx-2">{item.name}</h4>,
            progress: (
              <div className="w-[180px] mx-2 mt-5 ">
                {item.progress > 0 ? (
                  <ProgressBarComponent percentage={width} />
                ) : (
                  ""
                )}
              </div>
            ),

            name: (
              <Link to={`/assesment/schedule/${item._id}`}>
                <b className="font-medium">{item.name}</b>
              </Link>
            ),
            user: <div>{item.createdBy.name}</div>,
            activeDate: moment(item.activeDate).format("LL"),
            deactiveDate: moment(item.deactiveDate).format("LL"),
            workflowState: (
              <ButtonStatusComponent
                status={item.status}
                name={item.workflowState}
              />
            ),
            updatedAt: (
              <div className="inline text-gray-600 text-[0.93em]">
                <InfoDateComponent date={item.updatedAt} className="-ml-14" />
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
              setPage("1");
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
        setData([...data, ...generateData]);
        setRefresh(false);
      }
      setLoading(false);
    } catch (error: any) {
      if (error.status === 401) {
        navigate("/login");
      }
      setTotalData(0);
      setLoading(false);
      setRefresh(false);
    }
    setLoadingMore(false);
  };

  const onRefresh = () => {
    setData([]);
    setPage("1"), setHasMore(false);
    setRefresh(true);
  };

  useEffect(() => {
    if (refresh) {
      setLoadingMore(true);
      getData();
    }
  }, [refresh]);

  useEffect(() => {
    onRefresh();
  }, [filter, search]);

  useKey("n", () => alert("Create new Schedule"), {
    ctrl: true,
    alt: true,
  });

  const getAllData = () => {
    setData([]);
    setHasMore(false);
    setPage("1");
    setLimit(0);
    setRefresh(true);
  };

  const onDelete = () => {
    AlertModal.confirmation({
      onConfirm: async (): Promise<void> => {
        const data: any[] = selectedData;
        setLoading(true);
        try {
          setActiveProgress(true);
          for (const item of data) {
            await GetDataServer(DataAPI.ASSESMENTSCHEDULE).DELETE(item.id);
            const index = data.indexOf(item);
            let percent = (100 / data.length) * (index + 1);
            setCurrentIndex(index);
            setOnDeleteProgress(item.doc);
            setCurrentPercent(percent);
            setTotalIndex(data.length);
          }
          setSelectedData([]);
          getAllData();
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
  };

  return (
    <>
      {Meta(metaData)}
      <div className="w-full h-full overflow-y-auto flex flex-col">
        {!loading ? (
          <>
            <div className=" w-full h-16 flex items-center justify-between">
              <h1 className="font-bold ml-5 text-[1.1em] mr-2 text-gray-700 ">
                Assesment Schedule List
              </h1>
              <div className="flex-1  flex items-center justify-end mr-4">
                <IconButton
                  Icon={AddIcon}
                  name="Add Schedule"
                  className={`opacity-80 hover:opacity-100 duration-100 ${
                    selectedData.length > 0 && "hidden"
                  } `}
                  callback={() => navigate("/assesment/schedule/new")}
                />

                <IconButton
                  name="Action"
                  className={`duration-100 ${
                    selectedData.length === 0 && "hidden"
                  }`}
                  list={[{ name: "Delete", onClick: onDelete }]}
                />
              </div>
            </div>
            <TableComponent
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              width="w-[105%]"
              loadingMore={loadingMore}
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
                setPage("1");
                let getOrder = isOrderBy === 1 ? -1 : 1;
                setOrderBy(getOrder);
                setRefresh(true);
              }}
              getAllData={getAllData}
              filter={filter}
              setFilter={setFilter}
              localStorage={LocalStorageType.FILTERASSESMENTSCHEDULE}
              onRefresh={onRefresh}
            />
          </>
        ) : (
          <LoadingComponent
            showProgress={{
              active: activeProgress,
              currentIndex: currentIndex,
              currentPercent: currentPercent,
              onProgress: onDeleteProgress,
              totalIndex: totalIndex,
            }}
          />
        )}
      </div>
    </>
  );
};

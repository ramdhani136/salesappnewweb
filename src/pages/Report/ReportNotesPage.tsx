import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ButtonStatusComponent,
  IconButton,
  InfoDateComponent,
} from "../../components/atoms";
import { AlertModal, LocalStorageType, Meta } from "../../utils";
import * as XLSX from "xlsx";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import { TableComponent } from "../../components/organisme";
import {
  IColumns,
  IDataTables,
} from "../../components/organisme/TableComponent";
import { LoadingComponent } from "../../components/moleculs";
import { IDataFilter } from "../../components/moleculs/FilterTableComponent";
import moment from "moment";

export const ReportNotesPage: React.FC = (): any => {
  const [data, setData] = useState<IDataTables[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
    title: "Report Note -  Sales App Ekatunggal",
    description: "Halaman Report Notes - sales web system",
  };

  const navigate = useNavigate();

  const columns: IColumns[] = useMemo(
    () => [
      { header: "Customer", accessor: "customer", className: "w-[12.5%]" },
      { header: "Topic", accessor: "topic", className: "w-[12,5%]" },
      { header: "Activity", accessor: "activity", className: "w-[15%]" },
      { header: "Feedback", accessor: "feedback", className: "w-[15%]" },
      { header: "Tags", accessor: "tag", className: "w-[10%]" },
      { header: "Group", accessor: "group", className: "w-[7.5%]" },
      { header: "Branch", accessor: "branch", className: "w-[10%]" },
      { header: "User", accessor: "user", className: "w-[7.5%]" },
      { header: "", accessor: "updatedAt", className: "w-7.55%]" },
    ],
    []
  );

  const getData = async (): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.NOTE).FIND({
        limit: limit,
        page: page,
        filters: filter,
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      if (result.data.length > 0) {
        const generateData = result.data.map((item: any): IDataTables => {
          return {
            id: item._id,
            checked: false,

            customer: (
              // <Link to={`/report/notes/${item._id}`}>
              <b className="font-medium mx-2">{item.customer.name}</b>
              // </Link>
            ),
            topic: <h4 className="mx-2">{item.topic.name}</h4>,
            group: <h4 className="mx-2">{item.customerGroup.name}</h4>,
            branch: item.branch.name,
            activity: <h4 className="mx-2">{item.task}</h4>,
            feedback: <h4 className="mx-2">{item.result}</h4>,
            user: <div>{item.createdBy.name}</div>,
            tag: (
              <ul className="float-left">
                {item.tags.map((i: any, ind: any) => (
                  <li
                    key={ind}
                    className=" inline list-none border rounded-md px-2 py-1 mr-1 mb-1 text-white text-sm bg-green-700 float-left"
                  >
                    {i.name}
                  </li>
                ))}
              </ul>
            ),

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
        setListFilter(result.filters);
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
      setLoadingMore(false);
      getData();
    }
  }, [refresh]);

  useEffect(() => {
    onRefresh();
  }, [filter, search]);

  const getAllData = () => {
    setData([]);
    setHasMore(false);
    setPage("1");
    setLimit(0);
    setRefresh(true);
  };

  const getSelected = () => {
    const listDelete = data.filter((item) => item.checked);
    return listDelete;
  };

  const onDelete = () => {
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
            setOnDeleteProgress(item.doc);
            setCurrentPercent(percent);
            setTotalIndex(data.length);
          }
          getAllData();
        } catch (error: any) {
          AlertModal.Default({
            icon: "error",
            title: "Error",
            text: error.response.data.msg ?? "Error Network",
          });
          getAllData();
          setLoading(false);
          setActiveProgress(false);
        }
      },
    });
  };

  const ExportToExcel = async () => {
    try {
      const getExport: any = await GetDataServer(DataAPI.NOTE).FIND({
        limit: 0,
        filters: filter,
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      const getDataExport = getExport.data.map((item: any) => {
        return {
          date: moment(item.createdAt).format("LLL"),
          customer: item.customer.name,
          topic: item.topic.name,
          activity: item.task,
          feedback: item.result,
          tags: `${item.tags.map((i: any) => i.name)}`,
          group: item.customerGroup.name,
          branch: item.branch.name,
          user: item.createdBy.name,
        };
      });

      const ws = XLSX.utils.json_to_sheet(getDataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      XLSX.writeFile(wb, "Notes.xlsx");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {Meta(metaData)}
      <div className="w-full h-full overflow-y-auto flex flex-col">
        {!loading ? (
          <>
            <div className=" w-full h-16 flex items-center justify-between">
              <h1 className="font-bold ml-5 text-[1.1em] mr-2 text-gray-700 ">
                Report Notes
              </h1>
              <div className="flex-1  flex items-center justify-end mr-4">
                <IconButton
                  name="Export"
                  className={`duration-100 hover:border-[#1669bdec] hover:bg-[#1976d3ec]`}
                  callback={() => {
                    ExportToExcel();
                  }}
                />
              </div>
            </div>
            <TableComponent
              loadingMore={loadingMore}
              disabled={true}
              width="w-[200%]"
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
              localStorage={LocalStorageType.FILTERREPORTNOTE}
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

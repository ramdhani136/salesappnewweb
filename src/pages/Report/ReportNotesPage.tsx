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
import { LoadingComponent } from "../../components/moleculs";
import { IDataFilter } from "../../components/moleculs/FilterTableComponent";

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

  const metaData = {
    title: "Report Note -  Sales App Ekatunggal",
    description: "Halaman Report Notes - sales web system",
  };

  const navigate = useNavigate();

  const columns: IColumns[] = useMemo(
    () => [
      { header: "Customer", accessor: "customer", className: "w-[12.5%]" },
      { header: "Topic", accessor: "topic", className: "w-[12.5%]" },
      { header: "Result", accessor: "result", className: "w-[22.5%]" },
      { header: "Group", accessor: "group", className: "w-[10%]" },
      { header: "Branch", accessor: "branch", className: "w-[15%]" },
      { header: "User", accessor: "user", className: "w-[10%]" },
      { header: "Tags", accessor: "tag", className: "w-[10%]" },
      { header: "", accessor: "updatedAt", className: "w-[7.5%]" },
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
            result: <h4 className="mx-2">{item.result}</h4>,
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
  };

  const onRefresh = () => {
    setData([]);
    setPage("1"), setHasMore(false);
    setRefresh(true);
  };

  useEffect(() => {
    if (refresh) {
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
                  name="Action"
                  className={`duration-100 ${
                    getSelected().length === 0 && "hidden"
                  }`}
                  list={[{ name: "Delete", onClick: onDelete }]}
                />
              </div>
            </div>
            <TableComponent
              auto={true}
              width="w-[180%]"
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

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
import { typeInfoDate } from "../../components/atoms/InfoDateComponent";

export const ReportSchedulePage: React.FC = (): any => {
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
    title: "Report Schedule -  Sales App Ekatunggal",
    description: "Halaman Report Schedule - sales web system",
  };

  const navigate = useNavigate();

  const columns: IColumns[] = useMemo(
    (): IColumns[] => [
      { header: "Schedule", accessor: "schedule", className: "w-auto" },
      {
        header: "Schedule Status",
        accessor: "scheduleStatus",
        className: "w-auto text-center",
      },
      { header: "Customer", accessor: "customer", className: "w-[270px]" },
      { header: "Status", accessor: "status", className: "w-auto" },
      { header: "Start Date", accessor: "startDate", className: "w-auto" },
      { header: "Due Date", accessor: "dueDate", className: "w-auto" },
      { header: "Closing Date", accessor: "closingDate", className: "w-auto" },
      { header: "Notes", accessor: "notes", className: "w-auto text-center" },
      { header: "Doc", accessor: "doc", className: "w-auto" },
      { header: "Type", accessor: "docType", className: "w-auto" },
      { header: "Closing By", accessor: "closingBy", className: "w-auto" },
      { header: "Group", accessor: "group", className: "w-auto" },
      { header: "Branch", accessor: "branch", className: "w-auto" },
      { header: "", accessor: "updatedAt", className: "w-auto" },
    ],
    []
  );

  const getData = async (): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.SCHEDULELIST).FIND({
        limit: limit,
        page: page,
        filters: filter,
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      if (result.data.length > 0) {
        const generateData = result.data.map((item: any): IDataTables => {
          let notes: string[] = [`${item.schedule.notes}`];
          if (item.notes) {
            notes.push(item.notes);
          }
          return {
            id: item._id,
            checked: false,
            schedule: item.schedule.name,
            scheduleStatus: (
              <h4 className="text-center">{item.schedule.status}</h4>
            ),
            customer: (
              <b className="font-medium  py-3 float-left">
                {item.customer.name}
              </b>
            ),
            notes: <h4>{`${notes}`}</h4>,
            doc: <h4>{item?.closing?.doc?.name ?? ""}</h4>,
            docType: (
              <h4>
                {item?.closing?.doc?.type
                  ? item?.closing?.doc?.type === "callsheet"
                    ? "Callsheet"
                    : "Visit"
                  : ""}
              </h4>
            ),
            closingBy: <h4>{item?.closing?.user?.name ?? ""}</h4>,
            group: <h4>{item.customerGroup.name}</h4>,
            branch: <h4>{item.branch.name}</h4>,
            closingDate: (
              <div className="inline text-gray-600 text-[0.93em]">
                {item.closing ? (
                  item.closing.date ? (
                    <InfoDateComponent
                      type={typeInfoDate.DateTime}
                      date={item.updatedAt}
                      // className="-ml-14"
                    />
                  ) : (
                    ""
                  )
                ) : (
                  ""
                )}
              </div>
            ),
            startDate: (
              <div className="inline text-gray-600 text-[0.93em]">
                {item?.schedule?.activeDate ? (
                  <InfoDateComponent
                    type={typeInfoDate.DateTime}
                    date={`${item?.schedule?.activeDate}`}
                    className="-ml-14"
                  />
                ) : (
                  ""
                )}
              </div>
            ),
            dueDate: (
              <div className="inline text-gray-600 text-[0.93em]">
                {item?.schedule?.closingDate ? (
                  <InfoDateComponent
                    type={typeInfoDate.DateTime}
                    date={`${item?.schedule?.closingDate}`}
                    className="-ml-14"
                  />
                ) : (
                  ""
                )}
              </div>
            ),

            status: (
              <ButtonStatusComponent
                status={item.status === "1" ? "2" : "0"}
                name={item.status === "0" ? "Open" : "Closed"}
              />
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
            await GetDataServer(DataAPI.SCHEDULELIST).DELETE(item.id);
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
      const getExport: any = await GetDataServer(DataAPI.SCHEDULELIST).FIND({
        limit: 0,
        filters: filter,
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      const getDataExport = getExport.data.map((item: any, index: any) => {
        let notes: string[] = [item.schedule.notes];
        if (item.notes) {
          notes.push(item.notes);
        }
        return {
          No: index + 1,
          "Schedule Name": item.schedule.name,
          "Schedule Status": item.schedule.status,
          Customer: item.customer.name,
          Status: item.status == "0" ? "Open" : "Closed",
          "Start Date": moment(`${item.schedule.activeDate}`).format("l"),
          "Due Date": moment(`${item.schedule.closingDate}`).format("l"),
          "Closing Date": item?.closing?.date
            ? moment(`${item?.closing?.date}`).format("l")
            : "",
          notes: `${notes}`,
          Doc: item?.closing?.doc?.name ?? "",
          Type: item?.closing?.doc?.type ?? "",
          "Closing By": item?.closing?.user?.name ?? "",
          "Created By": item?.createdBy?.name ?? "",
          Group: item?.customerGroup?.name ?? "",
          Branch: item?.branch?.name ?? "",
        };
      });

      const ws = XLSX.utils.json_to_sheet(getDataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      XLSX.writeFile(wb, "schedule.xlsx");
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
                Report Schedules
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
              disabledRadio={true}
              loadingMore={loadingMore}
              disabled={true}
              width="w-[210%]"
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
              localStorage={LocalStorageType.FILTERREPORTSCHEDULE}
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

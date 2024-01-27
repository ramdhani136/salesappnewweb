import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  InfoDateComponent,
} from "../../components/atoms";
import { LocalStorageType, Meta } from "../../utils";
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

export const ReportAssesmentPage: React.FC = (): any => {
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
    title: "Report Assesment -  Sales App Ekatunggal",
    description: "Halaman Report Assesment - sales web system",
  };

  const navigate = useNavigate();

  const columns: IColumns[] = useMemo(
    (): IColumns[] => [
      { header: "Customer", accessor: "customer", className: "max-w-[250px]" },
      { header: "Schedule", accessor: "schedule", className: "w-auto" },
      { header: "Active Date", accessor: "activeDate", className: "w-auto" },
      {
        header: "Deactive Date",
        accessor: "deactiveDate",
        className: "w-auto",
      },
      { header: "Score", accessor: "score", className: "w-auto text-center" },
      { header: "Grade", accessor: "grade", className: "w-auto" },
      { header: "Recomendation", accessor: "rec", className: "w-auto" },
      { header: "Closing By", accessor: "closingBy", className: "w-auto" },
      { header: "", accessor: "createdAt", className: "w-auto" },
    ],
    []
  );
  const getData = async (): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.ASSESMENTRESULT).FIND({
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
            customer: item.customer.name,
            schedule: item.schedule.name,
            score: item.score,
            grade: item.grade ?? "",
            rec: item.notes ?? "",
            closingBy: <h4>{item.createdBy.name}</h4>,
            activeDate: (
              <div className="inline text-gray-600 text-[0.93em]">
                <InfoDateComponent
                  type={typeInfoDate.DateTime}
                  date={item.activeDate}
                  className="-ml-14"
                />
              </div>
            ),
            deactiveDate: (
              <div className="inline text-gray-600 text-[0.93em]">
                <InfoDateComponent
                  type={typeInfoDate.DateTime}
                  date={item.deactiveDate}
                  className="-ml-14"
                />
              </div>
            ),
            createdAt: (
              <div className="inline text-gray-600 text-[0.93em]">
                <InfoDateComponent date={item.createdAt} className="-ml-14" />
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
            case "Customer":
              endpoint = DataAPI.CUSTOMER;
              break;
            case "Schedule":
              endpoint = DataAPI.ASSESMENTSCHEDULE;
              break;
            case "CreatedBy":
              endpoint = DataAPI.USERS;
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

  const ExportToExcel = async () => {
    setLoading(true);
    try {
      const getExport: any = await GetDataServer(DataAPI.ASSESMENTRESULT).FIND({
        limit: 0,
        filters: filter,
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      const getDataExport = getExport.data.map((item: any, index: any) => {
        return {
          no: index + 1,
          schedule: item.schedule.name,
          customer: item.customer.name,
          activeDate: moment(item.activeDate).format("LLL"),
          deactiveDate: moment(item.deactiveDate).format("LLL"),
          createdAt: moment(item.createdAt).format("LLL"),
          score: item.score ?? "",
          grade: item.grade ?? "",
          recomendation: item.notes ?? "",
          createdBy: item.createdBy.name,
        };
      });

      const ws = XLSX.utils.json_to_sheet(getDataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      XLSX.writeFile(wb, "Assesment.xlsx");
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <>
      {Meta(metaData)}
      <div className="w-full h-full overflow-y-auto flex flex-col">
        {!loading ? (
          <>
            <div className=" w-full h-16 flex items-center justify-between">
              <h1
                className="font-bold ml-5 text-[1.1em] mr-2 text-gray-700 cursor-pointer"
                onClick={() => navigate("/report")}
              >
                Report Customer Assesment
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
              width="w-[120%]"
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
              localStorage={LocalStorageType.FILTERREPORTASSESMENT}
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

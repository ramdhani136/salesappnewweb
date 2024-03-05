import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ButtonStatusComponent,
  IconButton,
  InfoDateComponent,
} from "../../components/atoms";
import * as XLSX from "xlsx";
import {
  AlertModal,
  FetchApi,
  LocalStorageType,
  Meta,
  useKey,
} from "../../utils";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import { TableComponent } from "../../components/organisme";
import {
  IColumns,
  IDataTables,
} from "../../components/organisme/TableComponent";
import { LoadingComponent } from "../../components/moleculs";
import { IDataFilter } from "../../components/moleculs/FilterTableComponent";
import moment from "moment";
export const VisitPage: React.FC = (): any => {
  const [data, setData] = useState<IDataTables[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalData, setTotalData] = useState<number>(0);
  const [page, setPage] = useState<String>("1");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [sort, setSort] = useState<any[]>([]);
  const [isSort, setIsort] = useState<string>("updatedAt");
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
  const [selectedData, setSelectedData] = useState<IDataTables[]>([]);

  const metaData = {
    title: "Visit -   Sales App Ekatunggal",
    description: "Halaman visit -  sales web system",
  };

  const navigate = useNavigate();

  const columns: IColumns[] = useMemo(
    () => [
      { header: "Name", accessor: "name" },
      { header: "Customer", accessor: "customer" },
      { header: "Status", accessor: "workflowState" },
      { header: "Type", accessor: "type" },
      { header: "Group", accessor: "group" },
      { header: "Created By", accessor: "createdBy" },
      { header: "", accessor: "updatedAt" },
    ],
    []
  );

  const getData = async (): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.VISIT).FIND({
        limit: limit,
        page: page,
        // fields: ["name", "user.name"],
        filters: filter,
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      if (result.data.length > 0) {
        const generateData = result.data.map((item: any): IDataTables => {
          return {
            id: item._id,
            doc: item.name,
            createdBy: item.createdBy.name,
            name: (
              <Link to={`/visit/${item._id}`}>
                <b className="font-medium">{item.name}</b>
              </Link>
            ),
            customer: <div>{item.customer.name}</div>,
            group: <div>{item.customerGroup.name}</div>,
            type: <div>{item.type === "insite" ? "In Site" : "Out Site"}</div>,

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
            case "Customer":
              endpoint = DataAPI.CUSTOMER;
              break;
            case "Contact":
              endpoint = DataAPI.CONTACT;
              break;
            case "CustomerGroup":
              endpoint = DataAPI.GROUP;
              break;
            case "Branch":
              endpoint = DataAPI.BRANCH;
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

  useKey("n", () => alert("Create new Visit"), {
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

  const ExportToExcel = async () => {
    setLoading(true);
    try {
      const getPermission: any = await FetchApi.post(
        `${import.meta.env.VITE_PUBLIC_URI}/users/getpermission`,
        { doc: "visit", action: "export" }
      );

      if (!getPermission?.data?.status) {
        setLoading(false);
        return AlertModal.Default({
          icon: "error",
          title: "Error",
          text: " Permission Denied!",
        });
      }

      const getExport: any = await GetDataServer(DataAPI.VISIT).FIND({
        limit: 0,
        filters: [...filter],
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      const getDataExport = getExport.data.map((item: any, index: any) => {
        let schedule: String[] = [];

        if (item.schedulelist.length > 0) {
          schedule = item.schedulelist.map((sch: any) => {
            return `${
              sch?.schedule &&
              `${sch?.schedule?.name} - ${sch?.schedule?.notes}`
            }`;
          });
        }

        return {
          no: index + 1,
          name: item.name,
          customer: item.customer.name,
          group: item.customerGroup.name,
          branch: item.branch.name,
          contactName: item?.contact?.name ?? "",
          contactNumber: item?.contact?.phone ?? "",
          schedule: `${schedule}`,
          checkIn_address: item?.checkIn?.address ?? "",
          checkInLat: item?.checkIn?.lat ?? "",
          checkInlng: item?.checkIn?.lng ?? "",
          checkInAt: item?.checkIn?.createdAt
            ? moment(item!.checkIn!.createdAt).format("LLL")
            : "",
          checkOut_address: item?.checkOut?.address ?? "",
          checkOutLat: item?.checkOut?.lat ?? "",
          checkOutlng: item?.checkOut?.lng ?? "",
          checkOutAt: item?.checkOut?.createdAt
            ? moment(item!.checkOut!.createdAt).format("LLL")
            : "",
          status: item.status,
          workState: item.workflowState,
          createdAt: moment(item.createdAt).format("LLL"),
          updatedAt: moment(item.updatedAt).format("LLL"),
          createdBy: item.createdBy.name,
        };
      });

      const ws = XLSX.utils.json_to_sheet(getDataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      XLSX.writeFile(wb, `visit.xlsx`);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const onDelete = () => {
    AlertModal.confirmation({
      onConfirm: async (): Promise<void> => {
        const data: any[] = selectedData;
        setLoading(true);
        try {
          setActiveProgress(true);
          for (const item of data) {
            await GetDataServer(DataAPI.VISIT).DELETE(item.id);
            const index = data.indexOf(item);
            let percent = (100 / data.length) * (index + 1);
            setCurrentIndex(index);
            setOnDeleteProgress(item.doc);
            setCurrentPercent(percent);
            setTotalIndex(data.length);
          }
          setSelectedData([]);
          // getAllData();
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
  };

  return (
    <>
      {Meta(metaData)}
      <div className="w-full h-full overflow-y-auto flex flex-col">
        {!loading ? (
          <>
            <div className=" w-full h-16 flex items-center justify-between">
              <h1 className="font-bold ml-5 text-[1.1em] mr-2 text-gray-700 ">
                Visit List
              </h1>
              <div className="flex-1  flex items-center justify-end mr-4">
                {/* <IconButton
                  Icon={AddIcon}
                  name="Add visit"
                  className={`opacity-80 hover:opacity-100 duration-100 ${
                    getSelected().length > 0 && "hidden"
                  } `}
                  callback={() => navigate("/visit/new")}
                /> */}

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
              customButton={[
                {
                  title: "Export",
                  onCLick: ExportToExcel,
                  status: true,
                  className:
                    "bg-green-700 border-green-800 hover:bg-green-800 hover:border-green-900",
                },
              ]}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
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
              localStorage={LocalStorageType.FILTERVISIT}
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

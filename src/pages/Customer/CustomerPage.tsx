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
import AddIcon from "@mui/icons-material/Add";
import { TableComponent } from "../../components/organisme";
import {
  IColumns,
  IDataTables,
} from "../../components/organisme/TableComponent";
import { LoadingComponent } from "../../components/moleculs";
import { IDataFilter } from "../../components/moleculs/FilterTableComponent";
import moment from "moment";

export const CustomerPage: React.FC<any> = ({ props }): any => {
  const modal = props ? props.modal ?? false : false;
  const [data, setData] = useState<IDataTables[]>([]);
  const [selectedData, setSelectedData] = useState<IDataTables[]>([]);
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

  const metaData = {
    title: "Customer -  Sales App Ekatunggal",
    description: "Halaman Customer - sales web system",
  };

  const navigate = useNavigate();

  let columns: IColumns[] = [];

  if (!modal) {
    columns = useMemo(
      () => [
        { header: "Name", accessor: "name", className: "w-auto" },
        { header: "Status", accessor: "workflowState", className: "w-auto" },
        { header: "Group", accessor: "group", className: "w-auto" },
        { header: "Branch", accessor: "branch", className: "w-auto" },
        { header: "User", accessor: "user", className: "w-auto" },
        { header: "", accessor: "updatedAt", className: "w-auto" },
      ],
      []
    );
  } else {
    columns = useMemo(
      () => [
        { header: "Name", accessor: "name", className: "w-auto" },
        { header: "Status", accessor: "workflowState", className: "w-auto" },
        { header: "Group", accessor: "group", className: "w-auto" },
        { header: "User", accessor: "user", className: "w-auto" },
        { header: "", accessor: "updatedAt", className: "w-auto" },
      ],
      []
    );
  }

  const getData = async (): Promise<any> => {
    try {
      let current: String = "";
      if (modal) {
        if (props.params) {
          current = props.params;
        }
      }

      const result: any = await GetDataServer(DataAPI.CUSTOMER).FIND({
        limit: limit,
        page: page,
        filters: [...filter],
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
        params: current !== "" ? current : "",
      });

      if (result.data.length > 0) {
        const generateData = result.data.map((item: any): IDataTables => {
          return {
            id: item._id,
            doc: item.name,
            name: (
              <Link to={`/customer/${item._id}`}>
                <b className="font-medium">{item.name}</b>
              </Link>
            ),
            user: <div>{item.createdBy.name}</div>,
            group: <div>{item.customerGroup.name}</div>,
            branch: <div>{item.branch.name}</div>,

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
            case "Contact":
              endpoint = DataAPI.CONTACT;
              break;
            case "CustomerGroup":
              endpoint = DataAPI.GROUP;
              break;
            case "Branch":
              endpoint = DataAPI.BRANCH;
              break;
            case "Workflow State":
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

  useKey("n", () => alert("Create new Customer"), {
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
        { doc: "customer", action: "export" }
      );

      if (!getPermission?.data?.status) {
        setLoading(false);
        return AlertModal.Default({
          icon: "error",
          title: "Error",
          text: " Permission Denied!",
        });
      }

      const getExport: any = await GetDataServer(DataAPI.CUSTOMER).FIND({
        limit: 0,
        filters: [...filter],
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      const getDataExport = getExport.data.map((item: any, index: any) => {
        return {
          no: index + 1,
          name: item.name,
          group: item.customerGroup.name,
          branch: item.branch.name,
          status: item.status == "0" ? "Disabled" : "Enabled",
          workState: item.workflowState,
          erpId: item.erpId,
          createdAt: moment(item.createdAt).format("LLL"),
          updatedAt: moment(item.updatedAt).format("LLL"),
          createdBy: item.createdBy.name,
          latituteCordinate: item?.location?.coordinates[1] ?? "",
          longituteCordinate: item?.location?.coordinates[0] ?? "",
        };
      });

      const ws = XLSX.utils.json_to_sheet(getDataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      XLSX.writeFile(wb, `customer.xlsx`);
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
            await GetDataServer(DataAPI.CUSTOMER).DELETE(item.id);
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
          getAllData();
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
                Customer List
              </h1>
              <div className="flex-1  flex items-center justify-end mr-4">
                {!modal && (
                  <IconButton
                    Icon={AddIcon}
                    name="Add New"
                    className={`opacity-80 hover:opacity-100 duration-100 ${
                      selectedData.length > 0 && "hidden"
                    } `}
                    callback={() => navigate("/customer/new")}
                  />
                )}

                {modal && (
                  <IconButton
                    Icon={AddIcon}
                    name="Add Customer"
                    className={`opacity-80 hover:opacity-100 duration-100 ${
                      selectedData.length === 0 && "hidden"
                    } `}
                    callback={() => props.AddCustomer(selectedData)}
                  />
                )}

                {!modal && (
                  <IconButton
                    name="Action"
                    className={`duration-100 ${
                      selectedData.length === 0 && "hidden"
                    }`}
                    list={[{ name: "Delete", onClick: onDelete }]}
                  />
                )}
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
              localStorage={LocalStorageType.FILTERCUSTOMER}
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

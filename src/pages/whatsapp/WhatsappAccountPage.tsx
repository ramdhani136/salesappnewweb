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
import { useDispatch } from "react-redux";
import { modalSet } from "../../redux/slices/ModalSlice";
import WhatsappQrViewPage from "./WhatsappQrViewPage";

export const WhatsappAccountPage: React.FC = (): any => {
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
  const [selectedData, setSelectedData] = useState<IDataTables[]>([]);

  const metaData = {
    title: "Whatsapp Account -  Sales App Ekatunggal",
    description: "Halaman Whatsapp Account - sales web system",
  };

  const navigate = useNavigate();

  const columns: IColumns[] = useMemo(
    () => [
      { header: "Name", accessor: "name" },
      { header: "Status", accessor: "status" },
      { header: "Account", accessor: "account" },
      { header: "Phone", accessor: "phone" },
      { header: "User", accessor: "user" },
      { header: "", accessor: "updatedAt" },
    ],
    []
  );

  const dispatch = useDispatch();

  const getData = async (): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.WAACCOUNT).FIND({
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
            doc: item.name,
            name: (
              <b
                onClick={() => {
                  dispatch(
                    modalSet({
                      active: true,
                      Children: WhatsappQrViewPage,
                      title: "",
                      props: {
                        id: item._id,
                        name: item.name,
                        onClose: getData,
                      },
                      className: "",
                    })
                  );
                }}
                className="font-medium"
              >
                {item.name}
              </b>
            ),
            user: <div>{item.createdBy.name}</div>,
            status: (
              <ButtonStatusComponent
                status={item.status == "Connected" ? "1" : "0"}
                name={item.status}
              />
            ),
            account: <div>{item.account}</div>,
            phone: <div>{item.phone}</div>,
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
            case "Name":
              endpoint = DataAPI.WAACCOUNT;
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

  useKey("n", () => alert("Create new Account"), {
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
            await GetDataServer(DataAPI.WAACCOUNT).DELETE(item.id);
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
                Whatsapp Account List
              </h1>
              <div className="flex-1  flex items-center justify-end mr-4">
                <IconButton
                  Icon={AddIcon}
                  name="Add Account"
                  className={`opacity-80 hover:opacity-100 duration-100 ${
                    selectedData.length > 0 && "hidden"
                  } `}
                  callback={() => navigate("/waacount/new")}
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
              localStorage={LocalStorageType.FILTERWAACCOUNT}
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

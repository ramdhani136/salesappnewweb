import moment from "moment";
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import {
  ButtonStatusComponent,
  InfoDateComponent,
} from "../../components/atoms";
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
import { CustomerPage } from "../Customer/CustomerPage";
import Swal from "sweetalert2";

interface IProps {
  props: any;
}

const ListItemSchedule: React.FC<IProps> = ({ props }) => {
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

  const columns: IColumns[] = useMemo(
    (): IColumns[] => [
      { header: "Customer", accessor: "customer", className: "w-auto" },
      { header: "Status", accessor: "status", className: "w-auto" },
      { header: "Group", accessor: "group", className: "w-auto" },
      { header: "Branch", accessor: "branch", className: "w-auto" },
      { header: "", accessor: "updatedAt", className: "w-auto" },
    ],
    []
  );

  const AddCustomer = async (selectedData: any[]) => {
    AlertModal.confirmation({
      confirmButtonText: "Yes",
      onConfirm: async (): Promise<void> => {
        setLoading(true);
        try {
          dispatch(
            modalSet({
              active: false,
              Children: null,
              title: "",
              props: {},
              className: "",
            })
          );
          setActiveProgress(true);
          for (let i = 0; i < selectedData.length; i++) {
            await GetDataServer(DataAPI.SCHEDULELIST).CREATE({
              customer: selectedData[i].id,
              schedule: docId,
            });
            let percent = (100 / selectedData.length) * (i + 1);
            setCurrentIndex(i);
            setOnDeleteProgress(selectedData[i].code);
            setCurrentPercent(percent);
            setTotalIndex(selectedData.length);
          }
          setActiveProgress(false);
          onRefresh();
        } catch (error: any) {
          Swal.fire(
            "Error!",
            `${
              error.response.data.msg
                ? error.response.data.msg
                : error.message
                ? error.message
                : "Error Insert"
            }`,
            "error"
          );
          onRefresh();
          setLoading(false);
          setActiveProgress(false);
        }
      },
    });
    // try {
    //   setLoading(true);
    //   dispatch(
    //     modalSet({
    //       active: false,
    //       Children: null,
    //       title: "",
    //       props: {},
    //       className: "",
    //     })
    //   );
    //   for (const item of data) {
    //     await GetDataServer(DataAPI.SCHEDULELIST).CREATE({
    //       customer: item.id,
    //       schedule: docId,
    //     });
    //   }
    //   getData();
    // } catch (error: any) {
    //   Swal.fire(
    //     "Error!",
    //     `${
    //       error.response.data.msg
    //         ? error.response.data.msg
    //         : error.message
    //         ? error.message
    //         : "Error Insert"
    //     }`,
    //     "error"
    //   );
    // }
  };

  const getAllList = async () => {
    try {
      const result: any = await GetDataServer(DataAPI.SCHEDULELIST).FIND({
        filters: [...filter, ["schedule", "=", `${docId}`]],
        limit: 0,
        fields: ["customer"],
      });
      return result.data;
    } catch (error) {}
    return [];
  };

  const ShowModalCustomer = async () => {
    dispatch(
      modalSet({
        active: true,
        Children: CustomerPage,
        title: "",
        props: {
          modal: true,
          onRefresh: getData,
          AddCustomer: AddCustomer,
          curentData: await getAllList(),
        },
        className: "w-[900px] h-[98%]",
      })
    );
  };

  const getData = async (props?: { refresh?: boolean }): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.SCHEDULELIST).FIND({
        filters: [...filter, ["schedule", "=", `${docId}`]],
        limit: limit,
        page: props?.refresh ? 1 : page,
        orderBy: { sort: isOrderBy, state: isSort },
        search: props?.refresh ? "" : search,
      });
      if (result.data.length > 0) {
        const generateData = result.data.map((item: any): IDataTables => {
          return {
            id: item._id,
            checked: false,
            customerId: item.customer._id,
            customer: <b className="font-medium">{item.customer.name}</b>,
            group: <h4>{item.customerGroup.name}</h4>,
            branch: <h4>{item.branch.name}</h4>,
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
              setPage(1);
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
            await GetDataServer(DataAPI.SCHEDULELIST).DELETE(item.id);
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
            // width="w-[120%]"
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
            ShowModalCustomer();
          }}
          className="duration-100 hover:cursor-pointer hover:bg-gray-200 border px-2 py-1 ml-1 rounded-md inline bg-gray-100 text-[0.95em]"
        >
          Add Row
        </a>
      )}
    </>
  );
};

export default React.memo(ListItemSchedule);

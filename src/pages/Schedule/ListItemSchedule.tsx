import moment from "moment";
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
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
import { typeInfoDate } from "../../components/atoms/InfoDateComponent";
import EditIcon from "@mui/icons-material/Edit";

interface IProps {
  props: any;
}

const ListItemSchedule: React.FC<IProps> = ({ props }) => {
  const docId = props.docId;
  const docData = props.data;
  const [data, setData] = useState<IDataTables[]>([]);
  const [selectedData, setSelectedData] = useState<IDataTables[]>([]);
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
      { header: "Customer", accessor: "customer", className: "w-[350px]" },
      { header: "Status", accessor: "status", className: "w-auto" },
      { header: "Task", accessor: "note", className: "w-auto" },
      { header: "Closing Date", accessor: "closingDate", className: "w-auto" },
      { header: "Doc", accessor: "doc", className: "w-auto" },
      { header: "Type", accessor: "docType", className: "w-auto" },
      { header: "Closing By", accessor: "closingBy", className: "w-auto" },
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
          params: `current={doc:viscall,id:${docId}}`,
        },
        className: "w-[1080px] h-[98%]",
      })
    );
  };

  const ShowEditorList = async (data: any) => {
    dispatch(
      modalSet({
        active: true,
        Children: ModalList,
        title: "",
        props: {
          modal: true,
          onRefresh: getData,
          data: data,
        },
        className: "w-[800px] h-[400px]",
      })
    );
  };

  const ModalList: React.FC<any> = ({ props }) => {
    const [note, setNote] = useState<string>(props?.data?.notes ?? "");

    const OnSave = async () => {
      try {
        await GetDataServer(DataAPI.SCHEDULELIST).UPDATE({
          id: props.data._id,
          data: {
            notes: note,
          },
        });
        if (props?.onRefresh) {
          props.onRefresh();
          dispatch(
            modalSet({
              active: false,
              Children: null,
              title: "",
              props: {},
              className: "",
            })
          );
        }
      } catch (error) {}
    };

    return (
      <div className="p-3">
        <h4 className="font-semibold">{props?.data?.customer?.name ?? ""}</h4>
        <textarea
          value={note}
          name="note"
          onChange={(e) => {
            setNote(e.target.value);
          }}
          className="border rounded-md h-[300px] w-full py-1 px-2 mt-2"
        />
        <button
          onClick={OnSave}
          className="border rounded-md px-2 py-[2px] mt-2 bg-green-600 text-white float-right"
        >
          Save
        </button>
      </div>
    );
  };

  const getConfig = async (): Promise<{ call: boolean; vis: boolean }> => {
    try {
      const result: any = await GetDataServer(DataAPI.CONFIG).FIND({});

      return {
        call: result?.data?.callsheet?.mandatoryCustScheduleNote ?? false,
        vis: result?.data?.visit?.mandatoryCustScheduleNote ?? false,
      };
    } catch (error) {
      return {
        call: false,
        vis: false,
      };
    }
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
        let mandatoryNotes: boolean = false;
        const getMandatoryNotes = await getConfig();
        if (docData.type == "callsheet") {
          mandatoryNotes = getMandatoryNotes.call;
        } else {
          mandatoryNotes = getMandatoryNotes.vis;
        }
        const generateData = result.data.map((item: any): IDataTables => {
          return {
            id: item._id,
            customerId: item.customer._id,
            note: (
              <div className="relative">
                <textarea
                  onClick={() => alert("ddd")}
                  disabled
                  value={item?.notes ?? ""}
                  className={` relative bg-gray-50 border rounded-md w-[300px] px-2 py-1 ${
                    mandatoryNotes &&
                    !item.notes &&
                    docData.status == 0 &&
                    "border-red-600"
                  } `}
                />
                {docData.status == 0 && (
                  <EditIcon
                    onClick={() => {
                      ShowEditorList(item);
                    }}
                    style={{ color: "white" }}
                    className="absolute border rounded-full p-1 bg-green-800 opacity-80 hover:opacity-100 duration-300"
                  />
                )}
              </div>
            ),
            customer: <b className="font-medium">{item.customer.name}</b>,
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
                      className="-ml-14"
                    />
                  ) : (
                    ""
                  )
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
        // setListFilter(result.filters);
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
          setSelectedData([]);
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

  const ExportToExcel = async () => {
    setLoading(true);
    try {
      const getExport: any = await GetDataServer(DataAPI.SCHEDULELIST).FIND({
        limit: 0,
        filters: [...filter, ["schedule", "=", `${docId}`]],
        orderBy: { sort: isOrderBy, state: isSort },
        search: search,
      });

      const getDataExport = getExport.data.map((item: any, index: any) => {
        return {
          no: index + 1,
          schedule: item.schedule.name,
          active_date: moment(item.schedule.actieDate).format("LLL"),
          closing_date: moment(item.schedule.closingDate).format("LLL"),
          customer: item.customer.name,
          group: item.customerGroup.name,
          branch: item.branch.name,
          notes: item?.notes
            ? `${item.schedule.notes} & ${item.notes}`
            : item?.schedule?.notes,
          status: item.status == "0" ? "Open" : "Closed",
          createdBy: item.createdBy.name,
        };
      });

      const ws = XLSX.utils.json_to_sheet(getDataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      XLSX.writeFile(wb, `${docData.name}.xlsx`);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

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
            customButton={[
              {
                title: "Export",
                onCLick: ExportToExcel,
                status: docData.status !== "0" ? true : false,
                className:
                  "bg-green-700 border-green-800 hover:bg-green-800 hover:border-green-900",
              },
            ]}
            selectedData={selectedData}
            setSelectedData={setSelectedData}
            width="w-[150%]"
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

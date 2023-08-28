import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  ButtonStatusComponent,
  IconButton,
  InputComponent,
  Select,
  TimeLineVertical,
  ToggleBodyComponent,
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, LocalStorage, Meta } from "../../utils";
import ListItemSchedule from "./ListItemSchedule";
import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { modalSet } from "../../redux/slices/ModalSlice";

const FormSchedulePage: React.FC<any> = ({ props }) => {
  const modal = props ? props.modal ?? false : false;

  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${id ? data.name??"Loading .." : "New Schedule"} - Sales App Ekatunggal`,
    description: "Halaman form schedule  Sales  web system",
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser: any = LocalStorage.getUser();
  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const [loadingNaming, setLoadingName] = useState<boolean>(true);
  const [listNaming, setListNaming] = useState<IListInput[]>([]);
  const [user, setUser] = useState<IValue>({
    valueData: currentUser._id,
    valueInput: currentUser.name,
  });
  const [type, setType] = useState<string>("all");
  const [notes, setNotes] = useState<string>("");
  const [startDate, setStartDate] = useState<IValue>({
    valueData: null,
    valueInput: "",
  });

  const [naming, setNaming] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [progress, setProgress] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [dueDate, setDueDate] = useState<IValue>({
    valueData: null,
    valueInput: "",
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);
  const [prevData, setPrevData] = useState<any>({
    type: type,
    notes: notes,
    startDate: startDate.valueData,
    dueDate: dueDate.valueData,
  });
  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.SCHEDULE).FINDONE(`${id}`);

      if (result?.progress) {
        setProgress({
          valueData: result.progress,
          valueInput: `${result.progress}% (${result.closed} Of ${
            result.open + result.closed
          })`,
        });
      }

      // set workflow
      if (result.workflow.length > 0) {
        const isWorkflow = result.workflow.map((item: any): IListIconButton => {
          return {
            name: item.action,
            onClick: () => {
              AlertModal.confirmation({
                onConfirm: () => {
                  onSave(item.nextState.id);
                },
                confirmButtonText: "Yes, Save it!",
              });
            },
          };
        });

        setWorkflow(isWorkflow);
      }
      // end

      setHistory(result.history);

      setData(result.data);

      setType(result.data.type);
      setNotes(result.data.notes);
      setUser({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });
      setName({
        valueData: result.data.name,
        valueInput: result.data.name,
      });
      setCreatedAt({
        valueData: moment(result.data.createdAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.createdAt).format("YYYY-MM-DD"),
      });
      setStartDate({
        valueData: moment(result.data.activeDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.activeDate).format("YYYY-MM-DD"),
      });
      setDueDate({
        valueData: moment(result.data.closingDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.closingDate).format("YYYY-MM-DD"),
      });
      setPrevData({
        type: result.data.type,
        notes: result.data.notes,
        startDate: moment(result.data.activeDate).format("YYYY-MM-DD"),
        dueDate: moment(result.data.closingDate).format("YYYY-MM-DD"),
      });
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/schedule");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.SCHEDULE).DELETE(`${id}`);
          navigate("/schedule");
        } catch (error: any) {
          setLoading(false);
          Swal.fire(
            "Error!",
            `${
              error.response.data.msg
                ? error.response.data.msg
                : error.message
                ? error.message
                : "Error Delete"
            }`,
            "error"
          );
        }
      };

      AlertModal.confirmation({ onConfirm: progress });
    }
  };

  const onSave = async (nextState?: string): Promise<any> => {
    setLoading(true);
    try {
      let data: any = {};
      if (nextState) {
        data = {
          nextState: nextState,
        };
      } else {
        if (!notes) {
          throw new Error("Notes wajib diisi!");
        }
        data = {
          type: type,
          notes: notes,
          activeDate: startDate.valueData,
          closingDate: dueDate.valueData,
          namingSeries: naming.valueData,
        };
      }

      let Action =
        id && !modal
          ? GetDataServer(DataAPI.SCHEDULE).UPDATE({ id: id, data: data })
          : modal
          ? GetDataServer(DataAPI.SCHEDULE).CREATE(
              data,
              `/duplicate/${props.scheduleId}`
            )
          : GetDataServer(DataAPI.SCHEDULE).CREATE(data);

      const result = await Action;

      if (id && !modal) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(`/schedule/${result.data.data._id}`);
        navigate(0);
      }
    } catch (error: any) {
      Swal.fire(
        "Error!",
        `${
          error?.response?.data?.msg
            ? error.response.data.msg
            : error?.message
            ? error.message
            : "Error Insert"
        }`,
        "error"
      );
    }
    setLoading(false);
  };

  const dataType: any[] = [
    { title: "Visit", value: "visit" },
    { title: "Callsheet", value: "callsheet" },
    { title: "All", value: "all" },
  ];

  const getNaming = async (): Promise<void> => {
    try {
      const result: any = await GetDataServer(DataAPI.NAMING).FIND({
        filters: [["doc", "=", "schedule"]],
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });

        if (listInput.length === 1) {
          setNaming({
            valueData: listInput[0].value,
            valueInput: listInput[0].name,
          });
        }

        setListNaming(listInput);
      }
      setLoadingName(false);
    } catch (error) {
      setLoadingName(false);
    }
  };

  useEffect(() => {
    if (id && !modal) {
      getData();
      setListMoreAction([
        { name: "Delete", onClick: onDelete },
        { name: "Duplicate", onClick: getFormDuplicate },
      ]);
    } else {
      getNaming();
      setLoading(false);
      setListMoreAction([]);
    }
  }, []);

  // Cek perubahan
  useEffect(() => {
    const actualData = {
      type: type,
      notes: notes,
      startDate: startDate.valueData,
      dueDate: dueDate.valueData,
    };

    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [startDate, dueDate, type, notes]);
  // End

  const getFormDuplicate = (): void => {
    dispatch(
      modalSet({
        active: true,
        Children: FormSchedulePage,
        className: "w-[63%] h-[98%]",
        props: {
          modal: true,
          scheduleId: id,
        },
        title: "Form Schedule",
      })
    );
  };

  return (
    <>
      {Meta(metaData)}
      <div
        className="  max-h-[calc(100vh-70px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-300"
        onScroll={(e: any) => setScroll(e.target.scrollTop)}
      >
        {!loading ? (
          <>
            <div
              className={`w-full flex  justify-between px-5 ${
                scroll > 0
                  ? "bg-white border-b border-gray-100 drop-shadow-sm py-6"
                  : "bg-gray-100"
              } py-5 sticky top-0 z-[51] duration-500`}
            >
              <div className="flex  items-center">
                <h4
                  onClick={() => navigate("/schedule")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Schedule" : data.name}
                </h4>
                <div className="text-md">
                  <ButtonStatusComponent
                    // className="text-[0.7em]"
                    status={data.status ?? "0"}
                    name={data.workflowState ?? "Not Save"}
                  />
                </div>
              </div>
              <div className="flex">
                {listMoreAction.length > 0 && (
                  <IconButton
                    classModal="top-[29px]"
                    primary
                    Icon={MoreHorizIcon}
                    iconSize={15}
                    classIcon="mt-1"
                    list={listMoreAction}
                    iconListDisabled
                    className={` duration-100 mr-2 px-2 `}
                  />
                )}

                {isChangeData && (
                  <IconButton
                    name={id && !modal ? "Update" : "Save"}
                    callback={() => {
                      AlertModal.confirmation({
                        onConfirm: () => {
                          onSave();
                        },
                        confirmButtonText: "Yes, Save it!",
                      });
                    }}
                    className={`opacity-80 hover:opacity-100 duration-100  `}
                  />
                )}
                {!isChangeData && id && workflow.length > 0 && (
                  <IconButton
                    name="Actions"
                    list={workflow}
                    callback={onSave}
                    className={`opacity-80 hover:opacity-100 duration-100  `}
                  />
                )}
              </div>
            </div>
            <div className=" px-5 flex flex-col ">
              <div className="border w-full flex-1  bg-white rounded-md">
                <div className="w-full h-auto  rounded-md p-3 py-5">
                  <div className=" w-1/2 px-4 float-left ">
                    {(!id || modal) && (
                      <InputComponent
                        loading={loadingNaming}
                        label="Naming Series"
                        value={naming}
                        className="h-[38px]  mb-4"
                        onChange={(e) =>
                          setNaming({ ...naming, valueInput: e })
                        }
                        onSelected={(e) => {
                          setNaming({
                            valueData: e.value,
                            valueInput: e.name,
                          });
                        }}
                        onCLick={getNaming}
                        list={listNaming}
                        mandatoy
                        modalStyle="top-9 max-h-[160px]"
                        onReset={() =>
                          setNaming({ valueData: null, valueInput: "" })
                        }
                        disabled={
                          id != null
                            ? data.status !== "0" && !modal
                              ? true
                              : false
                            : false
                        }
                        closeIconClass="top-[13.5px]"
                      />
                    )}
                    {id && !modal && (
                      <InputComponent
                        label="Name"
                        value={name}
                        className="h-[38px] mb-4"
                        type="text"
                        onChange={(e) =>
                          setName({
                            valueData: e,
                            valueInput: e,
                          })
                        }
                        disabled
                      />
                    )}
                    <Select
                      title="Doc"
                      data={dataType}
                      value={type}
                      setValue={setType}
                      disabled={id !== undefined && data.status != 0 && !modal}
                    />

                    <InputComponent
                      label="Date"
                      value={createdAt}
                      className="h-[38px]  mb-4"
                      type="date"
                      onChange={(e) =>
                        setCreatedAt({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <label className="text-sm">Notes</label>
                    <textarea
                      className="border mt-1 p-2 text-md bg-gray-50  w-full rounded-md h-[150px] mb-10"
                      name="Site Uri"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={id !== undefined && data.status != 0 && !modal}
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-4">
                    <InputComponent
                      disabled={id !== undefined && data.status != 0 && !modal}
                      label="Start Date"
                      value={startDate}
                      className="h-[38px] mb-4"
                      type="date"
                      onChange={(e) => {
                        setStartDate({
                          valueData: e,
                          valueInput: e,
                        });
                        if (
                          moment(Number(new Date(e))).format("YYYY-MM-DD") >
                          moment(Number(new Date(dueDate.valueData))).format(
                            "YYYY-MM-DD"
                          )
                        ) {
                          setDueDate({
                            valueData: e,
                            valueInput: e,
                          });
                        }
                      }}
                      min={moment(Number(new Date())).format("YYYY-MM-DD")}
                      mandatoy
                    />
                    {startDate.valueData && (
                      <InputComponent
                        disabled={
                          id !== undefined && data.status != 0 && !modal
                        }
                        label="Closing Date"
                        value={dueDate}
                        className="h-[38px]  mb-4"
                        type="date"
                        onChange={(e) =>
                          setDueDate({
                            valueData: e,
                            valueInput: e,
                          })
                        }
                        mandatoy
                        min={startDate.valueData}
                      />
                    )}
                    <InputComponent
                      label="Created By"
                      value={user}
                      className="h-[38px]   mb-4"
                      disabled
                    />
                    {id && !modal && (
                      <InputComponent
                        label="Progress"
                        value={progress}
                        type="text"
                        className="h-[38px] mb-4"
                        disabled
                      />
                    )}
                  </div>
                </div>
              </div>
              {id && !modal && (
                <ToggleBodyComponent
                  name="Customer List"
                  className="mt-5"
                  child={<ListItemSchedule props={{ docId: id, data: data }} />}
                />
              )}
              <TimeLineVertical data={history} />
            </div>
          </>
        ) : (
          <LoadingComponent />
        )}
      </div>
    </>
  );
};

export default FormSchedulePage;

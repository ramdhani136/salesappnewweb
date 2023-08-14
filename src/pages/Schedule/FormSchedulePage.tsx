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
import {
  IListInput,
  IValue,
  TypeField,
} from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, LocalStorage, Meta } from "../../utils";
import ListItemSchedule from "./ListItemSchedule";
import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";

const FormSchedulePage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${id ? data.name : "New Schedule"} - Sales App Ekatunggal`,
    description: "Halaman form schedule  Sales  web system",
  };

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
  const [notes, setNotes] = useState<IValue>({ valueData: "", valueInput: "" });
  const [startDate, setStartDate] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });
  const [naming, setNaming] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [dueDate, setDueDate] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
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

      // set workflow
      if (result.workflow.length > 0) {
        const isWorkflow = result.workflow.map((item: any): IListIconButton => {
          return {
            name: item.action,
            onClick: () => {
              onSave(item.nextstate.id);
            },
          };
        });

        setWorkflow(isWorkflow);
      }
      // end

      setHistory(result.history);

      setData(result.data);

      setType(result.data.type);
      setNotes({ valueData: result.data.notes, valueInput: result.data.notes });
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
        valueData: moment(result.data.startDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.startDate).format("YYYY-MM-DD"),
      });
      setDueDate({
        valueData: moment(result.data.dueDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.dueDate).format("YYYY-MM-DD"),
      });
      setPrevData({
        type: result.data.type,
        notes: result.data.notes,
        startDate: moment(result.data.startDate).format("YYYY-MM-DD"),
        dueDate: moment(result.data.dueDate).format("YYYY-MM-DD"),
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
      let data: any = {
        type: type,
        notes: notes.valueData,
        activeDate: startDate.valueData,
        closingDate: dueDate.valueData,
        namingSeries: naming.valueData,
      };
      if (nextState) {
        data.nextState = nextState;
      }

      let Action = id
        ? GetDataServer(DataAPI.SCHEDULE).UPDATE({ id: id, data: data })
        : GetDataServer(DataAPI.SCHEDULE).CREATE(data);

      const result = await Action;
      navigate(`/schedule/${result.data.data._id}`);
      if (id) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(0);
      }
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
    if (id) {
      getData();
      setListMoreAction([{ name: "Delete", onClick: onDelete }]);
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
      notes: notes.valueData,
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
                    name={id ? "Update" : "Save"}
                    callback={onSave}
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
              <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none h-auto float-left">
                <div className="w-full h-auto   rounded-md p-3 py-5 float-left">
                  <div className=" w-1/2 px-4 float-left ">
                    {!id && (
                      <InputComponent
                        loading={loadingNaming}
                        label="Naming Series"
                        value={naming}
                        className="h-[38px]   text-[0.93em] mb-3"
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
                            ? data.status !== "0"
                              ? true
                              : false
                            : false
                        }
                        closeIconClass="top-[13.5px]"
                      />
                    )}
                    {id && (
                      <InputComponent
                        label="Name"
                        value={name}
                        className="h-[38px]  text-[0.93em] mb-3"
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
                      disabled={id !== undefined && data.status != 0}
                    />

                    <InputComponent
                      label="Date"
                      value={createdAt}
                      className="h-[38px]  text-[0.93em] mb-3"
                      type="date"
                      onChange={(e) =>
                        setCreatedAt({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <InputComponent
                      mandatoy
                      typeField={TypeField.TEXTAREA}
                      label="Notes"
                      value={notes}
                      className="h-40  text-[0.93em] mb-3"
                      inputStyle="h-40"
                      type="text"
                      onChange={(e) =>
                        setNotes({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
                    <InputComponent
                      disabled={id !== undefined && data.status != 0}
                      label="Start Date"
                      value={startDate}
                      className="h-[38px]  text-[0.93em] mb-3"
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
                        disabled={id !== undefined && data.status != 0}
                        label="Closing Date"
                        value={dueDate}
                        className="h-[38px]  text-[0.93em] mb-3"
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
                      className="h-[38px]   text-[0.93em] mb-3"
                      onChange={(e) =>
                        setUser({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                  </div>
                </div>
              </div>
              {id && (
                <ToggleBodyComponent
                  name="Customer List"
                  className="mt-5"
                  child={<ListItemSchedule props={data} />}
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

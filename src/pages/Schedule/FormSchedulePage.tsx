import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  ButtonStatusComponent,
  IconButton,
  InputComponent,
  TimeLineVertical,
  ToggleBodyComponent,
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, Meta } from "../../utils";
import ListItemSchedule from "./ListItemSchedule";
import { IListIconButton } from "../../components/atoms/IconButton";

interface IAllow {
  barcode: boolean;
  manual: boolean;
}

const FormSchedulePage: React.FC = () => {
  const metaData = {
    title: "New Schedule - Stock App Ekatunggal",
    description: "Halaman form schedule stock opname web system",
  };

  const navigate = useNavigate();
  let { id } = useParams();

  const [data, setData] = useState<any>({});
  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const [prevData, setPrevData] = useState<any>({});
  const [user, setUser] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [startDate, setStartDate] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });
  const [dueDate, setDueDate] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });
  const [warehouse, setWarehouse] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [allow, setAllow] = useState<IAllow>({ barcode: true, manual: false });

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWarehouse, setLoadingWarehouse] = useState<boolean>(true);

  const [listWarehouse, setListWarehouse] = useState<IListInput[]>([]);
  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.SCHEDULE).FINDONE(`${id}`);

      // set workflow
      if (result.workflow.length > 0) {
        const isWorkflow = result.workflow.map((item: any): IListIconButton => {
          return {
            name: item.name,
            onClick: () => {
              onSave({
                id_workflow: item.id_workflow,
                id_state: item.nextstate.id,
              });
            },
          };
        });

        setWorkflow(isWorkflow);
      }
      // end

      setHistory(result.history);

      setData(result.data);

      setAllow(result.data.allow);

      setWarehouse({
        valueData: result.data.warehouse,
        valueInput: result.data.warehouse,
      });
      setUser({
        valueData: result.data.user._id,
        valueInput: result.data.user.name,
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
        startDate: moment(result.data.startDate).format("YYYY-MM-DD"),
        dueDate: moment(result.data.dueDate).format("YYYY-MM-DD"),
        allow: result.data.allow,
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

  

  const getWarehouse = async (): Promise<void> => {
    try {
      const result: any = await GetDataServer(DataAPI.WAREHOUSE).FIND({});
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: IListInput) => {
          return {
            name: item.name,
            value: item.name,
          };
        });
        setListWarehouse(listInput);
      }
      setLoadingWarehouse(false);
    } catch (error) {
      setLoadingWarehouse(false);
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.SCHEDULE).DELETE(`${id}`);
          navigate("/schedule");
        } catch (error) {
          console.log(error);
        }
      };

      AlertModal.confirmation({ onConfirm: progress });
    }
  };

  const onSave = async (data: {}): Promise<any> => {
    const progress = async (): Promise<void> => {
      if (allow.barcode === false && allow.manual === false) {
        AlertModal.Default({
          icon: "error",
          title: "Error",
          text: "Allow required",
        });
        return;
      }
      try {
        setLoading(true);
        let result: any;

        if (!id) {
          result = await GetDataServer(DataAPI.SCHEDULE).CREATE({
            startDate: startDate.valueData,
            dueDate: dueDate.valueData,
            workflowState: "Draft",
            status: "0",
            warehouse: warehouse.valueData,
            allow: allow,
          });
          navigate(`/schedule/${result.data.data.name}`);
          navigate(0);
        } else {
          result = await GetDataServer(DataAPI.SCHEDULE).UPDATE({
            id: id,
            data: !data
              ? {
                  startDate: startDate.valueData,
                  dueDate: dueDate.valueData,
                  allow: allow,
                }
              : data,
          });
          getData();
        }
      } catch (error: any) {
        AlertModal.Default({
          icon: "error",
          title: "Error",
          text: error.response.data.msg ?? "Error Network",
        });
        setLoading(false);
      }
    };
    AlertModal.confirmation({
      onConfirm: progress,
      text: "You want to save this data!",
      confirmButtonText: "Yes, Save it",
    });
  };

  useEffect(() => {
    if (id) {
      getData();
      setListMoreAction([{ name: "Delete", onClick: onDelete }]);
    } else {
      setLoading(false);
      setListMoreAction([]);
    }
  }, []);

  // Cek perubahan
  useEffect(() => {
    const actualData = {
      startDate: startDate.valueData,
      dueDate: dueDate.valueData,
      allow: allow,
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [startDate, dueDate, allow]);
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
                <div className="text-[0.9em]">
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
              <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none">
                <div className="w-full h-auto  float-left rounded-md p-3 py-5">
                  <div className=" w-1/2 px-4 float-left ">
                    <InputComponent
                      loading={loadingWarehouse}
                      label="Warehouse"
                      value={warehouse}
                      className="h-[38px]   text-[0.93em] mb-3"
                      onChange={(e) =>
                        setWarehouse({ ...warehouse, valueInput: e })
                      }
                      onSelected={(e) =>
                        setWarehouse({
                          valueData: e.value,
                          valueInput: e.value,
                        })
                      }
                      onCLick={getWarehouse}
                      list={listWarehouse}
                      mandatoy
                      modalStyle="top-9 max-h-[160px]"
                      onReset={() =>
                        setWarehouse({ valueData: null, valueInput: "" })
                      }
                      disabled={!id ? false : true}
                      closeIconClass="top-[13.5px]"
                    />
                    {id && (
                      <InputComponent
                        label="User"
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
                    )}
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
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
                    <InputComponent
                      disabled={id !== undefined && data.status != 0}
                      label="startDate"
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
                        label="dueDate"
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
                    <div>
                      <h4 className="text-sm text-gray-800">Allow</h4>
                      <ul className="flex justify-between w-1/3">
                        <li className="flex items-center">
                          <label className="text-sm">Barcode</label>
                          <div className="ml-1 mt-1">
                            <input
                              type="checkbox"
                              id="barcode"
                              name="Allow"
                              checked={allow.barcode}
                              className="accent-red-500"
                              onChange={(e) => {
                                if (
                                  data.status != 1 &&
                                  data.status != 2 &&
                                  data.status != 3
                                ) {
                                  setAllow({
                                    ...allow,
                                    barcode: e.target.checked,
                                  });
                                }
                              }}
                            />
                          </div>
                        </li>
                        <li className="flex items-center">
                          <label className="text-sm">Manual</label>
                          <div className="ml-1 mt-1">
                            <input
                              type="checkbox"
                              id="manual"
                              name="Allow"
                              checked={allow.manual}
                              className="accent-red-500"
                              onChange={(e) => {
                                if (
                                  data.status != 1 &&
                                  data.status != 2 &&
                                  data.status != 3
                                ) {
                                  setAllow({
                                    ...allow,
                                    manual: e.target.checked,
                                  });
                                }
                              }}
                            />
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {id && (
                <ToggleBodyComponent
                  name="Item List"
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

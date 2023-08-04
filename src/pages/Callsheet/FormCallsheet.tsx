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
import { AlertModal, Meta } from "../../utils";
import ListItemSchedule from "./ListItemCallsheet";
import { IListIconButton } from "../../components/atoms/IconButton";

const FormCallsheetPage: React.FC = () => {
  const metaData = {
    title: "New Callsheet - Sales App Ekatunggal",
    description: "Halaman form callsheet sales web system",
  };

  const navigate = useNavigate();
  let { id } = useParams();

  const [data, setData] = useState<any>({});
  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const [prevData, setPrevData] = useState<any>({});
  const dataCallType: any[] = [
    { title: "Incomming Call", value: "in" },
    { title: "Outgoing Call", value: "out" },
  ];
  const [user, setUser] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [naming, setNaming] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [branch, setBranch] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [callType, setCallType] = useState<string>("out");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingNaming, setLoadingName] = useState<boolean>(true);
  const [loadingBranch, setLoadingBranch] = useState<boolean>(true);
  const [listNaming, setListNaming] = useState<IListInput[]>([]);
  const [listBranch, setListBranch] = useState<IListInput[]>([]);
  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.CALLSHEET).FINDONE(`${id}`);

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

      setCallType(result.data.type);

      setUser({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });

      setLoading(false);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      // navigate("/callsheet");
    }
  };

  const getNaming = async (): Promise<void> => {
    try {
      const result: any = await GetDataServer(DataAPI.NAMING).FIND({
        filters: [["doc", "=", "callsheet"]],
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

  const getBranch = async (): Promise<void> => {
    try {
      const result: any = await GetDataServer(DataAPI.BRANCH).FIND({});
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });

        if (listInput.length === 1) {
          setBranch({
            valueData: listInput[0].value,
            valueInput: listInput[0].name,
          });
        }

        setListBranch(listInput);
      }
      setLoadingBranch(false);
    } catch (error) {
      setLoadingBranch(false);
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.CALLSHEET).DELETE(`${id}`);
          navigate("/callsheet");
        } catch (error) {
          console.log(error);
        }
      };

      AlertModal.confirmation({ onConfirm: progress });
    }
  };

  const onSave = async (data: {}): Promise<any> => {
    // const progress = async (): Promise<void> => {
    //   if (allow.barcode === false && allow.manual === false) {
    //     AlertModal.Default({
    //       icon: "error",
    //       title: "Error",
    //       text: "Allow required",
    //     });
    //     return;
    //   }
    //   try {
    //     setLoading(true);
    //     let result: any;
    //     if (!id) {
    //       result = await GetDataServer(DataAPI.CALLSHEET).CREATE({
    //         startDate: startDate.valueData,
    //         dueDate: dueDate.valueData,
    //         workflowState: "Draft",
    //         status: "0",
    //         warehouse: warehouse.valueData,
    //         allow: allow,
    //       });
    //       navigate(`/callsheet/${result.data.data.name}`);
    //       navigate(0);
    //     } else {
    //       result = await GetDataServer(DataAPI.CALLSHEET).UPDATE({
    //         id: id,
    //         data: !data
    //           ? {
    //               startDate: startDate.valueData,
    //               dueDate: dueDate.valueData,
    //               allow: allow,
    //             }
    //           : data,
    //       });
    //       getData();
    //     }
    //   } catch (error: any) {
    //     AlertModal.Default({
    //       icon: "error",
    //       title: "Error",
    //       text: error.response.data.msg ?? "Error Network",
    //     });
    //     setLoading(false);
    //   }
    // };
    // AlertModal.confirmation({
    //   onConfirm: progress,
    //   text: "You want to save this data!",
    //   confirmButtonText: "Yes, Save it",
    // });
  };

  useEffect(() => {
    getNaming();
    getBranch();
    if (id) {
      getData();
      setListMoreAction([{ name: "Delete", onClick: onDelete }]);
    } else {
      setLoading(false);
      setListMoreAction([]);
    }
  }, []);

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
                  onClick={() => navigate("/callsheet")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New callsheet" : data.name}
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
                      loading={loadingNaming}
                      label="Naming Series"
                      value={naming}
                      className="h-[38px]   text-[0.93em] mb-3"
                      onChange={(e) => setNaming({ ...naming, valueInput: e })}
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
                      // disabled={!id ? false : true}
                      closeIconClass="top-[13.5px]"
                    />
                    <Select
                      title="Call Type"
                      data={dataCallType}
                      value={callType}
                      setValue={setCallType}
                      disabled={false}
                    />
                    <InputComponent
                      loading={loadingBranch}
                      label="Branch"
                      value={branch}
                      className="h-[38px]   text-[0.93em] mb-3"
                      onChange={(e) => setBranch({ ...naming, valueInput: e })}
                      onSelected={(e) => {
                        setBranch({
                          valueData: e.value,
                          valueInput: e.name,
                        });
                      }}
                      onCLick={getBranch}
                      list={listNaming}
                      mandatoy
                      modalStyle="top-9 max-h-[160px]"
                      onReset={() =>
                        setBranch({ valueData: null, valueInput: "" })
                      }
                      // disabled={!id ? false : true}
                      closeIconClass="top-[13.5px]"
                    />
                    {branch.valueData && (
                      <InputComponent
                        loading={loadingNaming}
                        label="Group"
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
                        // disabled={!id ? false : true}
                        closeIconClass="top-[13.5px]"
                      />
                    )}
                    <InputComponent
                      loading={loadingNaming}
                      label="Customer"
                      value={naming}
                      className="h-[38px]   text-[0.93em] mb-3"
                      onChange={(e) => setNaming({ ...naming, valueInput: e })}
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
                      // disabled={!id ? false : true}
                      closeIconClass="top-[13.5px]"
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
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
              {/* {id && (
                <ToggleBodyComponent
                  name="Item List"
                  className="mt-5"
                  child={<ListItemSchedule props={data} />}
                />
              )} */}
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

export default FormCallsheetPage;

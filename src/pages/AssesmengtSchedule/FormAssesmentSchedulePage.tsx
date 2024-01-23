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
import { AlertModal, LocalStorage, Meta } from "../../utils";
import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { modalSet } from "../../redux/slices/ModalSlice";
import ListItemAssesmentSchedule from "./ListItemAssesmentSchedule";

const FormAssesmentSchedulePage: React.FC<any> = ({ props }) => {
  const modal = props ? props.modal ?? false : false;

  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${
      id ? data.name ?? "Loading .." : "New Assesment Schedule"
    } - Sales App Ekatunggal`,
    description: "Halaman form assesment schedule  Sales  web system",
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
  const [desc, setDesc] = useState<string>("");
  const [activeDate, setActiveDate] = useState<IValue>({
    valueData: null,
    valueInput: "",
  });
  // Template
  const [template, setTemplate] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [templateList, setTemplateList] = useState<IListInput[]>([]);
  const [templatePage, setTemplatePage] = useState<Number>(1);
  const [templateLoading, setTemplateLoading] = useState<boolean>(true);
  const [templateMoreLoading, setTemplateMoreLoading] =
    useState<boolean>(false);
  const [templateHasMore, setTemplateHasMore] = useState<boolean>(false);

  // End Template
  const [naming, setNaming] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [progress, setProgress] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [deactiveDate, setDeactiveDate] = useState<IValue>({
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
    desc: desc,
    activeDate: activeDate.valueData,
    deactiveDate: deactiveDate.valueData,
    template: template.valueData,
  });
  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.ASSESMENTSCHEDULE).FINDONE(
        `${id}`
      );

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

      setTemplate({
        valueData: result.data.assesmentTemplate._id,
        valueInput: result.data.assesmentTemplate.name,
      });

      setDesc(result.data.desc);
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
      setActiveDate({
        valueData: moment(result.data.activeDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.activeDate).format("YYYY-MM-DD"),
      });
      setDeactiveDate({
        valueData: moment(result.data.deactiveDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.deactiveDate).format("YYYY-MM-DD"),
      });
      setPrevData({
        desc: result.data.desc,
        activeDate: moment(result.data.activeDate).format("YYYY-MM-DD"),
        deactiveDate: moment(result.data.deactiveDate).format("YYYY-MM-DD"),
        template: result.data.assesmentTemplate._id,
      });
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/assesment/schedule");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.ASSESMENTSCHEDULE).DELETE(`${id}`);
          navigate("/assesment/schedule");
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
        data = {
          desc: desc,
          activeDate: activeDate.valueData,
          deactiveDate: deactiveDate.valueData,
          namingSeries: naming.valueData,
          assesmentTemplate: template.valueData,
        };
      }

      let Action =
        id && !modal
          ? GetDataServer(DataAPI.ASSESMENTSCHEDULE).UPDATE({
              id: id,
              data: data,
            })
          : modal
          ? GetDataServer(DataAPI.ASSESMENTSCHEDULE).CREATE(
              data,
              `/duplicate/${props.scheduleId}`
            )
          : GetDataServer(DataAPI.ASSESMENTSCHEDULE).CREATE(data);

      const result = await Action;

      if (id && !modal) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(`/assesment/schedule/${result.data.data._id}`);
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

  const getNaming = async (): Promise<void> => {
    try {
      const result: any = await GetDataServer(DataAPI.NAMING).FIND({
        filters: [
          ["doc", "=", "assesmentschedule"],
          ["status", "=", "1"],
        ],
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
      desc: desc,
      activeDate: activeDate.valueData,
      deactiveDate: deactiveDate.valueData,
      template: template.valueData,
    };

    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [activeDate, deactiveDate, template, desc]);
  // End

  const getTemplate = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }

      let filters: any = [["status", "=", "1"]];

      const result: any = await GetDataServer(DataAPI.ASSESMENTTEMPLATE).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : templatePage}`,
        filters: filters,
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });
        if (!data.refresh) {
          setTemplateList([...templateList, ...listInput]);
        } else {
          setTemplateList([...listInput]);
        }
        setTemplateHasMore(result.hasMore);
        setTemplatePage(result.nextPage);
      }

      setTemplateLoading(false);
      setTemplateMoreLoading(false);
    } catch (error: any) {
      setTemplateLoading(false);
      setTemplateMoreLoading(false);
      setTemplateHasMore(false);
    }
  };

  const ResetTemplate = () => {
    setTemplateList([]);
    setTemplateHasMore(false);
    setTemplatePage(1);
    setTemplateLoading(true);
  };

  const getFormDuplicate = (): void => {
    dispatch(
      modalSet({
        active: true,
        Children: FormAssesmentSchedulePage,
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
                  onClick={() => navigate("/assesment/schedule")}
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

                {isChangeData &&
                  template.valueData !== null &&
                  template.valueData !== "" &&
                  activeDate.valueData !== null &&
                  activeDate.valueData !== "" &&
                  deactiveDate.valueData !== null &&
                  deactiveDate.valueData !== "" && (
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
                    <InputComponent
                      mandatoy
                      label="Assesment Template"
                      value={template}
                      infiniteScroll={{
                        loading: templateMoreLoading,
                        hasMore: templateHasMore,
                        next: () => {
                          setTemplateMoreLoading(true);
                          getTemplate({
                            refresh: false,
                            search: template.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetTemplate();
                          getTemplate({ refresh: true, search: e });
                        },
                      }}
                      onCLick={() => {
                        ResetTemplate();
                        getTemplate({
                          refresh: true,
                          search: template.valueInput,
                        });
                      }}
                      loading={templateLoading}
                      list={templateList}
                      className="h-[38px]   mb-4"
                      onChange={(e) => {
                        setTemplate({
                          ...template,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e) => {
                        setTemplate({ valueData: e.value, valueInput: e.name });
                      }}
                      onReset={() => {
                        setTemplate({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      modalStyle="mt-2"
                    />
                    <label className="text-sm">Desc</label>
                    <textarea
                      className="border mt-1 p-2 text-md bg-gray-50  w-full rounded-md h-[150px] mb-10"
                      name="Desc"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      disabled={id !== undefined && data.status != 0 && !modal}
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-4">
                    <InputComponent
                      disabled={id !== undefined && data.status != 0 && !modal}
                      label="Start Date"
                      value={activeDate}
                      className="h-[38px] mb-4"
                      type="date"
                      onChange={(e) => {
                        setActiveDate({
                          valueData: e,
                          valueInput: e,
                        });
                        if (
                          moment(Number(new Date(e))).format("YYYY-MM-DD") >
                          moment(
                            Number(new Date(deactiveDate.valueData))
                          ).format("YYYY-MM-DD")
                        ) {
                          setDeactiveDate({
                            valueData: e,
                            valueInput: e,
                          });
                        }
                      }}
                      min={moment(Number(new Date())).format("YYYY-MM-DD")}
                      mandatoy
                    />
                    {activeDate.valueData && (
                      <InputComponent
                        disabled={
                          id !== undefined && data.status != 0 && !modal
                        }
                        label="Closing Date"
                        value={deactiveDate}
                        className="h-[38px]  mb-4"
                        type="date"
                        onChange={(e) =>
                          setDeactiveDate({
                            valueData: e,
                            valueInput: e,
                          })
                        }
                        mandatoy
                        min={activeDate.valueData}
                      />
                    )}
                    <InputComponent
                      label="Created By"
                      value={user}
                      className="h-[38px]   mb-4"
                      disabled
                    />
                    <div className="mt-2 mb-2">
                      <label className="text-sm">Insert new customer</label>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="ic"
                          value="1"
                          className="mr-1"
                        />
                        <label className="text-sm">Yes</label>
                        <input
                          type="radio"
                          name="ic"
                          value="0"
                          onClick={(e)=>alert("Dd")}
                          className="ml-10 mr-1"
                        />
                        <label className="text-sm">No</label>
                      </div>
                    </div>
                    {id && !modal && progress.valueData !== "NaN" && (
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
                  child={
                    <ListItemAssesmentSchedule
                      props={{ docId: id, data: data }}
                    />
                  }
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

export default FormAssesmentSchedulePage;

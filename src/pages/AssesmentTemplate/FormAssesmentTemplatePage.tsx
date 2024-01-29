import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";

const FormAssesmentTemplatePage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${
      id ? data.name ?? "Loading ..  " : "New Template"
    } - Sales App Ekatunggal`,
    description: "Halaman form Template Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [status, setStatus] = useState<String>("Draft");
  const [indicators, setIndicators] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [desc, setDesc] = useState<string>("");
  const [prevData, setPrevData] = useState<any>({
    name: name.valueData,
    desc: desc ?? "",
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.ASSESMENTTEMPLATE).FINDONE(
        `${id}`
      );

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

      setName({
        valueData: result.data.name,
        valueInput: result.data.name,
      });
      setUser({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });
      setCreatedAt({
        valueData: moment(result.data.createdAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.createdAt).format("YYYY-MM-DD"),
      });

      setData(result.data);

      setIndicators(result.data.indicators ?? []);
      setGrades(result.data.grades ?? []);

      setPrevData({
        name: result.data.name,
        desc: result.data.desc ?? "",
      });
      if (result.data.notes) {
        setDesc(result.data.notes);
      }
      setStatus(
        result.data.status == "0"
          ? "Draft"
          : result.data.status == "1"
          ? "Submitted"
          : result.data.status == "2"
          ? "Canceled"
          : "Closed"
      );
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/assesment/template");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.ASSESMENTTEMPLATE).DELETE(`${id}`);
          navigate("/assesment/template");
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

  const onSave = async (nextState?: String): Promise<any> => {
    setLoading(true);
    try {
      let data: any = {
        name: name.valueData,
        notes: desc,
        indicators: indicators,
        grades: grades,
      };
      if (nextState) {
        data.nextState = nextState;
      }

      let Action = id
        ? GetDataServer(DataAPI.ASSESMENTTEMPLATE).UPDATE({
            id: id,
            data: data,
          })
        : GetDataServer(DataAPI.ASSESMENTTEMPLATE).CREATE(data);

      const result = await Action;

      if (id) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(`/assesment/template/${result.data.data._id}`);
        navigate(0);
      }
    } catch (error: any) {
      Swal.fire(
        "Error!",
        `${
          error?.response?.data?.error
            ? error.response.data.error
            : error?.response?.data?.msg
            ? error?.response?.data?.msg
            : error?.message
            ? error?.message
            : error ?? "Error Insert"
        }`,
        "error"
      );
    }
    setLoading(false);
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
      name: name.valueData,
      desc: desc ?? "",
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [name, desc]);
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
                  onClick={() => navigate("/assesment/template")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New template" : data.name}
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
                    callback={() => {
                      AlertModal.confirmation({
                        onConfirm: onSave,
                        confirmButtonText: `Yes, ${
                          !id ? "Save it!" : "Update It"
                        }`,
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
              <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none">
                <div className="w-full h-auto  float-left rounded-md p-3 py-5">
                  <div className=" w-1/2 px-4 float-left ">
                    <InputComponent
                      mandatoy
                      label="Name"
                      value={name}
                      className="h-[38px] mb-3"
                      type="text"
                      onChange={(e) =>
                        setName({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />

                    <InputComponent
                      label="Created By"
                      value={user}
                      className="h-[38px]  mb-3"
                      onChange={(e) =>
                        setUser({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <label className="text-sm">Desc</label>
                    <textarea
                      className="border mt-1 p-2 text-[0.95em] bg-gray-50  w-full rounded-md h-[150px]"
                      name="Site Uri"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
                    <InputComponent
                      label="Date"
                      value={createdAt}
                      className="h-[38px]  mb-3"
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
                      label="Status"
                      value={{ valueData: status, valueInput: status }}
                      className="h-[38px]  mb-3"
                      type="text"
                      onChange={(e) =>
                        setCreatedAt({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                  </div>
                </div>
              </div>

              <ToggleBodyComponent
                name="Indicators"
                className="mt-5 mb-5"
                child={
                  <IndicatorComponent
                    data={indicators}
                    setData={setIndicators}
                  />
                }
              />
              <ToggleBodyComponent
                name="Grading"
                className="mb-5"
                child={<GradingComponent data={grades} setData={setGrades} />}
              />
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

interface IIndicators {
  data: any[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
}

const GradingComponent: React.FC<IIndicators> = ({ data, setData }) => {
  console.log(data);
  return (
    <>
      <table className="text[0.95em] w-full">
        <thead>
          <tr>
            <th className="text-center h-12">No</th>
            <th className="w-[150px]">Bottom</th>
            <th className="w-[150px]">Top</th>
            <th className="w-[180px]">Grade</th>
            <th>Notes / Recomendation</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item: any, index: number) => {
            return (
              <tr key={index} className="border-b ">
                <td className="text-center">{index + 1}</td>
                <td>
                  <input
                    type="number"
                    className=" w-[95%] text-center border  bg-gray-50 border-[#ececec] h-9"
                    placeholder="0"
                    value={item.bottom}
                    onChange={(e) => {
                      item.bottom = e.target.value;
                      const newData = [...data];
                      setData(newData);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="20"
                    className="w-[95%] text-center  border bg-gray-50 border-[#ececec] h-9"
                    value={item.top}
                    onChange={(e) => {
                      item.top = e.target.value;
                      const newData = [...data];
                      setData(newData);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="A"
                    className="w-[95%] px-2 border bg-gray-50 border-[#ececec] h-9"
                    value={item.grade ?? ""}
                    onChange={(e) => {
                      item.grade = e.target.value;
                      const newData = [...data];
                      setData(newData);
                    }}
                  />
                </td>
                <td>
                  <textarea
                    className="w-full p-2 bg-gray-50 border  border-[#ececec] my-2"
                    name="Notes"
                    rows={2}
                    placeholder="Rekomendasi perubahan TOP ke Cash"
                    value={item.notes ?? ""}
                    onChange={(e) => {
                      item.notes = e.target.value;
                      const newData = [...data];
                      setData(newData);
                    }}
                  />
                </td>
                <td>
                  <CloseIcon
                    onClick={() => {
                      data?.splice(index, 1);
                      const newData = [...data];
                      setData(newData);
                    }}
                    style={{
                      fontSize: 20,
                      color: "darkred",
                      cursor: "pointer",
                    }}
                    className="opacity-60 ml-3 hover:opacity-100 duration-300"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
        onClick={() => {
          const newData = [...data, { grade: "", notes: "" }];
          setData(newData);
        }}
        className="text-[0.95em] mt-6 border rounded-md py-1 px-2 flex items-center bg-green-600 text-white text-sm border-green-700 opacity-70 hover:opacity-100 duration-300"
      >
        <h4>Add</h4>
        <AddIcon style={{ fontSize: 14 }} className="mt-1 ml-1" />
      </button>
    </>
  );
};

const IndicatorComponent: React.FC<IIndicators> = ({ data, setData }) => {
  // branch
  const [questionList, setQuestionList] = useState<IListInput[]>([]);
  const [questionPage, setQuestionPage] = useState<Number>(1);
  const [questionLoading, setQuestionLoading] = useState<boolean>(true);
  const [questionMoreLoading, setQuestionMoreLoading] =
    useState<boolean>(false);
  const [questionHasMore, setQuestionHasMore] = useState<boolean>(false);
  // End

  const getQuestion = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.ASSESMENTQUESTION).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : questionPage}`,
        filters: [["status", "=", "1"]],
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });
        if (!data.refresh) {
          setQuestionList([...questionList, ...listInput]);
        } else {
          setQuestionList([...listInput]);
        }
        setQuestionHasMore(result.hasMore);
        setQuestionPage(result.nextPage);
      }

      setQuestionLoading(false);
      setQuestionMoreLoading(false);
    } catch (error: any) {
      setQuestionList([]);
      setQuestionLoading(false);
      setQuestionMoreLoading(false);
      setQuestionHasMore(false);
    }
  };

  const ResetQuestion = () => {
    setQuestionList([]);
    setQuestionHasMore(false);
    setQuestionPage(1);
    setQuestionLoading(true);
  };

  return (
    <>
      <table className="w-full text-left" border={1}>
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">Question</th>
            <th className="text-center">Weight</th>
            <th className="text-center h-12"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: any, index: number) => {
            return (
              <React.Fragment key={index}>
                <tr key={index}>
                  <td className="text-center h-7">
                    <h4 className="mt-3">{index + 1}</h4>
                  </td>
                  <td className="w-[90%]">
                    <InputComponent
                      // modal={{
                      //   Children: FormCustomerPage,
                      //   className: "w-[63%] h-[98%]",
                      //   props: {
                      //     modal: true,
                      //     group: group,
                      //     branch: branch,
                      //     name: customer.valueInput,
                      //     Callback: setCustomer,
                      //   },
                      //   title: "Form Customer",
                      // }}
                      mandatoy
                      infiniteScroll={{
                        loading: questionMoreLoading,
                        hasMore: questionHasMore,
                        next: () => {
                          setQuestionMoreLoading(true);
                          getQuestion({
                            refresh: false,
                            search: item.questionId?.name ?? "",
                          });
                        },
                        onSearch(e) {
                          ResetQuestion();
                          getQuestion({ refresh: true, search: e });
                        },
                      }}
                      onCLick={() => {
                        ResetQuestion();
                        getQuestion({
                          refresh: true,
                          search: item.questionId?.name ?? "",
                        });
                      }}
                      loading={questionLoading}
                      modalStyle="mt-2"
                      value={{
                        valueData: item.questionId?._id ?? "",
                        valueInput: item.questionId?.name ?? "",
                      }}
                      onChange={(e) => {
                        item.questionId.name = e;
                        const newData = [...data];
                        setData(newData);
                      }}
                      onSelected={(e) => {
                        item.questionId._id = e.value;
                        item.questionId.name = e.name;
                        const newData = [...data];
                        setData(newData);
                      }}
                      onReset={() => {
                        item.questionId._id = "";
                        item.questionId.name = "";
                        const newData = [...data];
                        setData(newData);
                      }}
                      list={questionList}
                      type="text"
                      className={`h-9 mt-4 text-[0.95em]`}
                    />
                  </td>
                  <td className="">
                    <input
                      className="p-1 text-[0.95em] text-center bg-gray-50 border border-[#ececec]  rounded-md ml-1 mt-4 h-10"
                      type="number"
                      value={item.weight ?? 0}
                      onChange={(e) => {
                        item.weight = e.target.value;
                        const newData = [...data];
                        setData(newData);
                      }}
                    />
                  </td>
                  <td className="text-center">
                    <CloseIcon
                      onClick={() => {
                        data.splice(index, 1);
                        const newData = [...data];
                        setData(newData);
                      }}
                      style={{
                        fontSize: 20,
                        color: "darkred",
                        cursor: "pointer",
                      }}
                      className="opacity-60 hover:opacity-100 duration-300 mt-4"
                    />
                  </td>
                </tr>
                {item.options?.map((option: any, idOption: number) => {
                  return (
                    <React.Fragment key={idOption}>
                      <tr>
                        <td className="text-center h-5  "></td>
                        <td className="flex">
                          <input className="ml-2" type="checkbox" disabled />
                          <input
                            className="p-1  ml-1 flex-1 text-[0.95em]"
                            type="text"
                            value={option.name ?? ""}
                            onChange={(e) => {
                              option.name = e.target.value;
                              const newData = [...data];
                              setData(newData);
                            }}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            className="p-1 text-[0.95em] text-center"
                            type="number"
                            value={option.weight ?? 0}
                            onChange={(e) => {
                              option.weight = e.target.value;
                              const newData = [...data];
                              setData(newData);
                            }}
                          />
                        </td>
                        <td className="text-center">
                          <CloseIcon
                            onClick={() => {
                              item.options?.splice(idOption, 1);
                              const newData = [...data];
                              setData(newData);
                            }}
                            style={{
                              fontSize: 20,
                              color: "darkred",
                              cursor: "pointer",
                            }}
                            className="opacity-60 hover:opacity-100 duration-300"
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
                <tr>
                  <td className="text-center h-5"></td>
                  <td
                    className={`flex items-center ${
                      item.options
                        ? item.options?.length === 0 && "mt-2"
                        : "mt-2"
                    } `}
                  >
                    <input className="ml-2" type="checkbox" disabled />
                    <button
                      onClick={() => {
                        if (item.options) {
                          item.options = [
                            ...item.options,
                            { name: "", weight: 0 },
                          ];
                        } else {
                          item.options = [{ name: "", weight: 0 }];
                        }
                        const newData = [...data];
                        setData(newData);
                      }}
                      className=" ml-2 opacity-60 flex items-center hover:opacity-100 duration-300 text-[0.95em]"
                    >
                      <h4>Add option</h4>
                      <AddIcon style={{ fontSize: 14 }} className="mt-1" />
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      <button
        onClick={() => {
          const newData = [...data, { questionId: { _id: "", name: "" } }];
          setData(newData);
        }}
        className="text-[0.95em] mt-6 border rounded-md py-1 px-2 flex items-center bg-green-600 text-white text-sm border-green-700 opacity-70 hover:opacity-100 duration-300"
      >
        <h4>Add</h4>
        <AddIcon style={{ fontSize: 14 }} className="mt-1 ml-1" />
      </button>
    </>
  );
};

export default FormAssesmentTemplatePage;

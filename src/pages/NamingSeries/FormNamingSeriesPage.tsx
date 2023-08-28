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
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, LocalStorage, Meta } from "../../utils";

import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";
import CancelSharpIcon from "@mui/icons-material/CancelSharp";

const FormNamingSeriesPage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${id ? data.name : "New Naming Series"} - Sales App Ekatunggal`,
    description: "Halaman form naming series - Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const dataType: any[] = [
    { title: "Visit", value: "visit" },
    { title: "Callsheet", value: "callsheet" },
    { title: "Schedule", value: "schedule" },
    { title: "Memo", value: "memo" },
  ];
  const [doc, setDoc] = useState<String>("visit");

  // Tags branch
  const [branchList, setBranchList] = useState<IListInput[]>([]);
  const [branchPage, setBranchPage] = useState<Number>(1);
  const [branchLoading, setBranchLoading] = useState<boolean>(true);
  const [branchMoreLoading, setBranchMoreLoading] = useState<boolean>(false);
  const [branchHasMore, setBranchHasMore] = useState<boolean>(false);
  const [branch, setBranch] = useState<any[]>([]);
  const [branchValue, setBranchValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [status, setStatus] = useState<String>("Draft");
  const [prevData, setPrevData] = useState<any>({
    name: name.valueData,
    doc: doc,
    branch: branch.map((item: any) => item._id),
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
      const result = await GetDataServer(DataAPI.NAMING).FINDONE(`${id}`);

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

      setBranch(result.data.branch);
      setData(result.data);

      setDoc(result.data.doc);

      setPrevData({
        name: result.data.name,
        doc: `${result.data.doc}`,
        branch: result.data.branch.map((item: any) => item._id),
      });

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

      navigate("/namingseries");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.NAMING).DELETE(`${id}`);
          navigate("/namingseries");
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

  const GetBranch = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }

      const result: any = await GetDataServer(DataAPI.BRANCH).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : branchPage}`,
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
          setBranchList([...branchList, ...listInput]);
        } else {
          setBranchList([...listInput]);
        }
        setBranchHasMore(result.hasMore);
        setBranchPage(result.nextPage);
      }

      setBranchLoading(false);
      setBranchMoreLoading(false);
    } catch (error: any) {
      setBranchLoading(false);
      setBranchMoreLoading(false);
      setBranchHasMore(false);
    }
  };

  const ResetBranch = () => {
    setBranchList([]);
    setBranchHasMore(false);
    setBranchPage(1);
    setBranchLoading(true);
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

  const onSave = async (nextState?: String): Promise<any> => {
    if (!name.valueData) {
      throw new Error("Nama wajib diisi!");
    }
    setLoading(true);
    try {
      let updata = {};
      if (nextState) {
        updata = { nextState: nextState };
      } else {
        updata = {
          name: name.valueData,
          doc: doc,
          branch: branch.map((item: any) => item._id),
        };
      }

      let Action = id
        ? GetDataServer(DataAPI.NAMING).UPDATE({ id: id, data: updata })
        : GetDataServer(DataAPI.NAMING).CREATE(updata);

      const result = await Action;
      if (id) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(`/namingseries/${result.data.data._id}`);
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
  // Cek perubahan
  useEffect(() => {
    const actualData = {
      name: name.valueData,
      doc: doc,
      branch: branch.map((item: any) => item._id),
    };

    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [name, branch, doc]);
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
                  onClick={() => navigate("/namingseries")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Naming Series" : data.name}
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
              <div className="border w-full flex-1  bg-white rounded-md ">
                <div className="w-full h-auto  float-left rounded-md p-3 py-5">
                  <div className=" w-1/2 px-4 float-left ">
                    <InputComponent
                      remark="*Ex : CST.YYYY..MM..####."
                      mandatoy
                      label="Name"
                      value={name}
                      className="h-[38px]   mb-4"
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
                      onReset={() => {
                        setName({ valueData: "", valueInput: "" });
                      }}
                    />

                    <Select
                      title="Doc"
                      data={dataType}
                      value={doc}
                      setValue={setDoc}
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />

                    <InputComponent
                      label="Branch"
                      infiniteScroll={{
                        loading: branchMoreLoading,
                        hasMore: branchHasMore,
                        next: () => {
                          setBranchMoreLoading(true);
                          GetBranch({
                            refresh: false,
                            search: branchValue.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetBranch();
                          GetBranch({
                            refresh: true,
                            search: e,
                          });
                        },
                      }}
                      onCLick={() => {
                        ResetBranch();
                        GetBranch({
                          refresh: true,
                          search: branchValue.valueInput,
                        });
                      }}
                      loading={branchLoading}
                      modalStyle="mt-2"
                      value={branchValue}
                      onChange={(e) => {
                        setBranchValue({
                          ...branchValue,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e) => {
                        const cekDup = branch.find(
                          (item: any) => item._id === e.value
                        );

                        if (!cekDup) {
                          let setTag = [
                            ...branch,
                            { _id: e.value, name: e.name },
                          ];

                          setBranch(setTag);
                        }

                        setBranchValue({
                          valueData: "",
                          valueInput: "",
                        });
                      }}
                      onReset={() => {
                        setBranchValue({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      list={branchList}
                      type="text"
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                      className={`h-9 mb-1`}
                    />
                    {branch.length > 0 && (
                      <ul className="w-full h-auto rounded-sm border p-2 float-left">
                        {branch.map((item: any, index: number) => {
                          return (
                            <li
                              onClick={() => {
                                if (!id || data.status == "0") {
                                  const setTags = branch.filter((i: any) => {
                                    return i._id !== item._id;
                                  });

                                  setBranch(setTags);
                                }
                              }}
                              key={index}
                              className=" mb-1 cursor-pointer duration-150 hover:bg-red-700 list-none px-2 py-1 text-sm rounded-md mr-1 bg-red-600 text-white float-left flex items-center"
                            >
                              {item.name}
                            </li>
                          );
                        })}
                        {!id ||
                          (data.status == "0" && (
                            <CancelSharpIcon
                              style={{ fontSize: "18px" }}
                              onClick={() => {
                                setBranch([]);
                              }}
                            />
                          ))}
                      </ul>
                    )}
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-4">
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
                    {id && (
                      <InputComponent
                        label="Status"
                        value={{ valueData: status, valueInput: status }}
                        className="h-[38px]  mb-4"
                        type="text"
                        onChange={(e) =>
                          setCreatedAt({
                            valueData: e,
                            valueInput: e,
                          })
                        }
                        disabled
                      />
                    )}
                    <InputComponent
                      label="Created By"
                      value={user}
                      className="h-[38px]   mb-4"
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

export default FormNamingSeriesPage;

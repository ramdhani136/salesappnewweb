import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  ButtonStatusComponent,
  IconButton,
  InputComponent,
  TimeLineVertical,
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, LocalStorage, Meta } from "../../utils";

import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";

const FormCustomerGroupPage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${id ? data.name : "New Group"} - Sales App Ekatunggal`,
    description: "Halaman form Group Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const [branch, setBranch] = useState<any[]>([]);

  // group
  const [parentList, setParentList] = useState<IListInput[]>([]);
  const [parentPage, setParentPage] = useState<Number>(1);
  const [parentLoading, setParentLoading] = useState<boolean>(true);
  const [parentMoreLoading, setParentMoreLoading] = useState<boolean>(false);
  const [parentHasmore, setParentHasMore] = useState<boolean>(false);
  const [parent, setParent] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  // branch
  const [branchList, setBranchList] = useState<IListInput[]>([]);
  const [branchPage, setBranchPage] = useState<Number>(1);
  const [branchLoading, setBranchLoading] = useState<boolean>(true);
  const [branchMoreLoading, setBranchMoreLoading] = useState<boolean>(false);
  const [branchHasMore, setBranchHasMore] = useState<boolean>(false);
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
  const [desc, setDesc] = useState<string>("");
  const [prevData, setPrevData] = useState<any>({
    name: name.valueData,
    desc: desc ?? "",
    parent: "",
    branch: [],
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
      const result = await GetDataServer(DataAPI.GROUP).FINDONE(`${id}`);

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

      if (result.data.parent.name) {
        setParent({
          valueData: result.data.parent._id,
          valueInput: result.data.parent.name,
        });
      }

      if (result.data.branch.length > 0) {
        setBranch(result.data.branch);
      }

      setData(result.data);

      setPrevData({
        name: result.data.name,
        desc: result.data.desc ?? "",
        parent: result.data.parent._id ?? "",
        branch: result.data.branch,
      });

      if (result.data.desc) {
        setDesc(result.data.desc);
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

      navigate("/customergroup");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.GROUP).DELETE(`${id}`);
          navigate("/customergroup");
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
      let isBranch: string[] = [];
      if (branch.length > 0) {
        isBranch = branch.map((item: any) => item._id);
      } else {
        Swal.fire("Error!", "Branch wajib diisi minimal satu!", "error");
        setLoading(false);
        return;
      }
      let data: any = {
        name: name.valueData,
        desc: desc,
        branch: isBranch,
        parent: parent.valueData,
      };

      if (nextState) {
        data.nextState = nextState;
      }

      let Action = id
        ? GetDataServer(DataAPI.GROUP).UPDATE({ id: id, data: data })
        : GetDataServer(DataAPI.GROUP).CREATE(data);

      const result = await Action;
      navigate(`/customergroup/${result.data.data._id}`);
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
          error.response.data.msg.message ??
          error.response.data.msg ??
          "Error Insert"
        }`,
        "error"
      );
    }
    setLoading(false);
  };

  const getParent = async (search?: string): Promise<void> => {
    try {
      if (!parentLoading) {
        setParentMoreLoading(true);
      } else {
        setParentMoreLoading(false);
      }

      let filters: any = [];

      if (id) {
        filters.push(["_id", "!=", id]);
      }

      const result: any = await GetDataServer(DataAPI.GROUP).FIND({
        search: search ?? "",
        limit: 10,
        page: `${parentPage}`,
        filters: filters,
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });
        setParentList([...parentList, ...listInput]);
        setParentHasMore(result.hasMore);
        setParentPage(result.nextPage);
      }

      setParentLoading(false);
      setParentMoreLoading(false);
    } catch (error: any) {
      setParentLoading(false);
      setParentMoreLoading(false);
      setParentHasMore(false);
    }
  };

  const ResetParent = () => {
    setParentList([]);
    setParentHasMore(false);
    setParentPage(1);
    setParentLoading(true);
  };

  const getBranch = async (search?: string): Promise<void> => {
    try {
      if (!branchLoading) {
        setBranchMoreLoading(true);
      } else {
        setBranchMoreLoading(false);
      }

      const result: any = await GetDataServer(DataAPI.BRANCH).FIND({
        search: search ?? "",
        limit: 10,
        page: `${branchPage}`,
        filters: [["status", "=", "1"]],
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });
        setBranchList([...branchList, ...listInput]);
        setBranchHasMore(result.hasMore);
        setBranchPage(result.nextPage);
      }

      setBranchLoading(false);
      setBranchHasMore(false);
    } catch (error: any) {
      setLoading(false);
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

  // Cek perubahan
  useEffect(() => {
    const actualData = {
      name: name.valueData,
      desc: desc ?? "",
      parent: parent.valueData ?? "",
      branch: branch,
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [name, desc, parent, branch]);
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
                  onClick={() => navigate("/customergroup")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Group" : data.name}
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
                      className="h-[38px]  text-[0.93em] mb-3"
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
                      className="h-[38px]   text-[0.93em] mb-3"
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
                      className="border mt-1 p-2 text-[0.95em] bg-gray-100  w-full rounded-md h-[150px]"
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
                      label="Status"
                      value={{ valueData: status, valueInput: status }}
                      className="h-[38px]  text-[0.93em] mb-3"
                      type="text"
                      onChange={(e) =>
                        setCreatedAt({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <InputComponent
                      label="Parent"
                      value={parent}
                      infiniteScroll={{
                        loading: parentMoreLoading,
                        hasMore: parentHasmore,
                        next: () => {
                          getParent();
                        },
                        onSearch(e) {
                          getParent(e);
                        },
                      }}
                      loading={parentLoading}
                      list={parentList}
                      className="h-[38px]   text-[0.93em] mb-3"
                      onChange={(e) => {
                        ResetParent();
                        setParentLoading(true);
                        setParent({
                          ...parent,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e) => {
                        setParent({ valueData: e.value, valueInput: e.name });
                        ResetParent();
                      }}
                      onReset={() => {
                        ResetParent();
                        setParent({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      modalStyle="mt-2"
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
                          getBranch();
                        },
                        onSearch(e) {
                          getBranch(e);
                        },
                      }}
                      loading={branchLoading}
                      modalStyle="mt-2"
                      value={branchValue}
                      onChange={(e) => {
                        ResetBranch();
                        setBranchLoading(true);
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
                          let getBranch = [
                            ...branch,
                            { _id: e.value, name: e.name },
                          ];
                          setBranch(getBranch);
                        }

                        setBranchValue({ valueData: "", valueInput: "" });
                      }}
                      onReset={() => {
                        ResetBranch();
                        setBranchValue({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      list={branchList}
                      type="text"
                      //   disabled={disabled}
                      className={`h-9 mb-1`}
                    />
                    {branch.length > 0 && (
                      <ul className="w-full h-auto rounded-sm border p-2 float-left">
                        {branch.map((item: any, index: number) => {
                          return (
                            <li
                              onClick={() => {
                                const genBranch = branch.filter((i: any) => {
                                  return i._id !== item._id;
                                });

                                setBranch(genBranch);
                              }}
                              key={index}
                              className=" mb-1 cursor-pointer duration-150 hover:bg-red-700 list-none px-2 py-1 text-[0.8em] rounded-md mr-1 bg-red-600 text-white float-left flex items-center"
                            >
                              {item.name}
                            </li>
                          );
                        })}
                      </ul>
                    )}
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

export default FormCustomerGroupPage;

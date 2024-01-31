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

import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";
import { modalSet } from "../../redux/slices/ModalSlice";
import { useDispatch } from "react-redux";

const FormWorkflowPage: React.FC<any> = ({ props }) => {
  const modal = props ? props.modal ?? false : false;
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${
      id ? data.name ?? "Loading ..  " : "New Branch"
    } - Sales App Ekatunggal`,
    description: "Halaman form Branch Sales web system",
  };
  const dataStatus: any[] = [
    { title: "Enabled", value: "1" },
    { title: "Disabled", value: "0" },
  ];

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const dispatch = useDispatch();

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });

  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [doc, setDoc] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [status, setStatus] = useState<String>("1");
  const [prevData, setPrevData] = useState<any>({
    status: status,
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {
    try {
      const result = await GetDataServer(DataAPI.WORKFLOW).FINDONE(`${id}`);

      setStatus(result.data.status ? "1" : "0");

      setHistory(result.history);

      setUser({
        valueData: result.data.user._id,
        valueInput: result.data.user.name,
      });
      setName({
        valueData: result.data.name,
        valueInput: result.data.name,
      });

      setCreatedAt({
        valueData: moment(result.data.createdAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.createdAt).format("YYYY-MM-DD"),
      });

      setDoc({
        valueData: result.data.doc,
        valueInput: getTypeName(result.data.doc),
      });

      setData(result.data);

      setPrevData({
        status: result.data.status ? "1" : "0",
      });

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/workflow");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.WORKFLOW).DELETE(`${id}`);
          navigate("/workflow");
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
        status: status,
      };
      if (nextState) {
        data.nextState = nextState;
      }

      let Action =
        id && !modal
          ? GetDataServer(DataAPI.WORKFLOW).UPDATE({
              id: id,
              data: data,
            })
          : GetDataServer(DataAPI.WORKFLOW).CREATE(data);

      const result = await Action;

      if (id && !modal) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else if (modal) {
        props.Callback(result.data?.data ?? {});
        dispatch(
          modalSet({
            active: false,
            Children: null,
            title: "",
            props: {},
            className: "",
          })
        );
      } else {
        navigate(`/workflow/${result.data.data._id}`);
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

  const type: IListInput[] = [
    { name: "Callsheet", value: "callsheet" },
    { name: "Visit", value: "visit" },
    { name: "Branch", value: "branch" },
    { name: "Schedule", value: "schedule" },
    { name: "User", value: "user" },
    { name: "Contact", value: "contact" },
    { name: "Customer Group", value: "customergroup" },
    { name: "Customer", value: "customer" },
    { name: "Role Profile", value: "roleprofile" },
    { name: "Role User", value: "roleuser" },
    { name: "Permission", value: "permission" },
    { name: "User Group", value: "usergroup" },
    { name: "Memo", value: "memo" },
    { name: "Topic", value: "topic" },
    { name: "Notes", value: "notes" },
    { name: "Tag", value: "tag" },
    { name: "Naming Series", value: "namingseries" },
    { name: "Assesment Schedule", value: "assesmentschedule" },
  ];

  const getTypeName = (value: String) => {
    const data = type.filter((item: any) => item.value === value);
    if (data.length > 0) {
      return data[0].name;
    } else {
      return value;
    }
  };

  useEffect(() => {
    if (id && !modal) {
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
      status: status,
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [status]);
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
                  onClick={() => navigate("/workflow")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Question" : data.name}
                </h4>
                <div className="text-md">
                  <ButtonStatusComponent
                    // className="text-[0.7em]"
                    status={data.status ?? "0"}
                    name={
                      id && !modal
                        ? data.status == "0"
                          ? "Disabled"
                          : "Active"
                        : "Not Save"
                    }
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
                        onConfirm: onSave,
                        confirmButtonText: `Yes, ${
                          !id ? "Save it!" : "Update It"
                        }`,
                      });
                    }}
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
                      label="Name"
                      value={name}
                      className="h-[38px]  mb-3"
                      onChange={(e) =>
                        setName({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                    />

                    <InputComponent
                      label="Doc"
                      value={doc}
                      list={type}
                      className="h-[38px]  mb-3"
                      onChange={(e) =>
                        setDoc({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      modalStyle="mt-3"
                      onSelected={(e) => {
                        setDoc({ valueData: e.value, valueInput: e.name });
                      }}
                      onReset={() => {
                        setDoc({ valueData: "", valueInput: "" });
                      }}
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
                    <Select
                      title="Status"
                      data={dataStatus}
                      value={status}
                      setValue={setStatus}
                      ClassName={`h-9`}
                    />
                  </div>
                </div>
              </div>
              {id && (
                <ToggleBodyComponent
                  name="States"
                  className="mt-5 mb-5"
                  child={<StateComponent workflow={id} />}
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

const StateComponent: React.FC<{ workflow: String | undefined }> = ({
  workflow,
}) => {
  const [states, setState] = useState<any[]>([]);
  const [loading, setLoading] = useState<Boolean>(true);

  // state
  const [stateList, setStateList] = useState<IListInput[]>([]);
  const [statePage, setStatePage] = useState<Number>(1);
  const [stateLoading, setStateLoading] = useState<boolean>(true);
  const [stateMoreLoading, setStateMoreLoading] = useState<boolean>(false);
  const [stateHasMore, setStateHasMore] = useState<boolean>(false);
  // End

  // Role
  const [roleList, setRoleList] = useState<IListInput[]>([]);
  const [rolePage, setRolePage] = useState<Number>(1);
  const [roleLoading, setRoleLoading] = useState<boolean>(true);
  const [roleMoreLoading, setRoleMoreLoading] = useState<boolean>(false);
  const [roleHasMore, setRoleHasMore] = useState<boolean>(false);
  // End

  const getStateList = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.WORKFLOWSTATE).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : statePage}`,
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
          setStateList([...stateList, ...listInput]);
        } else {
          setStateList([...listInput]);
        }
        setStateHasMore(result.hasMore);
        setStatePage(result.nextPage);
      }

      setStateLoading(false);
      setStateMoreLoading(false);
    } catch (error: any) {
      setStateList([]);
      setStateLoading(false);
      setStateMoreLoading(false);
      setStateHasMore(false);
    }
  };

  const ResetState = () => {
    setStateList([]);
    setStateHasMore(false);
    setStatePage(1);
    setStateLoading(true);
  };

  const getRolelList = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.ROLEPROFILE).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : rolePage}`,
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
          setRoleList([...roleList, ...listInput]);
        } else {
          setRoleList([...listInput]);
        }
        setRoleHasMore(result.hasMore);
        setRolePage(result.nextPage);
      }

      setRoleLoading(false);
      setRoleMoreLoading(false);
    } catch (error: any) {
      setRoleList([]);
      setRoleLoading(false);
      setRoleMoreLoading(false);
      setRoleHasMore(false);
    }
  };

  const ResetRole = () => {
    setRoleList([]);
    setRoleHasMore(false);
    setRolePage(1);
    setRoleLoading(true);
  };

  const getState = async () => {
    try {
      const result: any = await GetDataServer(DataAPI.WORKFLOWCHANGER).FIND({
        filters: [["workflow", "=", workflow!]],
      });

      setState(result.data);

      console.log(result);
      setLoading(false);
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

  useEffect(() => {
    getState();
  }, []);

  console.log(states);
  return (
    <>
      {loading ? (
        LoadingComponent
      ) : (
        <table className="w-full border mb-3">
          <thead>
            <tr className="text-[0.95em] text-center color-[#7e7c7c] ">
              <td className="border border-r-0 h-10 w-[40px] ">
                <input type="checkbox" />
              </td>
              <td className="border h-10 w-[40px] border-l-0 ">No</td>
              <td className="border w-[30%]">State</td>
              <td className="border w-[30%">Doc Status</td>
              <td className="border w-[30%]">Only Allow Edit For</td>
              <td className="border w-[80px]">Self Approval</td>
            </tr>
          </thead>
          <tbody>
            {states.map((item: any, index: number) => {
              return (
                <tr key={index} className="text-center text-[0.95em]">
                  <td className=" border border-r-0">
                    <input type="checkbox" />
                  </td>
                  <td className="border border-l-0">{index + 1}</td>
                  <td className="border">
                    <InputComponent
                      // modal={{
                      //   Children: FromWorkflowState,
                      //   className: "w-[63%] h-[98%]",
                      //   props: {
                      //     modal: true,
                      //     name: item.questionId?.name ?? "",
                      //     Callback: (e: any) => {
                      //       // item.questionId._id = e._id;
                      //       // item.questionId.name = e.name;
                      //       // const newData = [...data];
                      //       // setData(newData);
                      //     },
                      //   },
                      //   title: "Form Question",
                      // }}
                      inputStyle="bg-white border-none"
                      infiniteScroll={{
                        loading: stateMoreLoading,
                        hasMore: stateHasMore,
                        next: () => {
                          setStateMoreLoading(true);
                          getStateList({
                            refresh: false,
                            search: item.state?.name ?? "",
                          });
                        },
                        onSearch(e) {
                          ResetState();
                          getStateList({ refresh: true, search: e });
                        },
                      }}
                      onCLick={() => {
                        ResetState();
                        getStateList({
                          refresh: true,
                          search: item.state?.name ?? "",
                        });
                      }}
                      loading={stateMoreLoading}
                      modalStyle="mt-2"
                      value={{
                        valueData: item.state?._id ?? "",
                        valueInput: item.state?.name ?? "",
                      }}
                      onChange={(e) => {
                        item.state.name = e;
                        const newData = [...states];
                        setState(newData);
                      }}
                      onSelected={(e) => {
                        item.state._id = e.value;
                        item.state.name = e.name;
                        const newData = [...states];
                        setState(newData);
                      }}
                      onReset={() => {
                        item.state._id = "";
                        item.state.name = "";
                        const newData = [...states];
                        setState(newData);
                      }}
                      list={stateList}
                      type="text"
                      className={`text-left text-[1em]`}
                    />
                  </td>
                  <td className="border">
                    <InputComponent
                      value={{
                        valueData: item.status,
                        valueInput: item.status.toString(),
                      }}
                      list={[
                        { name: "0", value: 0 },
                        { name: "1", value: 1 },
                        { name: "2", value: 2 },
                        { name: "3", value: 3 },
                      ]}
                      onChange={(e) => {
                        item.status = e;
                        const newData = [...states];
                        setState(newData);
                      }}
                      modalStyle="mt-3"
                      onSelected={(e) => {
                        item.status = e.value;
                        const newData = [...states];
                        setState(newData);
                      }}
                      onReset={() => {
                        item.status = "";
                        item.status = "";
                        const newData = [...states];
                        setState(newData);
                      }}
                      inputStyle="bg-white border-none text-center"
                    />
                  </td>
                  <td className="border">
                    <InputComponent
                      // modal={{
                      //   Children: FromWorkflowState,
                      //   className: "w-[63%] h-[98%]",
                      //   props: {
                      //     modal: true,
                      //     name: item.questionId?.name ?? "",
                      //     Callback: (e: any) => {
                      //       // item.questionId._id = e._id;
                      //       // item.questionId.name = e.name;
                      //       // const newData = [...data];
                      //       // setData(newData);
                      //     },
                      //   },
                      //   title: "Form Question",
                      // }}
                      inputStyle="bg-white border-none"
                      infiniteScroll={{
                        loading: roleMoreLoading,
                        hasMore: roleHasMore,
                        next: () => {
                          setRoleMoreLoading(true);
                          getRolelList({
                            refresh: false,
                            search: item.roleprofile?.name ?? "",
                          });
                        },
                        onSearch(e) {
                          ResetRole();
                          getRolelList({ refresh: true, search: e });
                        },
                      }}
                      onCLick={() => {
                        ResetRole();
                        getRolelList({
                          refresh: true,
                          search: item.roleprofile?.name ?? "",
                        });
                      }}
                      loading={roleMoreLoading}
                      modalStyle="mt-2"
                      value={{
                        valueData: item.roleprofile?._id ?? "",
                        valueInput: item.roleprofile?.name ?? "",
                      }}
                      onChange={(e) => {
                        item.roleprofile.name = e;
                        const newData = [...states];
                        setState(newData);
                      }}
                      onSelected={(e) => {
                        item.roleprofile._id = e.value;
                        item.roleprofile.name = e.name;
                        const newData = [...states];
                        setState(newData);
                      }}
                      onReset={() => {
                        item.roleprofile._id = "";
                        item.roleprofile.name = "";
                        const newData = [...states];
                        setState(newData);
                      }}
                      list={roleList}
                      type="text"
                      className={`text-left text-[1em]`}
                    />
                  </td>
                  <td className="border">
                    <input
                      type="checkbox"
                      name="sa"
                      value={item.selfApproval}
                      checked={item.selfApproval}
                      onChange={(e) => {
                        item.selfApproval = e.target.value;
                        const newData = [...states];
                        setState(newData);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <button className="text-[0.9em] bg-[#eb655d] opacity-80 hover:opacity-100 duration-100 text-white rounded-md py-[2px] px-2 mr-1">
        Delete
      </button>
      <button className="text-[0.9em] bg-[#f4f5f7]  opacity-80 hover:opacity-100 duration-100 rounded-md py-[2px] px-2">
        Add Row
      </button>
    </>
  );
};

export default FormWorkflowPage;

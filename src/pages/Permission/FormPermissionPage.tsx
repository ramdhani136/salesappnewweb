import { useNavigate, useParams, useLocation } from "react-router-dom";
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

const FormPermissionPage: React.FC = () => {
  let { id } = useParams();
  const location = useLocation();
  const state = location.state;
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${
      id ? data?.user?.name ?? "Loading .. " : "New Permission"
    } - Sales App Ekatunggal`,
    description: "Halaman form Permission - Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);

  const allowList: IListInput[] = [
    { name: "Branch", value: "branch" },
    { name: "User", value: "user" },
    { name: "Customer", value: "customer" },
    { name: "Customer Group", value: "customergroup" },
    { name: "User Group", value: "usergroup" },
  ];

  const [allDoc, setAlldoc] = useState<boolean>(false);

  const docList: IListInput[] = [
    { name: "Branch", value: "branch" },
    { name: "Visit", value: "visit" },
    { name: "Callsheet", value: "callsheet" },
    { name: "User", value: "user" },
    { name: "Customer", value: "customer" },
    { name: "Customer Group", value: "customergroup" },
    { name: "User Group", value: "usergroup" },
    { name: "Role Profile", value: "roleprofile" },
    { name: "Schedule", value: "schedule" },
    { name: "Memo", value: "memo" },
    { name: "Contact", value: "contact" },
    { name: "Notes", value: "notes" },
  ];

  // User
  const [userList, setUserList] = useState<IListInput[]>([]);
  const [userPage, setUserPage] = useState<Number>(1);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userMoreLoading, setUserMoreLoading] = useState<boolean>(false);
  const [userHasMore, setUserHasMore] = useState<boolean>(false);
  const [user, setUser] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [doc, setDoc] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  // Value
  const [valueList, setValueList] = useState<IListInput[]>([]);
  const [valuePage, setValuePage] = useState<Number>(1);
  const [valueLoading, setValueLoading] = useState<boolean>(true);
  const [valueMoreLoading, setValueMoreLoading] = useState<boolean>(false);
  const [valueHasMore, setValueHasMore] = useState<boolean>(false);
  const [value, setValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  const [createdBy, setCreatedBy] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [allow, setAllow] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [status, setStatus] = useState<String>("Draft");
  const [desc, setDesc] = useState<string>("");
  const [prevData, setPrevData] = useState<any>({
    user: user.valueData,
    allow: allow.valueData,
    value: value.valueData,
    allDoc: allDoc,
    doc: doc.valueData,
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getAllowName = (name: String): String => {
    switch (name) {
      case "branch":
        return "Branch";
      case "visit":
        return "Visit";
      case "callsheet":
        return "Callsheet";
      case "user":
        return "User";
      case "customergroup":
        return "Customer Group";
      case "customer":
        return "Customer";
      case "roleprofile":
        return "Role Profile";
      case "schedule":
        return "Schedule";
      case "memo":
        return "Memo";
      case "contact":
        return "Contact";
      case "usergroup":
        return "User Group";
      case "notes":
        return "Notes";

      default:
        return "";
    }
  };

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.PERMISSION).FINDONE(`${id}`);

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

      setUser({
        valueData: result.data.user._id,
        valueInput: result.data.user.name,
      });
      setAllow({
        valueData: result.data.allow,
        valueInput: getAllowName(result.data.allow),
      });
      setValue({
        valueData: result.data.value._id,
        valueInput: result.data.value.name,
      });
      setAlldoc(result.data.allDoc);
      setDoc({
        valueData: result.data.doc,
        valueInput: getAllowName(result.data.doc),
      });
      setCreatedBy({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });
      setCreatedAt({
        valueData: moment(result.data.createdAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.createdAt).format("YYYY-MM-DD"),
      });

      setData(result.data);

      setPrevData({
        user: result.data.user._id,
        allow: result.data.allow,
        value: result.data.value._id,
        allDoc: result.data.allDoc,
        doc: result.data.doc,
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
      console.log(error);
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      // navigate("/permission");
    }
  };

  const getUser = async (search?: string): Promise<void> => {
    try {
      if (!userLoading) {
        setUserMoreLoading(true);
      } else {
        setUserMoreLoading(false);
      }

      const result: any = await GetDataServer(DataAPI.USERS).FIND({
        search: search ?? "",
        limit: 10,
        page: `${userPage}`,
        filters: [["status", "=", "1"]],
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
            data: item,
          };
        });
        setUserList([...userList, ...listInput]);
        setUserHasMore(result.hasMore);

        setUserPage(result.nextPage);
      }

      setUserLoading(false);
      setUserMoreLoading(false);
    } catch (error: any) {
      setUserLoading(false);
      setUserMoreLoading(false);
      setUserHasMore(false);
    }
  };

  const ResetUser = () => {
    setUserList([]);
    setUserHasMore(false);
    setUserPage(1);
    setUserLoading(true);
  };

  const getValue = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    if (allow.valueData) {
      try {
        if (data.refresh === undefined) {
          data.refresh = true;
        }

        let endpoint: DataAPI;

        switch (allow.valueData) {
          case "branch":
            endpoint = DataAPI.BRANCH;
            break;
          case "user":
            endpoint = DataAPI.USERS;
            break;
          case "customer":
            endpoint = DataAPI.CUSTOMER;
            break;
          case "customergroup":
            endpoint = DataAPI.GROUP;
            break;
          default:
            endpoint = DataAPI.USERGROUP;
            break;
        }

        const result: any = await GetDataServer(endpoint).FIND({
          search: data.search ?? "",
          limit: 10,
          page: `${data.refresh ? 1 : valuePage}`,
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
            setValueList([...valueList, ...listInput]);
          } else {
            setValueList([...listInput]);
          }
          setValueHasMore(result.hasMore);
          setValuePage(result.nextPage);
        }

        setValueLoading(false);
        setValueMoreLoading(false);
      } catch (error: any) {
        setValueLoading(false);
        setValueMoreLoading(false);
        setValueHasMore(false);
      }
    }
  };

  const ResetValue = () => {
    setValueList([]);
    setValueHasMore(false);
    setValuePage(1);
    setValueLoading(true);
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.PERMISSION).DELETE(`${id}`);
          navigate("/permission");
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
      let data: any = {};
      if (nextState) {
        data.nextState = nextState;
      } else {
        if (!user.valueData) {
          throw new Error("User wajib diisi!");
        }
        if (!allow.valueData) {
          throw new Error("Allow wajib diisi!");
        }
        if (!value.valueData) {
          throw new Error("Value wajib diisi!");
        }
        if (!allDoc && !doc.valueData) {
          throw new Error("Documen Type wajib diisi!");
        }
        data = {
          user: user.valueData,
          allow: allow.valueData,
          value: value.valueData,
          allDoc: allDoc,
          doc: doc.valueData,
        };
      }

      let Action = id
        ? GetDataServer(DataAPI.PERMISSION).UPDATE({ id: id, data: data })
        : GetDataServer(DataAPI.PERMISSION).CREATE(data);

      const result = await Action;

      if (id) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(`/permission/${result.data.data._id}`);
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
      state?.user && setUser(state.user);
      state?.allow && setAllow(state.allow);
      state?.allDoc && setAlldoc(state.allDoc);
      state?.doc && setDoc(state.doc);
      state?.value && setValue(state.value);
    }
  }, []);

  const onDuplicate = async () => {
    navigate("/permission/new", {
      state: { user, allow, allDoc, doc, value },
    });
    navigate(0);
  };

  // Cek perubahan
  useEffect(() => {
    const actualData = {
      user: user.valueData,
      allow: allow.valueData,
      value: value.valueData,
      allDoc: allDoc,
      doc: doc.valueData,
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [user, allow, value, allDoc, doc]);
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
                  onClick={() => navigate("/permission")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Permission" : data.user.name}
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
                    list={[
                      ...listMoreAction,
                      { name: "Duplicate", onClick: onDuplicate },
                    ]}
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
                      mandatoy
                      infiniteScroll={{
                        loading: userMoreLoading,
                        hasMore: userHasMore,
                        next: () => {
                          getUser();
                        },
                        onSearch(e) {
                          getUser(e);
                        },
                      }}
                      loading={userLoading}
                      onChange={(e) => {
                        ResetUser();
                        setUser({
                          ...user,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e: any) => {
                        setUser({ valueData: e.value, valueInput: e.name });

                        ResetUser();
                      }}
                      onReset={() => {
                        ResetUser();
                        setUser({
                          valueData: "",
                          valueInput: "",
                        });
                      }}
                      modalStyle="mt-2"
                      list={userList}
                      label="User"
                      value={user}
                      className="h-[38px] mb-3"
                      type="text"
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />
                    <InputComponent
                      mandatoy
                      label="Allow"
                      value={allow}
                      className="h-[38px] mb-3"
                      modalStyle="mt-2"
                      type="text"
                      onChange={(e) =>
                        setAllow({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      onReset={() => {
                        setAllow({ valueData: "", valueInput: "" });
                        setValue({ valueData: "", valueInput: "" });
                        ResetValue();
                      }}
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                      onSelected={(e) => {
                        setAllow({ valueData: e.value, valueInput: e.name });
                        setValue({ valueData: "", valueInput: "" });
                        ResetValue();
                      }}
                      list={allowList}
                    />
                    {allow.valueData && (
                      <InputComponent
                        mandatoy
                        infiniteScroll={{
                          loading: valueMoreLoading,
                          hasMore: valueHasMore,
                          next: () => {
                            setValueMoreLoading(true);
                            getValue({
                              refresh: false,
                              search: value.valueInput,
                            });
                          },
                          onSearch(e) {
                            ResetValue();
                            getValue({ refresh: true, search: e });
                          },
                        }}
                        onCLick={() => {
                          ResetValue();
                          getValue({
                            refresh: true,
                            search: value.valueInput,
                          });
                        }}
                        loading={valueLoading}
                        onChange={(e) => {
                          setValue({
                            ...value,
                            valueInput: e,
                          });
                        }}
                        onSelected={(e) => {
                          setValue({ valueData: e.value, valueInput: e.name });
                        }}
                        onReset={() => {
                          setValue({
                            valueData: "",
                            valueInput: "",
                          });
                        }}
                        list={valueList}
                        label="For Value"
                        value={value}
                        className="h-[38px] mb-3"
                        type="text"
                        modalStyle="mt-2"
                        disabled={
                          id != null
                            ? status !== "Draft"
                              ? true
                              : false
                            : false
                        }
                      />
                    )}
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
                      label="Created By"
                      value={createdBy}
                      className="h-[38px]  mb-3"
                      disabled
                    />
                    {id && (
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
                    )}
                  </div>
                </div>
              </div>
              <ToggleBodyComponent
                name="Advance Control"
                className="mt-5"
                child={
                  <div className="w-1/2">
                    <div className="flex item-center text-sm mb-4 text-gray-800">
                      <input
                        disabled={
                          id != null
                            ? status !== "Draft"
                              ? true
                              : false
                            : false
                        }
                        checked={allDoc}
                        onChange={() => {
                          if (!allDoc) {
                            setDoc({ valueData: "", valueInput: "" });
                          }
                          setAlldoc(!allDoc);
                        }}
                        type="checkbox"
                        className=" mt-[2px] mr-2"
                      />
                      <h4>Apply To All Document Types</h4>
                    </div>
                    {!allDoc && (
                      <InputComponent
                        mandatoy
                        label="Applicable For"
                        value={doc}
                        className="h-[38px] mb-3"
                        type="text"
                        onChange={(e) =>
                          setDoc({
                            valueData: e,
                            valueInput: e,
                          })
                        }
                        onReset={() => {
                          setDoc({ valueData: "", valueInput: "" });
                        }}
                        disabled={
                          id != null
                            ? status !== "Draft"
                              ? true
                              : false
                            : false
                        }
                        onSelected={(e) => {
                          setDoc({ valueData: e.value, valueInput: e.name });
                        }}
                        list={docList}
                      />
                    )}
                  </div>
                }
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

export default FormPermissionPage;

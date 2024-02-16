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
import { useDispatch } from "react-redux";
import FromWorkflowState from "../WorkflowState/FormWorkflowStatePage";
import FormWorkflowAction from "../WorkflowAction/FormWorkflowAction";
import FormRoleProfilePage from "../RoleProfile/FormRoleProfilePage";

const FormWorkflowPage: React.FC<any> = () => {
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
  const [saveHide, setSaveHideButton] = useState<boolean>(false);
  const [transitionIsChange, setTransitionIsChange] = useState<boolean>(false);
  const [changerIsChange, setChangerIsChange] = useState<boolean>(false);
  const [prevTransition, setPrevTransition] = useState<any[]>([]);
  const [prevChanger, setPrevChanger] = useState<any[]>([]);
  const [refreshStateTransition, setRefreshSetTransition] =
    useState<boolean>(false);

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

  const [status, setStatus] = useState<String>("0");
  const [prevData, setPrevData] = useState<any>({
    status: status,
    name: name.valueData,
    doc: doc.valueData,
  });

  const [states, setState] = useState<any[]>([]);
  const [transition, setTransition] = useState<any[]>([]);

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
        name: result.data.name,
        doc: result.data.doc,
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

  const onSave = async (): Promise<any> => {
    setSaveHideButton(true);
    try {
      let data: any = {
        name: name.valueData,
        status: status,
        doc: doc.valueData,
      };

      let Action = id
        ? GetDataServer(DataAPI.WORKFLOW).UPDATE({
            id: id,
            data: data,
          })
        : GetDataServer(DataAPI.WORKFLOW).CREATE(data);
      const result = await Action;
      if (id) {
        if (changerIsChange || transitionIsChange) {
          const listState = states.map((item: any) => {
            return item.state._id;
          });

          const StateNotValid = checkMissingStates(transition, listState);

          if (StateNotValid.length > 0) {
            setSaveHideButton(false);
            Swal.fire(
              "Error!",
              `States ${StateNotValid} Tidak ditemukan!`,
              "error"
            );

            return;
          }

          if (changerIsChange) {
            await UpdateChanger();
          }

          if (transitionIsChange) {
            await updateTransition();
          }
        }

        getData();
        setSaveHideButton(false)
        return Swal.fire({ icon: "success", text: "Saved" });
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
    setSaveHideButton(false);
  };

  const checkMissingStates = (transitions: any[], states: any[]) => {
    let missingStates: any[] = [];

    transitions.forEach((transition) => {
      let stateActiveId = transition.stateActive._id;
      let nextStateId = transition.nextState._id;

      if (!states.includes(stateActiveId)) {
        let stateName = transition.stateActive.name;
        if (!missingStates.includes(stateName)) {
          missingStates.push(stateName);
        }
      }

      if (!states.includes(nextStateId)) {
        let stateName = transition.nextState.name;
        if (!missingStates.includes(stateName)) {
          missingStates.push(stateName);
        }
      }
    });

    return missingStates;
  };

  const UpdateChanger = async () => {
    try {
      const update: any[] = states.map((change: any) => {
        return {
          roleprofile: change?.roleprofile?._id,
          selfApproval: change?.selfApproval,
          state: change?.state?._id,
          name: change?.state?.name,
          status: change?.status,
        };
      });

      // Hapus data lama
      prevChanger.forEach(async (item: any) => {
        if (item.id) {
          await GetDataServer(DataAPI.WORKFLOWCHANGER).DELETE(item.id);
        }
      });

      // Update
      for (let item of update) {
        item.workflow = id;
        item.status = `${item.status}`;
        await GetDataServer(DataAPI.WORKFLOWCHANGER).CREATE(item);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const updateTransition = async () => {
    try {
      const update: any[] = transition.map((item: any) => {
        return {
          stateActive: item?.stateActive?._id,
          action: item?.action?._id,
          nextState: item?.nextState?._id,
          roleprofile: item?.roleprofile?._id,
          selfApproval: item?.selfApproval,
        };
      });

      // Hapus data lama
      prevTransition.forEach(async (item: any) => {
        if (item.id) {
          await GetDataServer(DataAPI.WORKFLOWTRANSITION).DELETE(item.id);
        }
      });

      // // Update
      for (let item of update) {
        item.workflow = id;
        item.status = `${item.status}`;
        await GetDataServer(DataAPI.WORKFLOWTRANSITION).CREATE(item);
      }
    } catch (error: any) {
      throw error;
    }
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
      status: status,
      name: name.valueData,
      doc: doc.valueData,
    };
    if (
      JSON.stringify(actualData) !== JSON.stringify(prevData) ||
      changerIsChange ||
      transitionIsChange
    ) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [
    status,
    name.valueData,
    doc.valueData,
    changerIsChange,
    transitionIsChange,
  ]);
  // End

  useEffect(() => {
    const update = states.map((change: any) => {
      return {
        id: change._id,
        roleprofile: change?.roleprofile?._id,
        selfApproval: change?.selfApproval,
        state: change?.state?._id,
        status: change?.status,
      };
    });
    if (JSON.stringify(update) !== JSON.stringify(prevChanger)) {
      setChangerIsChange(true);
    } else {
      setChangerIsChange(false);
    }
  }, [prevChanger, states]);

  useEffect(() => {
    const prev = transition.map((change: any) => {
      return {
        id: change._id,
        stateActive: change?.stateActive?._id,
        action: change?.action?._id,
        nextState: change?.nextState?._id,
        roleprofile: change?.roleprofile?._id,
        selfApproval: change?.selfApproval,
      };
    });
    if (JSON.stringify(prev) !== JSON.stringify(prevTransition)) {
      setTransitionIsChange(true);
    } else {
      setTransitionIsChange(false);
    }
  }, [prevTransition, transition]);

  const checkIncompleteDataChanger = (): boolean => {
    let indexUncomplete: any[] = [];
    states.forEach((element: any, index: number) => {
      if (
        element?.roleprofile?._id == "" ||
        element?.state?._id == "" ||
        element?.status === ""
      ) {
        indexUncomplete.push(index);
      }
    });

    if (indexUncomplete.length > 0) {
      return false;
    }

    return true;
  };

  const checkIncompleteDataTransition = (): boolean => {
    let indexUncomplete: any[] = [];
    transition.forEach((element: any, index: number) => {
      if (
        element?.stateActive?._id == "" ||
        element?.action?._id == "" ||
        element?.nextState?._id == "" ||
        element?.roleprofile?._id == ""
      ) {
        indexUncomplete.push(index);
      }
    });

    if (indexUncomplete.length > 0) {
      return false;
    }

    return true;
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
                  onClick={() => navigate("/workflow")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Workflow" : data.name}
                </h4>
                <div className="text-md">
                  <ButtonStatusComponent
                    // className="text-[0.7em]"
                    status={data.status ?? "0"}
                    name={
                      id
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

                {isChangeData &&
                  checkIncompleteDataChanger() &&
                  checkIncompleteDataTransition() &&
                  !saveHide && (
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
                <>
                  <ToggleBodyComponent
                    toggle={false}
                    name="States"
                    className="mt-7"
                    child={
                      <StateComponent
                        setprevChanger={setPrevChanger}
                        workflow={id}
                        setState={setState}
                        states={states}
                      />
                    }
                  />
                  <ToggleBodyComponent
                    toggle={false}
                    name="Transitions"
                    className="mt-7"
                    child={
                      <TransitionComponent
                        setPrevTransition={setPrevTransition}
                        workflow={id}
                        setTransition={setTransition}
                        transitions={transition}
                      />
                    }
                  />
                </>
              )}
              <TimeLineVertical data={history} />
            </div>
          </>
        ) : (
          <LoadingComponent />
        )}
      </div>
      {saveHide && (
        <div className="w-[94%] h-[100vh] z-50 top-0 fixed bg-white flex items-center justify-center">
          <LoadingComponent />
        </div>
      )}
    </>
  );
};

const StateComponent: React.FC<{
  workflow: String | undefined;
  states: any[];
  setState: React.Dispatch<React.SetStateAction<any[]>>;
  setprevChanger: React.Dispatch<React.SetStateAction<any[]>>;
}> = ({ workflow, states, setState, setprevChanger }) => {
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

  const [allChecked, setAllchecked] = useState<boolean>(false);

  const getStateList = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      const duplicate: any[] = states
        .filter((item: any) => item.state._id !== "")
        .map((a: any) => {
          return ["name", "!=", `${a.state.name}`];
        });

      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.WORKFLOWSTATE).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : statePage}`,
        filters: [["status", "=", "1"], ...duplicate],
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
      setLoading(true)
      const result: any = await GetDataServer(DataAPI.WORKFLOWCHANGER).FIND({
        filters: [["workflow", "=", workflow!]],
        limit: 0,
        orderBy: { state: "createdAt", sort: 1 },
      });

      const data = result.data.map((item: any) => {
        item.checked = false;
        return { ...item };
      });
      const prev = data.map((change: any) => {
        return {
          id: change._id,
          roleprofile: change?.roleprofile?._id,
          selfApproval: change?.selfApproval,
          state: change?.state?._id,
          status: change?.status,
        };
      });
      setState(data);
      setprevChanger(prev);

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getState();
  }, []);

  return (
    <>
      {loading ? (
        LoadingComponent
      ) : (
        <table className="w-full border mb-3">
          <thead>
            <tr className="text-[0.95em] text-center color-[#7e7c7c] ">
              <td className="border border-r-0 h-12 w-[20px] ">
                <input
                  checked={allChecked}
                  type="checkbox"
                  className="accent-slate-600"
                  onChange={(e) => {
                    setAllchecked(e.target.checked);
                    const data = states.map((item: any) => {
                      item.checked = e.target.checked;
                      return { ...item };
                    });
                    setState(data);
                  }}
                />
              </td>
              <td className="border h-10 w-[30px] border-l-0 ">No</td>
              <td className="border w-[30%] ">State</td>
              <td className="border w-[25%]">Doc Status</td>
              <td className="border w-[25%]">Only Allow Edit For</td>
              <td className="border w-[20px]">Self Approval</td>
            </tr>
          </thead>
          <tbody>
            {states.map((item: any, index: number) => {
              return (
                <tr
                  key={index}
                  className={`text-center text-[0.95em] ${
                    item.checked && "bg-gray-50"
                  } `}
                >
                  <td className=" border border-r-0">
                    <input
                      type="checkbox"
                      className="accent-slate-600"
                      checked={item.checked}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setAllchecked(false);
                        }
                        item.checked = e.target.checked;
                        const newData = [...states];
                        setState(newData);
                      }}
                    />
                  </td>
                  <td className="border border-l-0">{index + 1}</td>
                  <td className="border">
                    <InputComponent
                      mandatoy
                      modal={{
                        Children: FromWorkflowState,
                        className: "w-[63%] h-[98%]",
                        props: {
                          modal: true,
                          name: item.state?.name ?? "",
                          Callback: (e: any) => {
                            item.state._id = e._id;
                            item.state.name = e.name;
                            const newData = [...states];
                            setState(newData);
                          },
                        },
                        title: "Form Workflow State",
                      }}
                      inputStyle={`${item.state._id && "border-none"} ${
                        item.checked ? "bg-gray-50" : "bg-white"
                      } rounded-none -mt-[2px] `}
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
                      loading={stateLoading}
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
                      mandatoy
                      value={{
                        valueData: item.status ?? 0,
                        valueInput: item.status?.toString() ?? 0,
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
                      inputStyle={`${item.status !== "" && "border-none"} ${
                        item.checked ? "bg-gray-50" : "bg-white"
                      } rounded-none -mt-[2px] text-center `}
                    />
                  </td>
                  <td className="border">
                    <InputComponent
                      mandatoy
                      modal={{
                        Children: FormRoleProfilePage,
                        className: "w-[63%] h-[98%]",
                        props: {
                          modal: true,
                          name: item.roleprofile?.name ?? "",
                          Callback: (e: any) => {
                            item.roleprofile._id = e._id;
                            item.roleprofile.name = e.name;
                            const newData = [...states];
                            setState(newData);
                          },
                        },
                        title: "Form Role",
                      }}
                      inputStyle={`${item.roleprofile._id && "border-none"} ${
                        item.checked ? "bg-gray-50" : "bg-white"
                      } rounded-none -mt-[2px] `}
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
                      loading={roleLoading}
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
                      className="accent-slate-600"
                      type="checkbox"
                      value={item.selfApproval}
                      checked={item.selfApproval}
                      onChange={(e) => {
                        item.selfApproval = e.target.checked;
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
      <button
        onClick={() => {
          const data = states.filter((item: any) => !item.checked);
          setState(data);
          setAllchecked(false);
        }}
        className="text-[0.9em] bg-[#eb655d] opacity-80 hover:opacity-100 duration-100 text-white rounded-md py-[2px] px-2 mr-1"
      >
        Delete
      </button>
      <button
        onClick={() => {
          states.push({
            _id: "",
            workflow: {
              _id: workflow,
              name: "",
            },
            state: {
              _id: "",
              name: "",
            },
            roleprofile: {
              _id: "",
              name: "",
            },
            status: "",
            selfApproval: false,
          });

          const newData = [...states];
          setState(newData);
        }}
        className="text-[0.9em] bg-[#f4f5f7]  opacity-80 hover:opacity-100 duration-100 rounded-md py-[2px] px-2"
      >
        Add Row
      </button>
    </>
  );
};

const TransitionComponent: React.FC<{
  workflow: String | undefined;
  transitions: any[];
  setTransition: React.Dispatch<React.SetStateAction<any[]>>;
  setPrevTransition: React.Dispatch<React.SetStateAction<any[]>>;
}> = ({ workflow, transitions, setTransition, setPrevTransition }) => {
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

  // Action
  const [actionList, setActionList] = useState<IListInput[]>([]);
  const [actionPage, setActionPage] = useState<Number>(1);
  const [actionLoading, setActionLoading] = useState<boolean>(true);
  const [actionMoreLoading, setActionMoreLoading] = useState<boolean>(false);
  const [actionHasMore, setActionHasMore] = useState<boolean>(false);
  // End

  const [allChecked, setAllchecked] = useState<boolean>(false);

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

  const getActionList = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.WORKFLOWACTION).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : actionPage}`,
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
          setActionList([...actionList, ...listInput]);
        } else {
          setActionList([...listInput]);
        }
        setActionHasMore(result.hasMore);
        setActionPage(result.nextPage);
      }

      setActionLoading(false);
      setActionMoreLoading(false);
    } catch (error: any) {
      setActionList([]);
      setActionLoading(false);
      setActionMoreLoading(false);
      setActionHasMore(false);
    }
  };

  const ResetAction = () => {
    setActionList([]);
    setActionHasMore(false);
    setActionPage(1);
    setActionLoading(true);
  };

  const getTransition = async () => {
    try {
      setLoading(true)
      const result: any = await GetDataServer(DataAPI.WORKFLOWTRANSITION).FIND({
        filters: [["workflow", "=", workflow!]],
        limit: 0,
        orderBy: { state: "createdAt", sort: 1 },
      });

      const data = result.data.map((item: any) => {
        item.checked = false;
        return { ...item };
      });
      setTransition(data);
      const prev = data.map((change: any) => {
        return {
          id: change._id,
          stateActive: change?.stateActive?._id,
          action: change?.action?._id,
          nextState: change?.nextState?._id,
          roleprofile: change?.roleprofile?._id,
          selfApproval: change?.selfApproval,
        };
      });
      setPrevTransition(prev);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransition();
  }, []);

  return (
    <>
      {loading ? (
        LoadingComponent
      ) : (
        <table className="w-full border mb-3">
          <thead>
            <tr className="text-[0.95em] text-center color-[#7e7c7c] ">
              <td className="border border-r-0 h-12 w-[40px] ">
                <input
                  type="checkbox"
                  className="accent-slate-600"
                  checked={allChecked}
                  onChange={(e) => {
                    setAllchecked(e.target.checked);
                    const data = transitions.map((item: any) => {
                      item.checked = e.target.checked;
                      return { ...item };
                    });
                    setTransition(data);
                  }}
                />
              </td>
              <td className="border h-10 w-[40px] border-l-0 ">No</td>
              <td className="border w-[20%]">State</td>
              <td className="border w-[20%">Action</td>
              <td className="border w-[20%">Next State</td>
              <td className="border w-[20%]">Allowed</td>
              <td className="border w-[80px]">Self Approval</td>
            </tr>
          </thead>
          <tbody>
            {transitions.map((item: any, index: number) => {
              return (
                <tr
                  key={index}
                  className={`text-center text-[0.95em] ${
                    item.checked && "bg-gray-50"
                  }`}
                >
                  <td className=" border border-r-0">
                    <input
                      type="checkbox"
                      className="accent-slate-600"
                      checked={item.checked}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setAllchecked(false);
                        }
                        item.checked = e.target.checked;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                    />
                  </td>
                  <td className="border border-l-0">{index + 1}</td>
                  <td className="border">
                    <InputComponent
                      mandatoy
                      modal={{
                        Children: FromWorkflowState,
                        className: "w-[63%] h-[98%]",
                        props: {
                          modal: true,
                          name: item.stateActive?.name ?? "",
                          Callback: (e: any) => {
                            item.stateActive._id = e._id;
                            item.stateActive.name = e.name;
                            const newData = [...transitions];
                            setTransition(newData);
                          },
                        },
                        title: "Form Workflow State",
                      }}
                      inputStyle={`${item.stateActive._id && "border-none"} ${
                        item.checked ? "bg-gray-50" : "bg-white"
                      } rounded-none -mt-[2px] `}
                      infiniteScroll={{
                        loading: stateMoreLoading,
                        hasMore: stateHasMore,
                        next: () => {
                          setStateMoreLoading(true);
                          getStateList({
                            refresh: false,
                            search: item.stateActive?.name ?? "",
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
                          search: item.stateActive?.name ?? "",
                        });
                      }}
                      loading={stateLoading}
                      modalStyle="mt-2"
                      value={{
                        valueData: item.stateActive?._id ?? "",
                        valueInput: item.stateActive?.name ?? "",
                      }}
                      onChange={(e) => {
                        item.stateActive.name = e;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      onSelected={(e) => {
                        item.stateActive._id = e.value;
                        item.stateActive.name = e.name;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      onReset={() => {
                        item.stateActive._id = "";
                        item.stateActive.name = "";
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      list={stateList}
                      type="text"
                      className={`text-left text-[1em]`}
                    />
                  </td>
                  <td className="border">
                    <InputComponent
                      mandatoy
                      modal={{
                        Children: FormWorkflowAction,
                        className: "w-[63%] h-[98%]",
                        props: {
                          modal: true,
                          name: item.action?.name ?? "",
                          Callback: (e: any) => {
                            item.action._id = e._id;
                            item.action.name = e.name;
                            const newData = [...transitions];
                            setTransition(newData);
                          },
                        },
                        title: "Form Action",
                      }}
                      inputStyle={`${item.action._id && "border-none"} ${
                        item.checked ? "bg-gray-50" : "bg-white"
                      } rounded-none -mt-[2px] `}
                      infiniteScroll={{
                        loading: actionMoreLoading,
                        hasMore: actionHasMore,
                        next: () => {
                          setActionMoreLoading(true);
                          getActionList({
                            refresh: false,
                            search: item.action?.name ?? "",
                          });
                        },
                        onSearch(e) {
                          ResetAction();
                          getActionList({ refresh: true, search: e });
                        },
                      }}
                      onCLick={() => {
                        ResetAction();
                        getActionList({
                          refresh: true,
                          search: item.action?.name ?? "",
                        });
                      }}
                      loading={actionLoading}
                      modalStyle="mt-2"
                      value={{
                        valueData: item.action?._id ?? "",
                        valueInput: item.action?.name ?? "",
                      }}
                      onChange={(e) => {
                        item.action.name = e;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      onSelected={(e) => {
                        item.action._id = e.value;
                        item.action.name = e.name;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      onReset={() => {
                        item.action._id = "";
                        item.action.name = "";
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      list={actionList}
                      type="text"
                      className={`text-left text-[1em]`}
                    />
                  </td>
                  <td className="border">
                    <InputComponent
                      mandatoy
                      modal={{
                        Children: FromWorkflowState,
                        className: "w-[63%] h-[98%]",
                        props: {
                          modal: true,
                          name: item.nextState?.name ?? "",
                          Callback: (e: any) => {
                            item.nextState._id = e._id;
                            item.nextState.name = e.name;
                            const newData = [...transitions];
                            setTransition(newData);
                          },
                        },
                        title: "Form Workflow State",
                      }}
                      inputStyle={`${item.nextState._id && "border-none"} ${
                        item.checked ? "bg-gray-50" : "bg-white"
                      } rounded-none -mt-[2px] `}
                      infiniteScroll={{
                        loading: stateMoreLoading,
                        hasMore: stateHasMore,
                        next: () => {
                          setStateMoreLoading(true);
                          getStateList({
                            refresh: false,
                            search: item.nextState?.name ?? "",
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
                          search: item.nextState?.name ?? "",
                        });
                      }}
                      loading={stateLoading}
                      modalStyle="mt-2"
                      value={{
                        valueData: item.nextState?._id ?? "",
                        valueInput: item.nextState?.name ?? "",
                      }}
                      onChange={(e) => {
                        item.nextState.name = e;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      onSelected={(e) => {
                        item.nextState._id = e.value;
                        item.nextState.name = e.name;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      onReset={() => {
                        item.nextState._id = "";
                        item.nextState.name = "";
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      list={stateList}
                      type="text"
                      className={`text-left text-[1em]`}
                    />
                  </td>
                  <td className="border">
                    <InputComponent
                      mandatoy
                      modal={{
                        Children: FormRoleProfilePage,
                        className: "w-[63%] h-[98%]",
                        props: {
                          modal: true,
                          name: item.roleprofile?.name ?? "",
                          Callback: (e: any) => {
                            item.roleprofile._id = e._id;
                            item.roleprofile.name = e.name;
                            const newData = [...transitions];
                            setTransition(newData);
                          },
                        },
                        title: "Form Role",
                      }}
                      inputStyle={`${item.roleprofile._id && "border-none"} ${
                        item.checked ? "bg-gray-50" : "bg-white"
                      } rounded-none -mt-[2px] `}
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
                      loading={roleLoading}
                      modalStyle="mt-2"
                      value={{
                        valueData: item.roleprofile?._id ?? "",
                        valueInput: item.roleprofile?.name ?? "",
                      }}
                      onChange={(e) => {
                        item.roleprofile.name = e;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      onSelected={(e) => {
                        item.roleprofile._id = e.value;
                        item.roleprofile.name = e.name;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      onReset={() => {
                        item.roleprofile._id = "";
                        item.roleprofile.name = "";
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                      list={roleList}
                      type="text"
                      className={`text-left text-[1em]`}
                    />
                  </td>
                  <td className="border">
                    <input
                      className="accent-slate-600"
                      type="checkbox"
                      name="sa"
                      value={item.selfApproval}
                      checked={item.selfApproval}
                      onChange={(e) => {
                        item.selfApproval = e.target.checked;
                        const newData = [...transitions];
                        setTransition(newData);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <button
        onClick={() => {
          const data = transitions.filter((item: any) => !item.checked);
          setTransition(data);
          setAllchecked(false);
        }}
        className="text-[0.9em] bg-[#eb655d] opacity-80 hover:opacity-100 duration-100 text-white rounded-md py-[2px] px-2 mr-1"
      >
        Delete
      </button>
      <button
        onClick={() => {
          transitions.push({
            _id: "",
            workflow: {
              _id: "",
              name: "",
            },
            stateActive: {
              _id: "",
              name: "",
            },
            action: {
              _id: "",
              name: "",
            },
            nextState: {
              _id: "",
              name: "",
            },
            roleprofile: {
              _id: "",
              name: "",
            },
            selfApproval: false,
          });

          const newData = [...transitions];
          setTransition(newData);
        }}
        className="text-[0.9em] bg-[#f4f5f7]  opacity-80 hover:opacity-100 duration-100 rounded-md py-[2px] px-2"
      >
        Add Row
      </button>
    </>
  );
};

export default FormWorkflowPage;

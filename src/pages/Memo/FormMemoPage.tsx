import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
import { AlertModal, FetchApi, LocalStorage, Meta } from "../../utils";

import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";
import { capitalizeFirstLetter } from "../../utils/CapitalistFirstText";
import ProfileImg from "../../assets/images/iconuser.jpg";

const FormMemoPage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${
      id ? data.name ?? "Loading .." : "New Memo"
    } - Sales App Ekatunggal`,
    description: "Halaman form memo - Sales web system",
  };

  const browseRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);

  const [naming, setNaming] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [startDate, setStartDate] = useState<IValue>({
    valueData: null,
    valueInput: "",
  });

  const [dueDate, setDueDate] = useState<IValue>({
    valueData: null,
    valueInput: "",
  });

  const [display, setDisplay] = useState<any[]>([]);
  const [displayList, setDisplayList] = useState<IListInput[]>([
    { name: "Visit", value: "visit" },
    { name: "Callsheet", value: "callsheet" },
    { name: "Dahsboard", value: "dashboard" },
    { name: "Modal", value: "alert" },
  ]);
  const [displayInput, setDisplayInput] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  // branch
  const [branch, setBranch] = useState<any[]>([]);
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

  // branch
  const [userGroup, setUserGroup] = useState<any[]>([]);
  const [userGroupList, setUserGroupList] = useState<IListInput[]>([]);
  const [userGroupPage, setUserGroupPage] = useState<Number>(1);
  const [userGroupLoading, setUserGroupLoading] = useState<boolean>(true);
  const [userGroupMoreLoading, setUserGroupMoreLoading] =
    useState<boolean>(false);
  const [userGroupHasMore, setUserGroupHasMore] = useState<boolean>(false);
  const [userGroupValue, setUserGroupValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  // branch
  const [group, setGroup] = useState<any[]>([]);
  const [groupList, setGroupList] = useState<IListInput[]>([]);
  const [groupPage, setGroupPage] = useState<Number>(1);
  const [groupLoading, setGroupLoading] = useState<boolean>(true);
  const [groupMoreLoading, setGroupMoreLoading] = useState<boolean>(false);
  const [groupHasMore, setGroupHasMore] = useState<boolean>(false);
  const [groupValue, setGroupValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [img, setImg] = useState<any>(ProfileImg);
  // End

  const [status, setStatus] = useState<String>("Draft");
  const [notes, setNotes] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [prevData, setPrevData] = useState<any>({
    title: title ?? "",
    notes: notes ?? "",
    branch: branch,
    startDate: startDate.valueData,
    dueDate: dueDate.valueData,
    display: display,
    group: group,
    userGroup: userGroup,
    img: img,
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const [file, setFile] = useState<File>();
  const [loadingNaming, setLoadingName] = useState<boolean>(true);
  const [listNaming, setListNaming] = useState<IListInput[]>([]);

  const imageHandler = (e: any) => {
    const reader: any = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImg(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.MEMO).FINDONE(`${id}`);

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

      setStartDate({
        valueData: moment(result.data.activeDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.activeDate).format("YYYY-MM-DD"),
      });
      setDueDate({
        valueData: moment(result.data.closingDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.closingDate).format("YYYY-MM-DD"),
      });

      if (result.data.img) {
        setImg(`${import.meta.env.VITE_PUBLIC_URI}/public/${result.data.img}`);
      }

      if (result.data.display) {
        const getDisplay = result.data.display.map((item: any) => {
          return {
            _id: item,
            name: capitalizeFirstLetter(item === "alert" ? "modal" : item),
          };
        });
        setDisplay(getDisplay);
      }

      if (result.data.customerGroup) {
        const genGroup = result.data.customerGroup.map((item: any) => {
          return {
            _id: item._id,
            name: item.name,
          };
        });
        setGroup(genGroup);
      }

      if (result.data.branch) {
        const genBranch = result.data.branch.map((item: any) => {
          return {
            _id: item._id,
            name: item.name,
          };
        });
        setBranch(genBranch);
      }

      setData(result.data);

      setPrevData({
        title: result?.data?.title ?? "",
        notes: result?.data?.notes ?? "",
        branch: result.data.branch
          ? result.data.branch.map((item: any) => {
              return { _id: item._id, name: item.name };
            })
          : [],
        startDate: moment(result.data.activeDate).format("YYYY-MM-DD"),
        dueDate: moment(result.data.closingDate).format("YYYY-MM-DD"),
        display: result.data.display
          ? result.data.display.map((item: any) => {
              return { _id: item, name: capitalizeFirstLetter(item === "alert" ? "modal" : item) };
            })
          : [],
        group: result?.data?.customerGroup
          ? result.data.customerGroup.map((item: any) => {
              return { _id: item._id, name: item.name };
            })
          : [],
        userGroup: result?.data?.userGroup
          ? result.data.userGroup.map((item: any) => {
              return { _id: item._id, name: item.name };
            })
          : [],
        img: result?.data?.img
          ? `${import.meta.env.VITE_PUBLIC_URI}/public/${result.data.img}`
          : ProfileImg,
      });
      if (result.data.title) {
        setTitle(result.data.title);
      }
      if (result.data.notes) {
        setNotes(result.data.notes);
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

      navigate("/memo");
    }
  };

  const getBranch = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    if (data.refresh === undefined) {
      data.refresh = true;
    }
    try {
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
      setBranchHasMore(false);
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

  const getGroup = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    if (data.refresh === undefined) {
      data.refresh = true;
    }
    try {
      const result: any = await GetDataServer(DataAPI.GROUP).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : groupPage}`,
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
          setGroupList([...groupList, ...listInput]);
        } else {
          setGroupList([...listInput]);
        }
        setGroupHasMore(result.hasMore);
        setGroupPage(result.nextPage);
      }

      setGroupLoading(false);
      setGroupMoreLoading(false);
    } catch (error: any) {
      setGroupLoading(false);
      setGroupMoreLoading(false);
      setGroupHasMore(false);
    }
  };

  const ResetGroup = () => {
    setGroupList([]);
    setGroupHasMore(false);
    setGroupPage(1);
    setGroupLoading(true);
  };

  const getUserGroup = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    if (data.refresh === undefined) {
      data.refresh = true;
    }
    try {
      const result: any = await GetDataServer(DataAPI.USERGROUP).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : userGroupPage}`,
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
          setUserGroupList([...userGroupList, ...listInput]);
        } else {
          setUserGroupList([...listInput]);
        }
        setUserGroupHasMore(result.hasMore);
        setUserGroupPage(result.nextPage);
      }

      setUserGroupLoading(false);
      setUserGroupMoreLoading(false);
    } catch (error: any) {
      setUserGroupLoading(false);
      setUserGroupMoreLoading(false);
      setUserGroupHasMore(false);
    }
  };

  const ResetUserGroup = () => {
    setUserGroupList([]);
    setUserGroupHasMore(false);
    setUserGroupPage(1);
    setUserGroupLoading(true);
  };

  const getNaming = async (): Promise<void> => {
    try {
      const result: any = await GetDataServer(DataAPI.NAMING).FIND({
        filters: [["doc", "=", "memo"]],
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

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.MEMO).DELETE(`${id}`);
          navigate("/memo");
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
      const inData = new FormData();

      if (nextState) {
        inData.append("nextState", `${nextState}`);
      } else {
        if (display.length === 0) {
          throw new Error("Display wajib diisi!");
        }
        file && inData.append("img", file);
        if (title) {
          inData.append("title", title);
        } else {
          throw new Error("Title wajib diisi!");
        }
        if (notes) {
          inData.append("notes", notes);
        } else {
          throw new Error("Notes wajib diisi!");
        }
        if (startDate.valueData) {
          inData.append("activeDate", startDate.valueData);
        } else {
          throw new Error("Start At Wajib Diisi!");
        }
        if (dueDate.valueData) {
          inData.append("closingDate", dueDate.valueData);
        } else {
          throw new Error("Closing At Wajib Diisi!");
        }
        inData.append(
          "display",
          JSON.stringify(display.map((item: any) => item._id))
        );

        inData.append(
          "customerGroup",
          JSON.stringify(group.map((item: any) => item._id))
        );
        inData.append(
          "branch",
          JSON.stringify(branch.map((item: any) => item._id))
        );
        inData.append(
          "userGroup",
          JSON.stringify(userGroup.map((item: any) => item._id))
        );
        if (!id) {
          inData.append("namingSeries", naming.valueData);
        }
      }

      let Action = id
        ? FetchApi.put(`${import.meta.env.VITE_PUBLIC_URI}/memo/${id}`, inData)
        : await FetchApi.post(
            `${import.meta.env.VITE_PUBLIC_URI}/memo`,
            inData
          );

      const result = await Action;

      if (id) {
        if (!file) {
          getData();
          Swal.fire({ icon: "success", text: "Saved" });
        } else {
          navigate(0);
        }
      } else {
        navigate(`/memo/${result.data.data._id}`);
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
    getNaming();
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
      title: title ?? "",
      notes: notes ?? "",
      branch: branch,
      startDate: startDate.valueData,
      dueDate: dueDate.valueData,
      display: display,
      group: group,
      userGroup: userGroup,
      img: img,
    };

    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [
    name,
    title,
    notes,
    display,
    startDate,
    dueDate,
    branch,
    group,
    userGroup,
    img,
  ]);
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
                  onClick={() => navigate("/memo")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New memo" : data.name}
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
              <div className="border w-full flex-1  bg-white rounded-md">
                <div className="w-full h-auto  float-left rounded-md p-3 py-10">
                  <div className=" w-1/2 px-4 float-left ">
                    {!id && (
                      <InputComponent
                        loading={loadingNaming}
                        label="Naming Series"
                        value={naming}
                        className="h-[38px]   mb-4"
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
                        mandatoy
                        label="Name"
                        value={name}
                        className="h-[38px] mb-4"
                        type="text"
                        disabled
                      />
                    )}

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

                    <label className="text-sm">Title</label>
                    <textarea
                      className="border mt-1 p-2 bg-gray-50  w-full rounded-md h-[90px]"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={
                        id != null
                          ? data.status !== "0"
                            ? true
                            : false
                          : false
                      }
                    />
                    <label className="text-sm">Notes</label>
                    <textarea
                      className="border mt-1 p-2 bg-gray-50  w-full rounded-md h-[227px]"
                      name="title"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={
                        id != null
                          ? data.status !== "0"
                            ? true
                            : false
                          : false
                      }
                    />
                    <InputComponent
                      remark="*Fill in if you want to be displayed in a particular branch"
                      label="Branch"
                      infiniteScroll={{
                        loading: branchMoreLoading,
                        hasMore: branchHasMore,
                        next: () => {
                          setBranchMoreLoading(true);
                          getBranch({
                            refresh: false,
                            search: branchValue.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetBranch();
                          getBranch({
                            refresh: true,
                            search: branchValue.valueInput,
                          });
                        },
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
                      onCLick={() => {
                        ResetBranch();
                        getBranch({
                          refresh: true,
                          search: branchValue.valueInput,
                        });
                      }}
                      onSelected={(e) => {
                        const cekDup = branch.find(
                          (item: any) => item._id === e.value
                        );

                        if (!cekDup) {
                          let genBranch = [
                            ...branch,
                            { _id: e.value, name: e.name },
                          ];
                          setBranch(genBranch);
                        }

                        setBranchValue({ valueData: "", valueInput: "" });
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
                        id != null
                          ? data.status !== "0"
                            ? true
                            : false
                          : false
                      }
                      className={`h-9 mb-3`}
                    />
                    {branch.length > 0 && (
                      <ul className="w-full h-auto mb-4 rounded-sm border p-2 float-left">
                        {branch.map((item: any, index: number) => {
                          return (
                            <li
                              onClick={() => {
                                if (!id || data.status === "0") {
                                  const genBranch = branch.filter((i: any) => {
                                    return i._id !== item._id;
                                  });

                                  setBranch(genBranch);
                                }
                              }}
                              key={index}
                              className=" mb-1 cursor-pointer duration-150 list-none px-2 py-1 text-sm rounded-md mr-1   bg-red-600 border-red-700  hover:bg-red-700 hover:border-red-800 text-white float-left flex items-center"
                            >
                              {item.name}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <img
                      crossOrigin="anonymous"
                      className="relative mt-4  object-contain border shadow-sm w-[300px] h-auto rounded-md"
                      src={img}
                      alt={"img"}
                      onError={(e: any) => {
                        e.target.src = ProfileImg;
                      }}
                    />
                    {(!id || data.status == "0") && (
                      <input
                        onChange={(e) => imageHandler(e)}
                        type="file"
                        name="image"
                        className="border  w-[280px] mt-1 text-sm"
                        accept="image/*"
                        ref={browseRef}
                      />
                    )}
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-4">
                    <InputComponent
                      disabled={id !== undefined && data.status != 0}
                      label="Start At"
                      value={startDate}
                      className="h-[38px] mb-4"
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
                        label="Closing At"
                        value={dueDate}
                        className="h-[38px]  mb-4"
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
                      label="Created At"
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
                      label="Created By"
                      value={user}
                      className="h-[38px]  mb-4"
                      onChange={(e) =>
                        setUser({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <InputComponent
                      remark="*Select you want to display anywhere"
                      label="Display"
                      value={displayInput}
                      className="h-[38px]  mb-3"
                      onChange={(e) =>
                        setDisplayInput({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      list={displayList}
                      onSelected={(e) => {
                        const cekDup = display.find(
                          (item: any) => item._id === e.value
                        );

                        if (!cekDup) {
                          let getDisplay = [
                            ...display,
                            { _id: e.value, name: e.name },
                          ];
                          setDisplay(getDisplay);
                        }

                        setDisplayInput({ valueData: "", valueInput: "" });
                      }}
                      onReset={() => {
                        setDisplayInput({
                          valueData: "",
                          valueInput: "",
                        });
                      }}
                      disabled={
                        id != null
                          ? data.status !== "0"
                            ? true
                            : false
                          : false
                      }
                    />
                    {display.length > 0 && (
                      <ul className="w-full h-auto rounded-sm border p-2 float-left">
                        {display.map((item: any, index: number) => {
                          return (
                            <li
                              onClick={() => {
                                if (!id || data.status === "0") {
                                  const genDisplay = display.filter(
                                    (i: any) => {
                                      return i._id !== item._id;
                                    }
                                  );

                                  setDisplay(genDisplay);
                                }
                              }}
                              key={index}
                              className=" mb-1 cursor-pointer duration-150list-none px-2 py-1 text-sm rounded-md mr-1   bg-red-600 border-red-700  hover:bg-red-700 hover:border-red-800 text-white float-left flex items-center"
                            >
                              {item.name}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <InputComponent
                      remark="*Fill in if you want to be displayed in a particular customer group"
                      label="Group"
                      infiniteScroll={{
                        loading: groupMoreLoading,
                        hasMore: groupHasMore,
                        next: () => {
                          setGroupMoreLoading(true);
                          getGroup({
                            refresh: false,
                            search: groupValue.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetGroup();
                          getGroup({
                            refresh: true,
                            search: groupValue.valueInput,
                          });
                        },
                      }}
                      loading={groupLoading}
                      modalStyle="mt-2"
                      value={groupValue}
                      onChange={(e) => {
                        setGroupValue({
                          ...groupValue,
                          valueInput: e,
                        });
                      }}
                      onCLick={() => {
                        ResetGroup();
                        getGroup({
                          refresh: true,
                          search: groupValue.valueInput,
                        });
                      }}
                      onSelected={(e) => {
                        const cekDup = group.find(
                          (item: any) => item._id === e.value
                        );

                        if (!cekDup) {
                          let getGroup = [
                            ...group,
                            { _id: e.value, name: e.name },
                          ];
                          setGroup(getGroup);
                        }

                        setGroupValue({ valueData: "", valueInput: "" });
                      }}
                      onReset={() => {
                        setGroupValue({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      list={groupList}
                      type="text"
                      disabled={
                        id != null
                          ? data.status !== "0"
                            ? true
                            : false
                          : false
                      }
                      className={`h-9 mb-3`}
                    />
                    {group.length > 0 && (
                      <ul className="w-full h-auto rounded-sm border p-2 float-left">
                        {group.map((item: any, index: number) => {
                          return (
                            <li
                              onClick={() => {
                                if (!id || data.status === "0") {
                                  const genGroup = group.filter((i: any) => {
                                    return i._id !== item._id;
                                  });

                                  setGroup(genGroup);
                                }
                              }}
                              key={index}
                              className=" mb-1 cursor-pointer duration-150list-none px-2 py-1 text-sm rounded-md mr-1   bg-red-600 border-red-700  hover:bg-red-700 hover:border-red-800 text-white float-left flex items-center"
                            >
                              {item.name}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <InputComponent
                      remark="*Fill in if you want to be displayed in a particular user group"
                      label="User Group"
                      infiniteScroll={{
                        loading: userGroupMoreLoading,
                        hasMore: userGroupHasMore,
                        next: () => {
                          setUserGroupMoreLoading(true);
                          getUserGroup({
                            refresh: false,
                            search: userGroupValue.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetUserGroup();
                          getUserGroup({
                            refresh: true,
                            search: userGroupValue.valueInput,
                          });
                        },
                      }}
                      loading={userGroupLoading}
                      modalStyle="mt-2"
                      value={userGroupValue}
                      onChange={(e) => {
                        setUserGroupValue({
                          ...userGroupValue,
                          valueInput: e,
                        });
                      }}
                      onCLick={() => {
                        ResetUserGroup();
                        getUserGroup({
                          refresh: true,
                          search: userGroupValue.valueInput,
                        });
                      }}
                      onSelected={(e) => {
                        const cekDup = userGroup.find(
                          (item: any) => item._id === e.value
                        );

                        if (!cekDup) {
                          let genUg = [
                            ...userGroup,
                            { _id: e.value, name: e.name },
                          ];
                          setUserGroup(genUg);
                        }

                        setUserGroupValue({ valueData: "", valueInput: "" });
                      }}
                      onReset={() => {
                        setUserGroupValue({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      list={userGroupList}
                      type="text"
                      disabled={
                        id != null
                          ? data.status !== "0"
                            ? true
                            : false
                          : false
                      }
                      className={`h-9 mb-3`}
                    />
                    {userGroup.length > 0 && (
                      <ul className="w-full h-auto rounded-sm border p-2 float-left">
                        {userGroup.map((item: any, index: number) => {
                          return (
                            <li
                              onClick={() => {
                                if (!id || data.status === "0") {
                                  const genUg = userGroup.filter((i: any) => {
                                    return i._id !== item._id;
                                  });

                                  setUserGroup(genUg);
                                }
                              }}
                              key={index}
                              className=" mb-1 cursor-pointer duration-150list-none px-2 py-1 text-sm rounded-md mr-1   bg-red-600 border-red-700  hover:bg-red-700 hover:border-red-800 text-white float-left flex items-center"
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

export default FormMemoPage;

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
import NotesPage from "../notes/NotesPage";
import React from "react";
import Swal from "sweetalert2";
import FormCustomerPage from "../Customer/FormCustomerPage";
import FormContactPage from "../Contact/FormContactPage";
import TaskPage from "../notes/TaskPage";
import { Buffer } from "buffer";

const FormVisitPage: React.FC = () => {
  let { id } = useParams();

  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${
      id ? data.name ?? "Loading .." : "New Visit"
    } - Sales App Ekatunggal`,
    description: "Halaman form visit sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);

  const dataCallType: any[] = [
    { title: "In site", value: "insite" },
    { title: "Out Site", value: "outsite" },
  ];
  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });

  const [naming, setNaming] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [picPhone, setPicPhone] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [picPosition, setPicPosition] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  // branch
  const [branchList, setBranchList] = useState<IListInput[]>([]);
  const [branchPage, setBranchPage] = useState<Number>(1);
  const [branchLoading, setBranchLoading] = useState<boolean>(true);
  const [branchMoreLoading, setBranchMoreLoading] = useState<boolean>(false);
  const [branchHasMore, setBranchHasMore] = useState<boolean>(false);
  const [branch, setBranch] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  // branch
  const [groupList, setGroupList] = useState<IListInput[]>([]);
  const [groupPage, setGroupPage] = useState<Number>(1);
  const [groupLoading, setGroupLoading] = useState<boolean>(true);
  const [groupMoreLoading, setGroupMoreLoading] = useState<boolean>(false);
  const [groupHasMore, setGroupHasMore] = useState<boolean>(false);
  const [group, setGroup] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  // branch
  const [contactList, sertContactList] = useState<IListInput[]>([]);
  const [contactPage, setContactPage] = useState<Number>(1);
  const [contactLoading, setContactLoading] = useState<boolean>(true);
  const [contactMoreLoading, setContactMoreLoading] = useState<boolean>(false);
  const [contactHasMore, setContactHasMore] = useState<boolean>(false);
  const [contact, setContact] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  // branch
  const [customerList, setCustomerList] = useState<IListInput[]>([]);
  const [customerPage, setCustomerPage] = useState<Number>(1);
  const [customerLoading, setCustomerLoading] = useState<boolean>(true);
  const [customerMoreLoading, setCustomerMoreLoading] =
    useState<boolean>(false);
  const [customerHasMore, setCustomerHasMore] = useState<boolean>(false);
  const [customer, setCustomer] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  const [type, settype] = useState<string>("insite");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingNaming, setLoadingName] = useState<boolean>(true);
  const [listNaming, setListNaming] = useState<IListInput[]>([]);
  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);
  const [task, setTask] = useState<any[]>([]);

  const [images, setImages] = useState<string[]>([]);

  const [prevData, setPrevData] = useState<any>({
    customer: customer.valueData,
    contact: contact.valueData,
  });

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.VISIT).FINDONE(`${id}`);

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

      if (result.data.taskNotes) {
        setTask(result.data.taskNotes);
      }

      let isImages: string[] = [];

      if (result?.data?.signature) {
        const signature = Buffer.from(`${result.data.signature}`, "base64");

        var blob = new Blob([signature.buffer], { type: "image/png" });
        var url: any = URL.createObjectURL(blob);

        isImages.push(url);
      }

      if (result?.data?.img) {
        isImages.push(
          `${import.meta.env.VITE_PUBLIC_URI}/public/${result.data.img}`
        );
      }

      setImages(isImages);

      setHistory(result.history);

      setData(result.data);

      // setCallType(result.data.type);

      setBranch({
        valueData: result.data.branch._id,
        valueInput: result.data.branch.name,
      });
      setName({
        valueData: result.data.name,
        valueInput: result.data.name,
      });
      setGroup({
        valueData: result.data.customerGroup._id,
        valueInput: result.data.customerGroup.name,
      });
      setCustomer({
        valueData: result.data.customer._id,
        valueInput: result.data.customer.name,
      });

      setUser({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });

      if (result?.data?.contact) {
        setContact({
          valueData: result.data.contact._id,
          valueInput: result.data.contact.name,
        });

        setPicPhone({
          valueData: result.data.contact.phone,
          valueInput: result.data.contact.phone,
        });

        setPicPosition({
          valueData: result.data.contact.position,
          valueInput: result.data.contact.position,
        });
      }

      setPrevData({
        customer: result.data.customer._id,
        contact: result?.data?.contact?._id ?? "",
      });

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/visit");
    }
  };
  console.log(images);
  const getNaming = async (): Promise<void> => {
    try {
      const result: any = await GetDataServer(DataAPI.NAMING).FIND({
        filters: [["doc", "=", "visit"]],
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

  const getBranch = async (data: {
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
          if (listInput.length === 1) {
            setBranch({
              valueData: listInput[0].value,
              valueInput: listInput[0].name,
            });
          }
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

  const getGroup = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.GROUP).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : groupPage}`,
        filters: [
          ["status", "=", "1"],
          ["branch._id", "=", branch.valueData],
        ],
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
          // if (listInput.length === 1) {
          //   setGroup({
          //     valueData: listInput[0].value,
          //     valueInput: listInput[0].name,
          //   });
          // }
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

  const getCustomer = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.CUSTOMER).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : customerPage}`,
        filters: [
          ["status", "=", "1"],
          ["customerGroup", "=", group.valueData],
        ],
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });
        if (!data.refresh) {
          setCustomerList([...customerList, ...listInput]);
        } else {
          setCustomerList([...listInput]);
        }
        setCustomerHasMore(result.hasMore);
        setCustomerPage(result.nextPage);
      }

      setCustomerLoading(false);
      setCustomerMoreLoading(false);
    } catch (error: any) {
      setCustomerLoading(false);
      setCustomerMoreLoading(false);
      setCustomerHasMore(false);
    }
  };

  const ResetCustomer = () => {
    setCustomerList([]);
    setCustomerHasMore(false);
    setCustomerPage(1);
    setCustomerLoading(true);
  };

  const getContact = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.CONTACT).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : contactPage}`,
        filters: [
          ["status", "=", "1"],
          ["customer", "=", customer.valueData],
        ],
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
            data: item,
          };
        });
        if (!data.refresh) {
          sertContactList([...contactList, ...listInput]);
        } else {
          sertContactList([...listInput]);
        }
        setContactHasMore(result.hasMore);
        setContactPage(result.nextPage);
      }

      setContactLoading(false);
      setContactMoreLoading(false);
    } catch (error: any) {
      setContactLoading(false);
      setContactMoreLoading(false);
      setContactHasMore(false);
    }
  };

  const ResetContact = () => {
    sertContactList([]);
    setContactHasMore(false);
    setContactPage(1);
    setContactLoading(true);
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.VISIT).DELETE(`${id}`);
          navigate("/visit");
        } catch (error: any) {
          setLoading(false);
          Swal.fire(
            "Error!",
            `${
              error?.response?.data?.msg?.message ??
              error?.response?.data?.msg ??
              error ??
              "Error Insert"
            }`,
            "error"
          );
        }
      };

      AlertModal.confirmation({ onConfirm: progress });
      setLoading(false);
    }
  };

  const onSave = async (nextState?: String): Promise<any> => {
    setLoading(true);
    try {
      let updata: any = {};
      if (nextState) {
        updata = { nextState: nextState };
      } else {
        updata = {
          customer: customer.valueData,
          contact: contact.valueData,
        };

        if (!id) {
          updata["namingSeries"] = naming.valueData;
        }
      }

      let Action = id
        ? GetDataServer(DataAPI.VISIT).UPDATE({ id: id, data: updata })
        : GetDataServer(DataAPI.VISIT).CREATE(updata);

      const result = await Action;
      if (id) {
        getData();

        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(`/visit/${result.data.data._id}`);
        navigate(0);
      }
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      Swal.fire(
        "Error!",
        `${
          error?.response?.data?.msg?.message ??
          error?.response?.data?.msg ??
          error ??
          "Error Insert"
        }`,
        "error"
      );
    }

    setLoading(false);
  };
  useEffect(() => {
    getNaming();
    getBranch({ refresh: true });
    getGroup({ refresh: true });
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
      customer: customer.valueData,
      contact: contact.valueData,
    };

    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [type, customer, contact]);
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
                  onClick={() => navigate("/visit")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New visit" : data.name}
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
                <div className="w-full h-auto  rounded-md p-3 py-5">
                  <div className=" w-1/2 px-4 float-left ">
                    {id && (
                      <InputComponent
                        label="Name"
                        value={name}
                        className="h-[38px]  text-[0.93em] mb-3"
                        type="text"
                        disabled
                      />
                    )}
                    {!id && (
                      <InputComponent
                        loading={loadingNaming}
                        label="Naming Series"
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
                    <Select
                      title="Type"
                      data={dataCallType}
                      value={type}
                      setValue={settype}
                      disabled
                    />
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

                    <InputComponent
                      mandatoy
                      label="Branch"
                      infiniteScroll={{
                        loading: branchMoreLoading,
                        hasMore: branchHasMore,
                        next: () => {
                          setBranchMoreLoading(true);
                          getBranch({
                            refresh: false,
                            search: branch.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetBranch();
                          getBranch({ refresh: true, search: e });
                        },
                      }}
                      onCLick={() => {
                        ResetBranch();
                        getBranch({
                          refresh: true,
                          search: branch.valueInput,
                        });
                      }}
                      loading={branchLoading}
                      modalStyle="mt-2"
                      value={branch}
                      onChange={(e) => {
                        setBranch({
                          ...branch,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e) => {
                        setBranch({ valueData: e.value, valueInput: e.name });
                        setGroup({
                          valueData: null,
                          valueInput: "",
                        });
                        setCustomer({
                          valueData: null,
                          valueInput: "",
                        });
                        setContact({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      onReset={() => {
                        setBranch({
                          valueData: null,
                          valueInput: "",
                        });
                        setGroup({
                          valueData: null,
                          valueInput: "",
                        });
                        setCustomer({
                          valueData: null,
                          valueInput: "",
                        });
                        setContact({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      list={branchList}
                      type="text"
                      className={`h-9 mb-10`}
                      disabled={
                        id != null
                          ? data.status !== "0"
                            ? true
                            : false
                          : false
                      }
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
                    {branch.valueData && (
                      <InputComponent
                        mandatoy
                        label="Group"
                        infiniteScroll={{
                          loading: groupMoreLoading,
                          hasMore: groupHasMore,
                          next: () => {
                            setGroupMoreLoading(true);
                            getGroup({
                              refresh: false,
                              search: group.valueInput,
                            });
                          },
                          onSearch(e) {
                            ResetGroup();
                            getGroup({ refresh: true, search: e });
                          },
                        }}
                        onCLick={() => {
                          getGroup({
                            refresh: true,
                            search: group.valueInput,
                          });
                        }}
                        loading={groupLoading}
                        modalStyle="mt-2"
                        value={group}
                        onChange={(e) => {
                          setGroup({
                            ...branch,
                            valueInput: e,
                          });
                          setCustomer({
                            valueData: null,
                            valueInput: "",
                          });
                          setContact({
                            valueData: null,
                            valueInput: "",
                          });
                        }}
                        onSelected={(e) => {
                          setGroup({ valueData: e.value, valueInput: e.name });
                          setCustomer({
                            valueData: null,
                            valueInput: "",
                          });
                          setContact({
                            valueData: null,
                            valueInput: "",
                          });
                        }}
                        onReset={() => {
                          setGroup({
                            valueData: null,
                            valueInput: "",
                          });
                          setCustomer({
                            valueData: null,
                            valueInput: "",
                          });
                          setContact({
                            valueData: null,
                            valueInput: "",
                          });
                        }}
                        list={groupList}
                        type="text"
                        className={`h-9 mb-4`}
                        disabled={
                          id != null
                            ? data.status !== "0"
                              ? true
                              : false
                            : false
                        }
                      />
                    )}
                    {group.valueData && (
                      <InputComponent
                        modal={{
                          Children: FormCustomerPage,
                          className: "w-[63%] h-[98%]",
                          props: {
                            modal: true,
                            group: group,
                            branch: branch,
                            name: customer.valueInput,
                            Callback: setCustomer,
                          },
                          title: "Form Customer",
                        }}
                        mandatoy
                        label="Customer"
                        infiniteScroll={{
                          loading: customerMoreLoading,
                          hasMore: customerHasMore,
                          next: () => {
                            setCustomerMoreLoading(true);
                            getCustomer({
                              refresh: false,
                              search: customer.valueInput,
                            });
                          },
                          onSearch(e) {
                            ResetCustomer();
                            getCustomer({ refresh: true, search: e });
                          },
                        }}
                        onCLick={() => {
                          ResetCustomer();
                          getCustomer({
                            refresh: true,
                            search: customer.valueInput,
                          });
                        }}
                        loading={customerLoading}
                        modalStyle="mt-2"
                        value={customer}
                        onChange={(e) => {
                          setCustomer({
                            ...customer,
                            valueInput: e,
                          });
                          setContact({
                            valueData: null,
                            valueInput: "",
                          });
                        }}
                        onSelected={(e) => {
                          setCustomer({
                            valueData: e.value,
                            valueInput: e.name,
                          });
                          setContact({
                            valueData: null,
                            valueInput: "",
                          });
                        }}
                        onReset={() => {
                          setCustomer({
                            valueData: null,
                            valueInput: "",
                          });
                          setContact({
                            valueData: null,
                            valueInput: "",
                          });
                        }}
                        list={customerList}
                        type="text"
                        className={`h-9 mb-4`}
                        disabled={
                          id != null
                            ? data.status !== "0"
                              ? true
                              : false
                            : false
                        }
                      />
                    )}
                    {customer.valueData && (
                      <InputComponent
                        modal={{
                          Children: FormContactPage,
                          className: "w-[63%] h-[98%]",
                          props: {
                            modal: true,
                            customer: customer,
                            branch: branch,
                            group: group,
                            name: contact.valueInput,
                            Callback: setContact,
                            setPhone: setPicPhone,
                            setPosition: setPicPosition,
                          },
                          title: "Form Contact",
                        }}
                        mandatoy
                        label="Contact"
                        infiniteScroll={{
                          loading: contactMoreLoading,
                          hasMore: contactHasMore,
                          next: () => {
                            setContactMoreLoading(true);
                            getContact({
                              refresh: false,
                              search: contact.valueInput,
                            });
                          },
                          onSearch(e) {
                            ResetContact();
                            getContact({ refresh: true, search: e });
                          },
                        }}
                        onCLick={() => {
                          ResetContact();
                          getContact({
                            refresh: true,
                            search: contact.valueInput,
                          });
                        }}
                        loading={contactLoading}
                        modalStyle="mt-2"
                        value={contact}
                        onChange={(e) => {
                          setContact({
                            ...customer,
                            valueInput: e,
                          });
                        }}
                        onSelected={(e) => {
                          setContact({
                            valueData: e.value,
                            valueInput: e.name,
                          });
                          setPicPhone({
                            valueData: e.data.phone,
                            valueInput: e.data.phone,
                          });
                          setPicPosition({
                            valueData: e.data.position,
                            valueInput: e.data.position,
                          });
                        }}
                        onReset={() => {
                          setContact({
                            valueData: null,
                            valueInput: "",
                          });
                          setPicPhone({ valueData: null, valueInput: "" });
                          setPicPosition({ valueData: null, valueInput: "" });
                        }}
                        list={contactList}
                        type="text"
                        className={`h-9 mb-3`}
                        disabled={
                          id != null
                            ? data.status !== "0"
                              ? true
                              : false
                            : false
                        }
                      />
                    )}
                    {contact.valueData && (
                      <>
                        <InputComponent
                          label="Phone"
                          value={picPhone}
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
                          label="Position"
                          value={picPosition}
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
                      </>
                    )}
                  </div>
                </div>
              </div>
              {id && images.length > 0 && (
                <ToggleBodyComponent
                  name="Image & Signature"
                  className="mt-5"
                  child={
                    <div className="w-full float-left">
                      {images.map((item: any) => {
                        return (
                          <img
                            src={item}
                            alt={item}
                            className={`rounded-md w-auto mr-5  h-[250px] border float-left  object-contain cursor-pointer ${item.includes("blob:")&&"p-16"}`}
                          />
                        );
                      })}
                    </div>
                  }
                />
              )}
              {id && task.length > 0 && (
                <ToggleBodyComponent
                  name="Tasks"
                  className="mt-5"
                  child={
                    <TaskPage
                      props={{ docId: id, data: task, status: data.status }}
                    />
                  }
                />
              )}
              {id && (
                <ToggleBodyComponent
                  name="Result"
                  className="mt-5"
                  child={
                    <NotesPage props={{ docId: id, data: data }} type="visit" />
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

export default React.memo(FormVisitPage);

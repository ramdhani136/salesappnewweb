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
import NotesPage from "../notes/NotesPage";
import React from "react";

const FormCallsheetPage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${id ? data.name : "New Callsheet"} - Sales App Ekatunggal`,
    description: "Halaman form callsheet sales web system",
  };

  const navigate = useNavigate();

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

  const [group, setGroup] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [customer, setCustomer] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [contact, setContact] = useState<IValue>({
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

  const [callType, setCallType] = useState<string>("out");
  const [loading, setLoading] = useState<boolean>(true);
  const [customerHasMore, setCustomerHasMore] = useState<boolean>(false);
  const [customerPage, setCustomerPage] = useState<Number>(1);
  const [contactHasMore, setContactHasMore] = useState<boolean>(false);
  const [contactPage, setContactPage] = useState<Number>(1);
  const [loadingNaming, setLoadingName] = useState<boolean>(true);
  const [loadingGroup, setLoadingGroup] = useState<boolean>(true);
  const [loadingBranch, setLoadingBranch] = useState<boolean>(true);
  const [loadingContact, setLoadingContact] = useState<boolean>(true);
  const [loadingCustomer, setLoadingCustomer] = useState<boolean>(true);
  const [customerMoreLoading, setCustomerMoreLoading] = useState<boolean>(true);
  const [contactMoreLoading, setContactMoreLoading] = useState<boolean>(true);
  const [listNaming, setListNaming] = useState<IListInput[]>([]);
  const [listGroup, setListGroup] = useState<IListInput[]>([]);
  const [listContact, setListContact] = useState<IListInput[]>([]);
  const [listBranch, setListBranch] = useState<IListInput[]>([]);
  const [listCustomer, setListCustomer] = useState<IListInput[]>([]);
  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getResetCustomer = () => {
    setListCustomer([]);
    setCustomerHasMore(false);
    setCustomerPage(1);
    setLoadingCustomer(true);
  };

  const contactReset = () => {
    setPicPhone({ valueData: null, valueInput: "" });
    setPicPosition({ valueData: null, valueInput: "" });
    setListContact([]);
    setContactHasMore(false);
    setContactPage(1);
    setLoadingContact(true);
  };

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.CALLSHEET).FINDONE(`${id}`);

      // set workflow
      if (result.workflow.length > 0) {
        const isWorkflow = result.workflow.map((item: any): IListIconButton => {
          return {
            name: item.action,
            onClick: () => {
              onSave({
                nextState: item.nextState.id,
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

      setBranch({
        valueData: result.data.branch._id,
        valueInput: result.data.branch.name,
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

      if (result.data.contact) {
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

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/callsheet");
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

  const getGroup = async (): Promise<void> => {
    if (branch.valueData) {
      try {
        const result: any = await GetDataServer(DataAPI.GROUP).FIND({});
        if (result.data.length > 0) {
          let listInput: IListInput[] = result.data.map((item: any) => {
            return {
              name: item.name,
              value: item._id,
            };
          });

          if (listInput.length === 1) {
            setGroup({
              valueData: listInput[0].value,
              valueInput: listInput[0].name,
            });
          }

          setListGroup(listInput);
        }
        setLoadingGroup(false);
      } catch (error) {
        setLoadingGroup(false);
      }
    }
  };

  const getCustomer = async (search?: string): Promise<void> => {
    if (!loadingCustomer) {
      setCustomerMoreLoading(true);
    } else {
      setCustomerMoreLoading(false);
    }

    if (customerPage === 1) {
      setListCustomer([]);
    }

    if (branch.valueData && group.valueData) {
      try {
        let filters: [String, String, String][] = [
          ["customerGroup", "=", group.valueData],
        ];

        const result: any = await GetDataServer(DataAPI.CUSTOMER).FIND({
          page: `${customerPage}`,
          filters: filters,
          limit: 10,
          search: search ?? "",
        });
        if (result.data.length > 0) {
          let listInput: IListInput[] = result.data.map((item: any) => {
            return {
              name: item.name,
              value: item._id,
            };
          });

          setListCustomer([...listCustomer, ...listInput]);
          setCustomerHasMore(result.hasMore);
          setCustomerPage(result.nextPage);
        }
        setLoadingCustomer(false);
        setCustomerMoreLoading(false);
      } catch (error) {
        setCustomerHasMore(false);
        setLoadingCustomer(false);
        setCustomerMoreLoading(false);
      }
    }
  };

  const getContact = async (search?: string): Promise<void> => {
    if (!loadingCustomer) {
      setContactMoreLoading(true);
    } else {
      setContactMoreLoading(false);
    }

    if (contactPage === 1) {
      setListContact([]);
    }

    if (customer.valueData) {
      try {
        let filters: [String, String, String][] = [
          ["customer", "=", customer.valueData],
        ];

        const result: any = await GetDataServer(DataAPI.CONTACT).FIND({
          page: `${contactPage}`,
          filters: filters,
          limit: 10,
          search: search ?? "",
        });
        if (result.data.length > 0) {
          let listInput: IListInput[] = result.data.map((item: any) => {
            return {
              name: item.name,
              value: item._id,
              other: {
                phone: item.phone,
                position: item.position,
              },
            };
          });

          setListContact([...listContact, ...listInput]);
          setContactHasMore(result.hasMore);
          setContactPage(result.nextPage);
        }
        setLoadingContact(false);
        setContactMoreLoading(false);
      } catch (error) {
        setContactHasMore(false);
        setLoadingContact(false);
        setContactMoreLoading(false);
      }
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
                        setGroup({ valueData: null, valueInput: "" });
                        setCustomer({ valueData: null, valueInput: "" });
                        getResetCustomer();
                        setContact({ valueData: null, valueInput: "" });
                        contactReset();
                        getGroup();
                      }}
                      onCLick={getBranch}
                      list={listBranch}
                      mandatoy
                      modalStyle="top-9 max-h-[160px]"
                      onReset={() => {
                        setBranch({ valueData: null, valueInput: "" });
                        setGroup({ valueData: null, valueInput: "" });
                        setCustomer({ valueData: null, valueInput: "" });
                        getResetCustomer();
                        setContact({ valueData: null, valueInput: "" });
                        contactReset();
                      }}
                      // disabled={!id ? false : true}
                      closeIconClass="top-[13.5px]"
                    />
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-3">
                    {branch.valueData && (
                      <InputComponent
                        loading={loadingGroup}
                        label="Group"
                        value={group}
                        className="h-[38px]   text-[0.93em] mb-3"
                        onChange={(e) => setGroup({ ...naming, valueInput: e })}
                        onSelected={(e) => {
                          setGroup({
                            valueData: e.value,
                            valueInput: e.name,
                          });

                          setCustomer({ valueData: null, valueInput: "" });
                          setContact({ valueData: null, valueInput: "" });
                          contactReset();
                          getResetCustomer();
                        }}
                        onCLick={getGroup}
                        list={listGroup}
                        mandatoy
                        modalStyle="top-9 max-h-[160px]"
                        onReset={() => {
                          setGroup({ valueData: null, valueInput: "" });
                          setCustomer({ valueData: null, valueInput: "" });
                          setContact({ valueData: null, valueInput: "" });
                          contactReset();
                          getResetCustomer();
                        }}
                        // disabled={!id ? false : true}
                        closeIconClass="top-[13.5px]"
                      />
                    )}
                    {group.valueData && (
                      <InputComponent
                        infiniteScroll={{
                          loading: customerMoreLoading,
                          hasMore: customerHasMore,
                          next: () => {
                            getCustomer(`${customer.valueInput}`);
                          },
                          onSearch(e) {
                            getCustomer(e);
                          },
                        }}
                        loading={loadingCustomer}
                        label="Customer"
                        value={customer}
                        className="h-[38px]   text-[0.93em] mb-3"
                        onChange={(e) => {
                          getResetCustomer();
                          setLoadingCustomer(true);
                          setCustomer({ ...naming, valueInput: e });
                        }}
                        onSelected={(e) => {
                          getResetCustomer();
                          setContact({ valueData: null, valueInput: "" });
                          contactReset();
                          console.log(e);
                          setCustomer({
                            valueData: e.value,
                            valueInput: e.name,
                          });
                        }}
                        // onCLick={() => {
                        //   // setCustomerHasMore(false);
                        //   // setCustomerPage(1);
                        //   // setLoadingCustomer(true);
                        //   // setListCustomer([]);
                        //   // getCustomer();
                        // }}
                        list={listCustomer}
                        mandatoy
                        modalStyle="top-9 max-h-[160px]"
                        onReset={() => {
                          getResetCustomer();
                          setCustomer({ valueData: null, valueInput: "" });
                          setContact({ valueData: null, valueInput: "" });
                          contactReset();
                        }}
                        // disabled={!id ? false : true}
                        closeIconClass="top-[13.5px]"
                      />
                    )}
                    {customer.valueData && (
                      <InputComponent
                        infiniteScroll={{
                          loading: contactMoreLoading,
                          hasMore: contactHasMore,
                          next: () => {
                            getContact(`${contact.valueInput}`);
                          },
                          onSearch(e) {
                            getContact(e);
                          },
                        }}
                        loading={loadingContact}
                        label="Contact"
                        value={contact}
                        className="h-[38px]   text-[0.93em] mb-3"
                        onChange={(e) => {
                          contactReset();
                          setLoadingContact(true);
                          setContact({ ...naming, valueInput: e });
                        }}
                        onSelected={(e) => {
                          contactReset();
                          setPicPhone({
                            valueData: e.other.phone,
                            valueInput: e.other.phone,
                          });
                          setPicPosition({
                            valueData: e.other.position,
                            valueInput: e.other.position,
                          });
                          setContact({
                            valueData: e.value,
                            valueInput: e.name,
                          });
                        }}
                        list={listContact}
                        mandatoy
                        modalStyle="top-9 max-h-[160px]"
                        onReset={() => {
                          contactReset();
                          setContact({ valueData: null, valueInput: "" });
                        }}
                        // disabled={!id ? false : true}
                        closeIconClass="top-[13.5px]"
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
              {id && (
                <ToggleBodyComponent
                  name="Result"
                  className="mt-5"
                  child={<NotesPage props={[]} />}
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

export default React.memo(FormCallsheetPage);

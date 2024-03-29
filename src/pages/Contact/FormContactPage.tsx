import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
import { modalSet } from "../../redux/slices/ModalSlice";
import { useDispatch } from "react-redux";

const FormContactPage: React.FC<any> = ({ props }) => {
  const modal = props ? props.modal ?? false : false;
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${
      id ? data.name ?? "Loading .." : "New Contact"
    } - Sales App Ekatunggal`,
    description: "Halaman form Contact Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const dataType: any[] = [
    { title: "Purchasing Staff", value: "Purchasing Staff" },
    { title: "Purchasing Manager", value: "Purchasing Manager" },
  ];
  const [position, setPosition] = useState<string>("Purchasing Staff");

  // customer
  const [customerList, setCustomerLlist] = useState<IListInput[]>([]);
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
  const [branch, setBranch] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [group, setGroup] = useState<IValue>({
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
  const [phone, setPhone] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [status, setStatus] = useState<String>("Draft");
  const [prevData, setPrevData] = useState<any>({
    name: name.valueData,
    position: position,
    customer: customer.valueData,
    phone: phone.valueData,
  });

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const dispatch = useDispatch();

  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.CONTACT).FINDONE(`${id}`);

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

      setPhone({
        valueData: result.data.phone,
        valueInput: result.data.phone,
      });

      setCustomer({
        valueData: result.data.customer._id,
        valueInput: result.data.customer.name,
      });
      setBranch({
        valueData: result.data.customer.branch._id,
        valueInput: result.data.customer.branch.name,
      });
      setGroup({
        valueData: result.data.customer.customerGroup._id,
        valueInput: result.data.customer.customerGroup.name,
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

      setPosition(result.data.position);

      setPrevData({
        name: result.data.name,
        position: result.data.position,
        customer: result.data.customer._id,
        phone: `${result.data.phone}`,
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

      navigate("/contact");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.CONTACT).DELETE(`${id}`);
          navigate("/contact");
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

  const getCustomer = async (search?: string): Promise<void> => {
    try {
      if (!customerLoading) {
        setCustomerMoreLoading(true);
      } else {
        setCustomerMoreLoading(false);
      }

      const result: any = await GetDataServer(DataAPI.CUSTOMER).FIND({
        search: search ?? "",
        limit: 10,
        page: `${customerPage}`,
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
        setCustomerLlist([...customerList, ...listInput]);
        setCustomerHasMore(result.hasMore);

        setCustomerPage(result.nextPage);
      }

      setCustomerLoading(false);
      setCustomerMoreLoading(false);
    } catch (error: any) {
      setLoading(false);
      setCustomerMoreLoading(false);
      setCustomerHasMore(false);
    }
  };

  const ResetCustomer = () => {
    setCustomerLlist([]);
    setCustomerHasMore(false);
    setCustomerPage(1);
    setCustomerLoading(true);
  };

  useEffect(() => {
    if (id && !modal) {
      getData();
      setListMoreAction([{ name: "Delete", onClick: onDelete }]);
    } else {
      setLoading(false);
      setListMoreAction([]);
    }
    if (modal) {
      setCustomer(props.customer);
      setBranch(props.branch);
      setGroup(props.group);
      setName({ valueData: props.name, valueInput: props.name });
    }
  }, []);

  const onSave = async (nextState?: String): Promise<any> => {
    setLoading(true);
    try {
      let updata: any = {};
      if (nextState) {
        updata = { nextState: nextState };
      } else {
        if (!name.valueData) {
          throw new Error("Nama wajib diisi!");
        }
        if (!customer.valueData) {
          throw new Error("Customer wajib diisi!");
        }
        if (!phone.valueData) {
          throw new Error("Phone wajib diisi!");
        }
        updata = {
          name: name.valueData,
          position: position,
          customer: customer.valueData,
          phone: phone.valueData,
        };
      }

      if (modal) {
        updata["status"] = "1";
        updata["workflowState"] = "Submitted";
      }

      let Action =
        id && !modal
          ? GetDataServer(DataAPI.CONTACT).UPDATE({ id: id, data: updata })
          : GetDataServer(DataAPI.CONTACT).CREATE(updata);

      const result = await Action;
      if (id && !modal) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        if (modal) {
          props.Callback({
            valueData: result?.data?.data?._id,
            valueInput: result?.data?.data?.name,
          });
          props.setPosition({
            valueData: position,
            valueInput: position,
          });
          props.setPhone({
            valueData: phone.valueData,
            valueInput: phone.valueData,
          });
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
          navigate(`/contact/${result.data.data._id}`);
          navigate(0);
        }
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
    ResetCustomer();

    setLoading(false);
  };
  // Cek perubahan
  useEffect(() => {
    const actualData = {
      name: name.valueData,
      position: position,
      customer: customer.valueData,
      phone: `${phone.valueData}`,
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [name, position, branch, group, phone]);
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
                  onClick={() => navigate("/contact")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Contact" : data.name}
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
                      mandatoy
                      label="Name"
                      value={name}
                      className="h-[38px]  mb-4"
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
                      title="Position"
                      data={dataType}
                      value={position}
                      setValue={setPosition}
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />

                    <InputComponent
                      mandatoy
                      label="Customer"
                      infiniteScroll={{
                        loading: customerMoreLoading,
                        hasMore: customerHasMore,
                        next: () => {
                          getCustomer();
                        },
                        onSearch(e) {
                          getCustomer(e);
                        },
                      }}
                      loading={customerLoading}
                      modalStyle="mt-2"
                      value={customer}
                      onChange={(e) => {
                        ResetCustomer();
                        setCustomerLoading(true);
                        setCustomer({
                          ...branch,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e: any) => {
                        setCustomer({ valueData: e.value, valueInput: e.name });
                        setBranch({
                          valueData: e.data.branch._id,
                          valueInput: e.data.branch.name,
                        });
                        setGroup({
                          valueData: e.data.customerGroup._id,
                          valueInput: e.data.customerGroup.name,
                        });

                        ResetCustomer();
                      }}
                      onReset={() => {
                        ResetCustomer();
                        setCustomer({
                          valueData: null,
                          valueInput: "",
                        });
                        setBranch({
                          valueData: null,
                          valueInput: "",
                        });
                        setGroup({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      list={customerList}
                      type="text"
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                      className={`h-9 mb-1`}
                    />
                    {customer.valueData && (
                      <>
                        <InputComponent
                          mandatoy
                          label="Group"
                          value={group}
                          className="h-[38px]    mb-4"
                          disabled
                        />
                        <InputComponent
                          label="Branch"
                          disabled
                          value={branch}
                          className="h-[38px]  mb-4"
                          type="text"
                        />
                      </>
                    )}
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-4">
                    <InputComponent
                      mandatoy
                      label="Phone"
                      value={phone}
                      className="h-[38px]   mb-4"
                      type="number"
                      onChange={(e) =>
                        setPhone({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                      onReset={() => {
                        setPhone({ valueData: "", valueInput: "" });
                      }}
                    />
                    <InputComponent
                      label="Date"
                      value={createdAt}
                      className="h-[38px] mb-4"
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

export default FormContactPage;

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
                      modalStyle="mt-2"
                      onSelected={(e) => {
                        setDoc({ valueData: e.value, valueInput: e.name });
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

export default FormWorkflowPage;

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton, InputComponent } from "../../components/atoms";
import { IValue, TypeField } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, LocalStorage, Meta } from "../../utils";

import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";

const FormNotePage: React.FC<any> = ({ props }) => {
  const id = props.id;
  const docData = props.doc;

  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${id ? data?.topic?.name : "New Notes"} - Sales App Ekatunggal`,
    description: "Halaman form Notes - Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [topic, setTopic] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [customer, setCustomer] = useState<IValue>({
    valueData: docData.customer._id,
    valueInput: docData.customer.name,
  });

  const [status, setStatus] = useState<String>("Draft");
  const [notes, setNotes] = useState<string>("");
  const [prevData, setPrevData] = useState<any>({
    tupic: topic.valueData,
    note: notes ?? "",
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
      const result = await GetDataServer(DataAPI.NOTE).FINDONE(`${id}`);

      setData(result.data);

      setTopic({
        valueData: result.data.topic.name,
        valueInput: result.data.topic.name,
      });
      setUser({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });
      setCreatedAt({
        valueData: moment(result.data.createdAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.createdAt).format("YYYY-MM-DD"),
      });
      setNotes(result.data.result);
      setData(result.data);

      // setPrevData({
      //   name: result.data.name,
      //   desc: result.data.desc ?? "",
      // });
      // if (result.data.desc) {
      //   setDesc(result.data.desc);
      // }
      // setStatus(
      //   result.data.status == "0"
      //     ? "Draft"
      //     : result.data.status == "1"
      //     ? "Submitted"
      //     : result.data.status == "2"
      //     ? "Canceled"
      //     : "Closed"
      // );
      setLoading(false);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      // navigate("/branch");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.NOTE).DELETE(`${id}`);
          // navigate("/branch");
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
        topic: topic.valueData,
        note: notes,
      };
      if (nextState) {
        data.nextState = nextState;
      }

      let Action = id
        ? GetDataServer(DataAPI.NOTE).UPDATE({ id: id, data: data })
        : GetDataServer(DataAPI.NOTE).CREATE(data);

      const result = await Action;
      // navigate(`/branch/${result.data.data._id}`);
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
          error.response.data.msg
            ? error.response.data.msg
            : error.message
            ? error.message
            : "Error Insert"
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
    }
  }, []);

  // Cek perubahan
  useEffect(() => {
    const actualData = {
      topic: topic.valueData,
      note: notes ?? "",
    };
    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [topic, notes]);
  // End

  return (
    <>
      {Meta(metaData)}
      <div
        className="  pb-3 max-h-[calc(100vh-70px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-300"
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
                <h4 className="font-bold text-lg mr-2 cursor-pointer">
                  {!id ? "New Notes" : data.topic.name}
                </h4>
                {/* <div className="text-md">
                  <ButtonStatusComponent
                    // className="text-[0.7em]"
                    status={data.status ?? "0"}
                    name={data.workflowState ?? "Not Save"}
                  />
                </div> */}
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
                <div className="w-full h-auto  float-left rounded-md p-3 pt-5">
                  <div className=" w-1/2 px-4 float-left ">
                    <InputComponent
                      label="Customer"
                      value={customer}
                      className="h-[38px]   text-[0.93em] mb-3"
                      disabled
                    />
                    <InputComponent
                      typeField={TypeField.TEXTAREA}
                      mandatoy
                      label="Topic"
                      value={topic}
                      className="h-[60px]  text-[0.93em] mb-3 "
                      type="text"
                      onChange={(e) =>
                        setTopic({
                          valueData: e,
                          valueInput: e,
                        })
                      }
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
                  </div>
                </div>
                <div className="px-7 mb-2">
                  <label className="text-sm">
                    Result <a className="text-red-600">*</a>
                  </label>
                  <textarea
                    className={`border mt-1 p-2 text-[0.95em] bg-gray-50  w-full rounded-md h-[150px] ${!notes && "border-red-500"}`}
                    name="Site Uri"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={
                      id != null ? (status !== "Draft" ? true : false) : false
                    }
                  />
                </div>
                <label className="text-sm ml-7">Tags</label>
                <ul className="border mx-7 px-2 mt-2 py-3 mb-5 rounded-sm float-left w-[93%]">
                  <li className=" mb-1 cursor-pointer duration-150 hover:bg-red-700 list-none px-2 py-1 text-sm rounded-md mr-1 bg-red-600 text-white float-left flex items-center">
                    Price
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <LoadingComponent />
        )}
      </div>
    </>
  );
};

export default FormNotePage;

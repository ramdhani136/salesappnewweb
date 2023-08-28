import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton, InputComponent } from "../../components/atoms";
import {
  IListInput,
  IValue,
  TypeField,
} from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, FetchApi, LocalStorage, Meta } from "../../utils";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { modalSet } from "../../redux/slices/ModalSlice";
import { RiseLoader } from "react-spinners";
import FormTagPage from "../Tags/FormTag";
import { result } from "lodash";

const FormNotePage: React.FC<any> = ({ props }) => {
  let id = props.id;
  const docData = props.doc;
  const type = props.type ?? "callsheet";

  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${id ? data?.topic?.name : "New Notes"} - Sales App Ekatunggal`,
    description: "Halaman form Notes - Sales web system",
  };

  // Tags
  const [tagList, setTagList] = useState<IListInput[]>([]);
  const [tagRestrict, setTagRestrict] = useState<IListInput[]>([]);
  const [tagMandatory, setTagMandatory] = useState<IListInput[]>([]);
  const [tagPage, setTagePage] = useState<Number>(1);
  const [tagLoading, setTagLoading] = useState<boolean>(true);
  const [tagMoreLoading, setTagMoreLoading] = useState<boolean>(false);
  const [tagHasMore, setTagHasmore] = useState<boolean>(false);
  const [tags, setTags] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  // Topic
  const [topicList, setTopicList] = useState<IListInput[]>([]);
  const [topicPage, setTopicPage] = useState<Number>(1);
  const [topicLoading, setTopicLoading] = useState<boolean>(true);
  const [topicMoreLoading, setTopicMoreLoading] = useState<boolean>(false);
  const [topicHasMore, setTopicHasMore] = useState<boolean>(false);
  const [topic, setTopic] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const fileRef: any = useRef();
  const [topicData, setTopicData] = useState<any>(null);
  // End
  const dispatch = useDispatch();
  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });

  const [customer, setCustomer] = useState<IValue>({
    valueData: docData.customer._id,
    valueInput: docData.customer.name,
  });

  const [notes, setNotes] = useState<string>("");
  const [task, setTask] = useState<string>("");
  const [prevData, setPrevData] = useState<any>({
    topic: topic.valueData,
    note: notes ?? "",
    task: task ?? "",
    tags: tags,
  });

  const [files, setFiles] = useState<any[]>([]);
  const [filesIsLoading, setFileIsLoading] = useState<boolean>(false);

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getTagsMandatoryRestrict = (data: any[any]) => {
    if (data.tags.restrict) {
      let genRestrict: IListInput[] = data.tags.restrict.map((item: any) => {
        return {
          name: item.name,
          value: item._id,
        };
      });
      setTagRestrict(genRestrict);
    } else {
      setTagRestrict([]);
    }
    if (data.tags.mandatory) {
      let genMandatory: IListInput[] = data.tags.mandatory.map((item: any) => {
        return item.name;
      });
      setTagMandatory(genMandatory);
    } else {
      setTagMandatory([]);
    }
  };

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.NOTE).FINDONE(`${id}`);

      setData(result.data);

      setTopic({
        valueData: result.data.topic._id,
        valueInput: result.data.topic.name,
      });
      setCustomer({
        valueData: result.data.customer._id,
        valueInput: result.data.customer.name,
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
      setTask(result.data.task);
      setData(result.data);

      setTags(result.data.tags);

      setPrevData({
        topic: result.data.topic._id,
        note: result.data.result,
        task: result.data.task,
        tags: result.data.tags,
      });

      if (result.data.topic) {
        try {
          const showTopic = await GetDataServer(DataAPI.TOPIC).FINDONE(
            result.data.topic._id
          );

          setTopicData(showTopic.data);
          getTagsMandatoryRestrict(showTopic.data);
        } catch (error) {
          throw error;
        }
      }

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      // navigate("/branch");
    }
  };

  const getTags = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }

      const result: any = await GetDataServer(DataAPI.TAGS).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : tagPage}`,
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
          setTagList([...tagList, ...listInput]);
        } else {
          setTagList([...listInput]);
        }
        setTagHasmore(result.hasMore);

        setTagePage(result.nextPage);
      }

      setTagLoading(false);
      setTagMoreLoading(false);
    } catch (error: any) {
      setTagLoading(false);
      setTagMoreLoading(false);
      setTagHasmore(false);
    }
  };

  const ResetTag = () => {
    setTagList([]);
    setTagHasmore(false);
    setTagePage(1);
    setTagLoading(true);
  };

  const GetTopic = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }

      const result: any = await GetDataServer(DataAPI.TOPIC).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : topicPage}`,
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
        if (!data.refresh) {
          setTopicList([...topicList, ...listInput]);
        } else {
          setTopicList([...listInput]);
        }
        setTopicHasMore(result.hasMore);
        setTopicPage(result.nextPage);
      }

      setTopicLoading(false);
      setTopicMoreLoading(false);
    } catch (error: any) {
      setTopicLoading(false);
      setTopicMoreLoading(false);
      setTopicHasMore(false);
    }
  };

  const ResetTopic = () => {
    setTopicList([]);
    setTopicHasMore(false);
    setTopicPage(1);
    setTopicLoading(true);
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.NOTE).DELETE(`${id}`);
          Swal.fire({ icon: "success", text: "Deleted" });
          props.onRefresh({ refresh: true });
          dispatch(
            modalSet({
              active: false,
              Children: null,
              title: "",
            })
          );
        } catch (error: any) {
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
    setLoading(false);
  };

  const onSave = async (): Promise<any> => {
    setLoading(true);

    if (!task) {
      setLoading(false);
      return Swal.fire("Error!", `Activity Wajib diisi!`, "error");
    }
    if (!result) {
      setLoading(false);
      return Swal.fire("Error!", `Feedback Wajib diisi!`, "error");
    }
    if (!topic.valueData) {
      setLoading(false);
      return Swal.fire("Error!", `Topic Wajib diisi!`, "error");
    }
    try {
      let data: any = {
        topic: topic.valueData,
        task: task,
        result: notes,
        tags: tags.map((item: any) => item._id),
        customer: customer.valueData,
        doc: {
          type: type,
          _id: docData._id,
          name: docData.name,
        },
      };

      let Action = id
        ? GetDataServer(DataAPI.NOTE).UPDATE({ id: id, data: data })
        : GetDataServer(DataAPI.NOTE).CREATE(data);

      const result = await Action;

      if (id) {
        getData();
        props.onRefresh({ refresh: true });
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        id = result.data.data._id;
        Swal.fire({ icon: "success", text: "Saved" });
        props.onRefresh({ refresh: true });
        dispatch(
          modalSet({
            active: true,
            Children: FormNotePage,
            title: "",
            props: { id: id, doc: docData, onRefresh: props.onRefresh },
            className: "w-[63%] h-[98%]",
          })
        );
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
      getFiles();
      if (docData.status != "1") {
        setListMoreAction([{ name: "Delete", onClick: onDelete }]);
      }
    } else {
      setLoading(false);
      setListMoreAction([]);
    }
  }, []);

  const getFiles = async () => {
    setFileIsLoading(true);
    try {
      const result: any = await GetDataServer(DataAPI.FILES).FIND({
        fields: ["name"],
        filters: [["note", "=", id]],
      });
      setFiles(result.data);
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
    setFileIsLoading(false);
  };

  const UploadFiles = async (e: any) => {
    setFileIsLoading(true);
    try {
      const maxSize = 2 * 1024 * 1024;

      let notValid: any[] = [];
      let valid: any[] = [];
      for (const file of e.target.files) {
        if (file.size <= maxSize) {
          valid = [...valid, file];
        } else {
          notValid = [...notValid, file.name];
        }
      }

      if (valid.length > 0) {
        valid.forEach(async (item) => {
          try {
            const inData = new FormData();
            inData.append("file", item);
            inData.append("note", id);
            await FetchApi.post(
              `${import.meta.env.VITE_PUBLIC_URI}/files`,
              inData
            );
            getFiles();
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
        });
      }

      if (notValid.length > 0) {
        Swal.fire(
          "Error!",
          `Ukuran file ${notValid} terlalu besar. Maksimal 2 MB diizinkan`,
          "error"
        );
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
    fileRef.current.value = "";
    setFileIsLoading(false);
  };

  const DeleteFile = async (id: string) => {
    setFileIsLoading(true);
    try {
      await GetDataServer(DataAPI.FILES).DELETE(id);
      getFiles();
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
    setFileIsLoading(false);
  };

  // Cek perubahan
  useEffect(() => {
    const actualData = {
      topic: topic.valueData,
      note: notes ?? "",
      task: task ?? "",
      tags: tags,
    };

    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [topic, notes, tags, task]);
  // End

  return (
    <>
      {Meta(metaData)}
      <div
        className="   max-h-[calc(100vh-70px)]  overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-300"
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

                {id && !isChangeData && docData.status == "0" && (
                  <IconButton
                    classModal="top-[29px]"
                    Icon={AddIcon}
                    name="Create New"
                    iconSize={10}
                    classIcon="mt-1"
                    callback={() => {
                      dispatch(
                        modalSet({
                          active: true,
                          Children: FormNotePage,
                          title: "",
                          props: {
                            doc: docData,
                            onRefresh: props.onRefresh,
                          },
                          className: "w-[63%] h-[98%]",
                        })
                      );
                    }}
                    className={`opacity-80 hover:opacity-100 duration-100  `}
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
            <div className=" px-5 flex flex-col mt-3  ">
              <div
                className={`border w-full flex-1  pb-4 bg-white rounded-md  ${
                  !topicData && "pb-28"
                }`}
              >
                <div className="w-full h-auto  float-left rounded-md p-3 pt-5">
                  <div className=" w-1/2 px-4 float-left ">
                    <InputComponent
                      label="Customer"
                      value={customer}
                      className="h-[38px]   mb-3"
                      disabled
                    />

                    <InputComponent
                      mandatoy
                      typeField={TypeField.TEXTAREA}
                      label="Topic"
                      infiniteScroll={{
                        loading: topicMoreLoading,
                        hasMore: topicHasMore,
                        next: () => {
                          setTopicMoreLoading(true);
                          GetTopic({
                            refresh: false,
                            search: topic.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetTopic();
                          GetTopic({
                            refresh: true,
                            search: e,
                          });
                        },
                      }}
                      onCLick={() => {
                        ResetTopic();
                        GetTopic({
                          refresh: true,
                          search: topic.valueInput,
                        });
                      }}
                      loading={topicLoading}
                      modalStyle="mt-2"
                      value={topic}
                      onChange={(e) => {
                        setTopic({
                          ...topic,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e) => {
                        setTopic({ valueData: e.value, valueInput: e.name });
                        setTopicData(e.data);
                        getTagsMandatoryRestrict(e.data);
                        setTags([]);
                      }}
                      onReset={() => {
                        setTopic({
                          valueData: "",
                          valueInput: "",
                        });
                        setTagMandatory([]);
                        setTagRestrict([]);
                        setTopicData(null);
                        setTags([]);
                      }}
                      list={topicList}
                      type="text"
                      className={`h-24 mb-1`}
                      disabled={
                        id != null
                          ? docData.status !== "0"
                            ? true
                            : false
                          : false
                      }
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
                    <InputComponent
                      label="Created By"
                      value={user}
                      className="h-[38px]   mb-3"
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
                    Activity
                    {!id ||
                      (docData.status == "0" && (
                        <a className="text-red-600">*</a>
                      ))}
                  </label>
                  <textarea
                    className={`border mt-1 p-2  bg-gray-50  w-full rounded-md h-[120px] ${
                      !task && "border-red-500"
                    } mb-2`}
                    name="task"
                    value={task}
                    placeholder="*Hal yang disampaikan kepada konsumen, contoh : Menawarkan item a dengan harga sekian"
                    onChange={(e) => setTask(e.target.value)}
                    disabled={
                      id != null
                        ? docData.status !== "0"
                          ? true
                          : false
                        : false
                    }
                  />
                  {task && (
                    <>
                      <label className="text-sm">
                        Feedback
                        {!id ||
                          (docData.status == "0" && (
                            <a className="text-red-600">*</a>
                          ))}
                      </label>
                      <textarea
                        placeholder="*Tanggapan konsumen dari hal yang disampaikan diatas, contoh : Konsumen menerima harga yang ditawarkan dan akan segera membuat po "
                        className={`border mt-1 p-2  bg-gray-50  w-full rounded-md h-[120px] ${
                          !notes && "border-red-500"
                        }`}
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={
                          id != null
                            ? docData.status !== "0"
                              ? true
                              : false
                            : false
                        }
                      />
                    </>
                  )}
                </div>

                {topicData && (
                  <>
                    <div className="mx-7 w-[300px]">
                      {(!id || docData.status == "0") && (
                        <InputComponent
                          // modal={{
                          //   Children: FormTagPage,
                          //   className: "w-[63%] h-[98%]",
                          //   props: {
                          //     modal: true,
                          //     name: tagInput.valueInput,
                          //     setTagInput: setTagInput,
                          //   },
                          //   title: "Form Customer",
                          // }}
                          label="Tags"
                          remark={`${
                            tagMandatory.length > 0
                              ? `*Tag ${tagMandatory} wajib di lampirkan didalam topic ${topicData.name}`
                              : ""
                          }`}
                          remarkStyle="mt-1 text-sm italic "
                          infiniteScroll={{
                            active: tagRestrict.length ? false : true,
                            loading: tagMoreLoading,
                            hasMore: tagHasMore,
                            next: () => {
                              setTagMoreLoading(true);
                              getTags({
                                refresh: false,
                                search: tagInput.valueInput,
                              });
                            },
                            onSearch(e) {
                              ResetTag();
                              getTags({ refresh: true, search: e });
                            },
                          }}
                          loading={tagRestrict.length > 0 ? false : tagLoading}
                          modalStyle="mt-2"
                          value={tagInput}
                          onChange={(e) => {
                            setTagInput({
                              ...tagInput,
                              valueInput: e,
                            });
                          }}
                          onSelected={(e) => {
                            const cekDup = tags.find(
                              (item: any) => item._id === e.value
                            );

                            if (!cekDup) {
                              let setTag = [
                                ...tags,
                                { _id: e.value, name: e.name },
                              ];
                              setTags(setTag);
                            }

                            setTagInput({
                              valueData: "",
                              valueInput: "",
                            });
                          }}
                          onReset={() => {
                            setTagInput({
                              valueData: "",
                              valueInput: "",
                            });
                          }}
                          list={tagRestrict.length > 0 ? tagRestrict : tagList}
                          type="text"
                          disabled={
                            id != null
                              ? docData.status !== "0"
                                ? true
                                : false
                              : false
                          }
                          className={`h-9 mb-1`}
                        />
                      )}
                    </div>
                    {tags.length > 0 && (
                      <ul className="border mx-7 px-2  py-3 mb-5 rounded-sm float-left w-[93%]">
                        {tags.map((item: any, index: any) => (
                          <li
                            onClick={() => {
                              if (!id || docData.status == "0") {
                                const genTags = tags.filter((i: any) => {
                                  return i._id !== item._id;
                                });

                                setTags(genTags);
                              }
                            }}
                            key={index}
                            className=" mb-1 cursor-pointer duration-150 hover:bg-red-700 list-none px-2 py-1 text-sm rounded-md mr-1 bg-red-600 text-white float-left flex items-center"
                          >
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
            {topicData && id != undefined && id != null && id !== "" && (
              <div className="px-7  mt-3 py-2 border mx-5 rounded-md">
                <div className="flex items-center justify-between mt-2 ">
                  <h4 className="text-sm inline">
                    Files{" "}
                    {!id ||
                      (docData.status == "0" && (
                        <a className="inline text-gray-500 italic text-[0.95em]">
                          (Max Size: 2 MB)
                        </a>
                      ))}
                  </h4>

                  {!id ||
                    (docData.status == "0" && (
                      <label htmlFor="imageUpload">
                        <a className="flex items-center border text-sm px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 duration-100  hover:cursor-pointer">
                          <h4 className="text-gray-800"> Attach</h4>
                          <AttachFileIcon
                            className="text-gray-800"
                            style={{ fontSize: 16 }}
                          />
                        </a>
                      </label>
                    ))}
                  <input
                    type="file"
                    name="imageUpload"
                    id="imageUpload"
                    className="hidden"
                    multiple
                    accept=".jpg, .jpeg, .png, .gif, .pdf, .doc, .docx"
                    onChange={(e) => UploadFiles(e)}
                    ref={fileRef}
                  />
                </div>

                {filesIsLoading ? (
                  <div className="w-full flex items-start justify-center h-[100px]">
                    <RiseLoader
                      color="#36d7b6"
                      loading={true}
                      // cssOverride={override}
                      size={7}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                      className="mt-10 -ml-4"
                    />
                  </div>
                ) : (
                  <ul className=" w-full  my-3">
                    {files.length === 0 ? (
                      <h4 className="flex items-center justify-center h-[50px] text-sm text-gray-300">
                        No Files
                      </h4>
                    ) : (
                      files.map((item, index) => (
                        <li
                          key={index}
                          className="mb-2 bg-gray-100 px-2 font-semibold w-[350px] py-2 flex justify-between items-center"
                        >
                          <div className="flex  items-center cursor-pointer  text-[0.85em] text-blue-500 hover:text-blue-600 duration-100">
                            <a
                              href={`${
                                import.meta.env.VITE_PUBLIC_URI
                              }/public/files/${item.name}`}
                              target="_blank"
                            >
                              {item.name}
                            </a>
                            {/* <h4 className="ml-1 font-bold text-[0.9em] text-gray-600">
                              (1K)
                            </h4> */}
                          </div>
                          {!id ||
                            (docData.status == "0" && (
                              <CloseIcon
                                style={{ fontSize: 16, fontWeight: "bold" }}
                                className="text-gray-700 cursor-pointer hover:text-gray-800 duration-100"
                                onClick={() => {
                                  AlertModal.confirmation({
                                    text: "Delete this file?",
                                    onConfirm: () => {
                                      DeleteFile(item._id);
                                    },
                                  });
                                }}
                              />
                            ))}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}
          </>
        ) : (
          <LoadingComponent />
        )}
      </div>
    </>
  );
};

export default FormNotePage;

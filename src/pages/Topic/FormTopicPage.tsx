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
import CancelSharpIcon from "@mui/icons-material/CancelSharp";

const FormTopicPage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${id ? data.name??"Loading .." : "New Topic"} - Sales App Ekatunggal`,
    description: "Halaman form Topic - Sales web system",
  };

  const navigate = useNavigate();

  const [scroll, setScroll] = useState<number>(0);
  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isChangeData, setChangeData] = useState<boolean>(false);
  const dataType: any[] = [
    { title: "Enabled", value: "1" },
    { title: "Disabled", value: "0" },
  ];
  const [allowTaggingItem, setAllowTaggingItem] = useState<String>("1");

  // Tags Restrict
  const [tagList, setTagList] = useState<IListInput[]>([]);
  const [tagPage, setTagePage] = useState<Number>(1);
  const [tagLoading, setTagLoading] = useState<boolean>(true);
  const [tagMoreLoading, setTagMoreLoading] = useState<boolean>(false);
  const [tagHasMore, setTagHasmore] = useState<boolean>(false);
  const [tagRestrict, setTageRestrict] = useState<any[]>([]);
  const [tagValueRestrict, setTagValueRestrict] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  // Tags mandatory
  const [mandatoryTagList, setMandatoryTagList] = useState<IListInput[]>([]);
  const [mandatoryTagPage, setMandatoryTagePage] = useState<Number>(1);
  const [mandatoryTagLoading, setMandatoryTagLoading] = useState<boolean>(true);
  const [mandatoryTagMoreLoading, setMandatoryTagMoreLoading] =
    useState<boolean>(false);
  const [mandatoryTagHasMore, setMandatoryTagHasmore] =
    useState<boolean>(false);
  const [tagMandatory, setTagMandatory] = useState<any[]>([]);
  const [tagValueMandatory, setTagValueMandatory] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  // End

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [status, setStatus] = useState<String>("Draft");
  const [prevData, setPrevData] = useState<any>({
    name: name.valueData,
    allowTaggingItem: allowTaggingItem,
    tagRestrict: tagRestrict,
    tagMandatory: tagMandatory,
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
      const result = await GetDataServer(DataAPI.TOPIC).FINDONE(`${id}`);

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

      setData(result.data);

      if (result.data.tags.restrict) {
        setTageRestrict(result.data.tags.restrict);
      }
      if (result.data.tags.mandatory) {
        setTagMandatory(result.data.tags.mandatory);
      }

      setAllowTaggingItem(`${result.data.tags.allowTaggingItem}`);

      setPrevData({
        name: result.data.name,
        allowTaggingItem: `${result.data.tags.allowTaggingItem}`,
        tagRestrict: result.data.tags.restrict,
        tagMandatory: result.data.tags.mandatory,
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

      navigate("/topic");
    }
  };

  const onDelete = (): void => {
    if (id) {
      const progress = async (): Promise<void> => {
        setLoading(true);
        try {
          await GetDataServer(DataAPI.TOPIC).DELETE(`${id}`);
          navigate("/topic");
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

  const getMandatoryTags = async (data: {
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
        page: `${data.refresh ? 1 : mandatoryTagPage}`,
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
          setMandatoryTagList([...mandatoryTagList, ...listInput]);
        } else {
          setMandatoryTagList([...listInput]);
        }
        setMandatoryTagHasmore(result.hasMore);

        setMandatoryTagePage(result.nextPage);
      }

      setMandatoryTagLoading(false);
      setMandatoryTagMoreLoading(false);
    } catch (error: any) {
      setMandatoryTagLoading(false);
      setMandatoryTagMoreLoading(false);
      setMandatoryTagHasmore(false);
    }
  };

  const ResetMandatoryTag = () => {
    setMandatoryTagList([]);
    setMandatoryTagHasmore(false);
    setMandatoryTagePage(1);
    setMandatoryTagLoading(true);
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

  const onSave = async (nextState?: String): Promise<any> => {
    setLoading(true);
    try {
      if (!name.valueData) {
        throw new Error("Nama wajib diisi!");
      }
      let updata = {};
      if (nextState) {
        updata = { nextState: nextState };
      } else {
        updata = {
          name: name.valueData,
          tags: {
            mandatory: tagMandatory.map((item: any) => item._id),
            restrict: tagRestrict.map((item: any) => item._id),
            allowTaggingItem: allowTaggingItem,
          },
        };
      }

      let Action = id
        ? GetDataServer(DataAPI.TOPIC).UPDATE({ id: id, data: updata })
        : GetDataServer(DataAPI.TOPIC).CREATE(updata);

      const result = await Action;
      if (id) {
        getData();
        Swal.fire({ icon: "success", text: "Saved" });
      } else {
        navigate(`/topic/${result.data.data._id}`);
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
    ResetTag();
    ResetMandatoryTag();

    setLoading(false);
  };
  // Cek perubahan
  useEffect(() => {
    const actualData = {
      name: name.valueData,
      allowTaggingItem: allowTaggingItem,
      tagRestrict: tagRestrict,
      tagMandatory: tagMandatory,
    };

    if (JSON.stringify(actualData) !== JSON.stringify(prevData)) {
      setChangeData(true);
    } else {
      setChangeData(false);
    }
  }, [name, tagMandatory, tagRestrict, allowTaggingItem]);
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
                  onClick={() => navigate("/topic")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Topic" : data.name}
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

                    {id && (
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
                    )}
                    <Select
                      title="Allow Item Tagging"
                      data={dataType}
                      value={allowTaggingItem}
                      setValue={setAllowTaggingItem}
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                    />

                    <InputComponent
                      label="Tags Restrict"
                      infiniteScroll={{
                        loading: tagMoreLoading,
                        hasMore: tagHasMore,
                        next: () => {
                          setTagMoreLoading(true);
                          getTags({
                            refresh: false,
                            search: tagValueRestrict.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetTag();
                          getTags({
                            refresh: true,
                            search: e,
                          });
                        },
                      }}
                      onCLick={() => {
                        ResetTag();
                        getTags({
                          refresh: true,
                          search: tagValueRestrict.valueInput,
                        });
                      }}
                      loading={tagLoading}
                      modalStyle="mt-2"
                      value={tagValueRestrict}
                      onChange={(e) => {
                        setTagValueRestrict({
                          ...tagValueRestrict,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e) => {
                        const cekDup = tagRestrict.find(
                          (item: any) => item._id === e.value
                        );

                        if (!cekDup) {
                          let setTag = [
                            ...tagRestrict,
                            { _id: e.value, name: e.name },
                          ];
                          if (tagRestrict.length === 0) {
                            const cekDupMandatory = tagMandatory.filter(
                              (item: any) => item._id !== e.value
                            );

                            setTageRestrict([...setTag, ...cekDupMandatory]);
                          } else {
                            setTageRestrict(setTag);
                          }
                        }

                        setTagValueRestrict({
                          valueData: "",
                          valueInput: "",
                        });
                      }}
                      onReset={() => {
                        setTagValueRestrict({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      list={tagList}
                      type="text"
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                      className={`h-9 mb-1`}
                    />
                    {tagRestrict.length > 0 && (
                      <ul className="w-full h-auto rounded-sm border p-2 float-left">
                        {tagRestrict.map((item: any, index: number) => {
                          return (
                            <li
                              onClick={() => {
                                if (!id || data.status == "0") {
                                  const setTags = tagRestrict.filter(
                                    (i: any) => {
                                      return i._id !== item._id;
                                    }
                                  );

                                  setTageRestrict(setTags);

                                  const checkTagMandatory = tagMandatory.filter(
                                    (i: any) => {
                                      return i._id !== item._id;
                                    }
                                  );

                                  setTagMandatory(checkTagMandatory);
                                }
                              }}
                              key={index}
                              className=" mb-1 cursor-pointer duration-150  bg-red-600 border-red-700  hover:bg-red-700 hover:border-red-800 list-none px-2 py-1 rounded-md mr-1  text-white float-left flex items-center"
                            >
                              {item.name}
                            </li>
                          );
                        })}
                        {!id ||
                          (data.status == "0" && (
                            <CancelSharpIcon
                              style={{ fontSize: "18px" }}
                              onClick={() => {
                                setTageRestrict([]);
                              }}
                            />
                          ))}
                      </ul>
                    )}
                  </div>
                  <div className=" w-1/2 px-4 float-left  mb-4">
                    <InputComponent
                      label="Date"
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
                      className="h-[38px]   mb-4"
                      onChange={(e) =>
                        setUser({
                          valueData: e,
                          valueInput: e,
                        })
                      }
                      disabled
                    />
                    <InputComponent
                      label="Tags Mandatory"
                      infiniteScroll={{
                        loading: mandatoryTagMoreLoading,
                        hasMore: mandatoryTagHasMore,
                        next: () => {
                          setMandatoryTagMoreLoading(true);
                          getMandatoryTags({
                            refresh: false,
                            search: tagValueMandatory.valueInput,
                          });
                        },
                        onSearch(e) {
                          ResetMandatoryTag();
                          getMandatoryTags({
                            refresh: true,
                            search: e,
                          });
                        },
                      }}
                      onCLick={() => {
                        ResetMandatoryTag();
                        getMandatoryTags({
                          refresh: true,
                          search: tagValueMandatory.valueInput,
                        });
                      }}
                      loading={mandatoryTagLoading}
                      modalStyle="mt-2"
                      value={tagValueMandatory}
                      onChange={(e) => {
                        setTagValueMandatory({
                          ...tagValueMandatory,
                          valueInput: e,
                        });
                      }}
                      onSelected={(e) => {
                        const cekDup = tagMandatory.find(
                          (item: any) => item._id === e.value
                        );

                        if (!cekDup) {
                          let setTag = [
                            ...tagMandatory,
                            { _id: e.value, name: e.name },
                          ];

                          const missingDataInData2 = setTag.filter(
                            (item1) =>
                              !tagRestrict.some(
                                (item2) => item2._id === item1._id
                              )
                          );

                          setTagMandatory(setTag);
                          if (
                            missingDataInData2.length > 0 &&
                            tagRestrict.length > 0
                          ) {
                            setTageRestrict([
                              ...tagRestrict,
                              ...missingDataInData2,
                            ]);
                          }
                        }

                        setTagValueMandatory({
                          valueData: "",
                          valueInput: "",
                        });
                      }}
                      onReset={() => {
                        setTagValueMandatory({
                          valueData: null,
                          valueInput: "",
                        });
                      }}
                      list={mandatoryTagList}
                      type="text"
                      disabled={
                        id != null ? (status !== "Draft" ? true : false) : false
                      }
                      className={`h-9 mb-1`}
                    />
                    {tagMandatory.length > 0 && (
                      <ul className="w-full h-auto rounded-sm border p-2 float-left">
                        {tagMandatory.map((item: any, index: number) => {
                          return (
                            <li
                              onClick={() => {
                                if (!id || data.status == "0") {
                                  const setTags = tagMandatory.filter(
                                    (i: any) => {
                                      return i._id !== item._id;
                                    }
                                  );

                                  setTagMandatory(setTags);
                                }
                              }}
                              key={index}
                              className=" mb-1 cursor-pointer duration-150  list-none px-2 py-1 rounded-md mr-1  bg-red-600 border-red-700  hover:bg-red-700 hover:border-red-800 text-white float-left flex items-center"
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

export default FormTopicPage;

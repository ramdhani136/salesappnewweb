import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";

import {
  IconButton,
  InputComponent,
  ToggleBodyComponent,
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";

import { AlertModal, Meta } from "../../utils";

import Swal from "sweetalert2";

const SettingPage: React.FC = () => {
  const navigate = useNavigate();

  const [id, setId] = useState<string>("");

  const metaData = {
    title: `Settings - Sales App Ekatunggal`,
    description: "Halaman form User sales web system",
  };

  const [scroll, setScroll] = useState<number>(0);

  // Tagvisit
  const [vTags, setVTags] = useState<IListInput[]>([]);
  const [vTagPage, setVTagPage] = useState<Number>(1);
  const [vTagLoading, setVTagLoading] = useState<boolean>(true);
  const [vTagMoreLoading, setVTagMoreLoading] = useState<boolean>(false);
  const [vTagHasmore, setVTagHasmore] = useState<boolean>(false);
  const [visitTagValue, setVisitTagValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [visitTags, setVisitTags] = useState<any[]>([]);
  // End

  // Topicvisit
  const [visitTopicList, setVisitTopicList] = useState<IListInput[]>([]);
  const [visitTopicPage, setVisitTopicPage] = useState<Number>(1);
  const [visitTopicLoading, setVisitTopicLoading] = useState<boolean>(true);
  const [visitTopicMoreLoading, setVisitTopicMoreLoading] =
    useState<boolean>(false);
  const [visitTopicHasMore, setVisitTopicHasMore] = useState<boolean>(false);
  const [visitTopicValue, setVisitTopicValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [visitTopic, setVisitTopic] = useState<any[]>([]);
  // End

  // Topicvisit
  const [callsheetTopicList, setCallsheetTopicList] = useState<IListInput[]>(
    []
  );
  const [callsheetTopicPage, setCallsheetTopicPage] = useState<Number>(1);
  const [callsheetTopicLoading, setCallsheetTopicLoading] =
    useState<boolean>(true);
  const [callsheetTopicMoreLoading, setCallsheetTopicMoreLoading] =
    useState<boolean>(false);
  const [callsheetTopicHasMore, setCallsheetTopicHasMore] =
    useState<boolean>(false);
  const [callsheetTopicValue, setCallsheetTopicValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [callsheetTopic, setCallsheetTopic] = useState<any[]>([]);
  // End

  // TagCallsheet
  const [cTags, setCTags] = useState<IListInput[]>([]);
  const [cTagPage, setCTagPage] = useState<Number>(1);
  const [cTagLoading, setCTagLoading] = useState<boolean>(true);
  const [cTagMoreLoading, setCTagMoreLoading] = useState<boolean>(false);
  const [cTagHasmore, setCTagHasmore] = useState<boolean>(false);
  const [callsheetTagValue, setCallsheetTagValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [callsheetTags, setCallsheetTags] = useState<any[]>([]);
  // End

  const [prevData, setPrevData] = useState<any>({});
  const [visitCheckIn, setVisitCheckIn] = useState<IValue>({
    valueData: 0,
    valueInput: "0",
  });
  const [visitCheckOut, setVisitCheckOut] = useState<IValue>({
    valueData: 0,
    valueInput: "0",
  });
  const [locationDistance, setLocationDistance] = useState<IValue>({
    valueData: 0,
    valueInput: "0",
  });
  const [visitNoteLength, setVisitNoteLength] = useState<IValue>({
    valueData: 0,
    valueInput: "0",
  });
  const [callsheetNoteLength, ssetCallsheetNoteLength] = useState<IValue>({
    valueData: 0,
    valueInput: "0",
  });

  const [isUpdate, setIsUpdate] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  const getData = async (): Promise<void> => {
    setLoading(true);
    try {
      const result: any = await GetDataServer(DataAPI.CONFIG).FIND({
        limit: 1,
      });
      setId(result.data._id);
      const visit: any = result.data.visit;
      const callsheet: any = result.data.callsheet;
      const customer: any = result.data.customer;
      setVisitCheckIn({
        valueData: visit.checkInDistance ?? 0,
        valueInput: visit.checkInDistance ?? 0,
      });
      setVisitCheckOut({
        valueData: visit.checkInDistance ?? 0,
        valueInput: visit.checkOutDistance ?? 0,
      });
      setLocationDistance({
        valueData: customer.locationDistance ?? 0,
        valueInput: customer.locationDistance ?? 0,
      });
      setVisitNoteLength({
        valueData: visit.notesLength ?? 0,
        valueInput: visit.notesLength ?? 0,
      });
      ssetCallsheetNoteLength({
        valueData: callsheet.notesLength ?? 0,
        valueInput: callsheet.notesLength ?? 0,
      });

      if (visit.tagsMandatory.length > 0) {
        setVisitTags(visit.tagsMandatory);
      }
      if (callsheet.tagsMandatory.length > 0) {
        setCallsheetTags(callsheet.tagsMandatory);
      }

      if (visit.topicMandatory.length > 0) {
        setVisitTopic(visit.topicMandatory);
      }
      if (callsheet.topicMandatory.length > 0) {
        setCallsheetTopic(callsheet.topicMandatory);
      }

      setPrevData({
        visit: {
          checkInDistance: visit.checkInDistance,
          checkOutDistance: visit.checkOutDistance ?? 0,
          notesLength: visit.notesLength ?? 0,
          tagsMandatory: visit.tagsMandatory,
          topicMandatory: visit.topicMandatory,
        },
        callsheet: {
          notesLength: callsheet.notesLength,
          tagsMandatory: callsheet.tagsMandatory,
          topicMandatory: callsheet.topicMandatory,
        },
        customer: {
          locationDistance: customer.locationDistance ?? 0,
        },
      });
    } catch (error: any) {
      Swal.fire(
        "Error!",
        `${error.response.data.msg ?? "Error Access"}`,
        "error"
      );
      navigate(-1);
    }
    ResetCTags();
    ResetVTags();
    ResetVisitTopic();
    ResetCallsheetTopic();
    setLoading(false);
  };

  const getVTags = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      if (!vTagLoading) {
        setVTagMoreLoading(true);
      } else {
        setVTagMoreLoading(false);
      }

      const result: any = await GetDataServer(DataAPI.TAGS).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : vTagPage}`,
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
          setVTags([...vTags, ...listInput]);
        } else {
          setVTags([...listInput]);
        }
        setVTagHasmore(result.hasMore);
        setVTagPage(result.nextPage);
      }

      setVTagLoading(false);
      setVTagMoreLoading(false);
    } catch (error: any) {
      setVTagLoading(false);
      setVTagMoreLoading(false);
      setVTagHasmore(false);
    }
  };

  const ResetVTags = () => {
    setVTags([]);
    setVTagHasmore(false);
    setVTagPage(1);
    setVTagLoading(true);
  };

  const getCTags = async (data: {
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
        page: `${data.refresh ? 1 : cTagPage}`,
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
          setCTags([...cTags, ...listInput]);
        } else {
          setCTags([...listInput]);
        }
        setCTagHasmore(result.hasMore);
        setCTagPage(result.nextPage);
      }

      setCTagLoading(false);
      setCTagMoreLoading(false);
    } catch (error: any) {
      setCTagLoading(false);
      setCTagMoreLoading(false);
      setCTagHasmore(false);
    }
  };

  const ResetCTags = () => {
    setCTags([]);
    setCTagHasmore(false);
    setCTagPage(1);
    setCTagLoading(true);
  };

  useEffect(() => {
    const updateData = {
      visit: {
        checkInDistance: visitCheckIn.valueData,
        checkOutDistance: visitCheckOut.valueData,
        notesLength: visitNoteLength.valueData,
        tagsMandatory: visitTags,
        topicMandatory: visitTopic,
      },
      callsheet: {
        notesLength: callsheetNoteLength.valueData,
        tagsMandatory: callsheetTags,
        topicMandatory: callsheetTopic,
      },
      customer: {
        locationDistance: locationDistance.valueData,
      },
    };

    if (`${JSON.stringify(updateData)}` === `${JSON.stringify(prevData)}`) {
      setIsUpdate(false);
    } else {
      setIsUpdate(true);
    }
  }, [
    visitCheckIn,
    visitCheckOut,
    visitTags,
    visitNoteLength,
    callsheetNoteLength,
    callsheetTags,
    locationDistance,
    visitTopic,
    callsheetTopic,
  ]);

  const getVisitTopic = async (data: {
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
        page: `${data.refresh ? 1 : visitTopicPage}`,
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
          setVisitTopicList([...visitTopicList, ...listInput]);
        } else {
          setVisitTopicList([...listInput]);
        }
        setVisitTopicHasMore(result.hasMore);
        setVisitTopicPage(result.nextPage);
      }

      setVisitTopicLoading(false);
      setVisitTopicMoreLoading(false);
    } catch (error: any) {
      setVisitTopicLoading(false);
      setVisitTopicMoreLoading(false);
      setVisitTopicHasMore(false);
    }
  };

  const ResetVisitTopic = () => {
    setVisitTopicList([]);
    setVisitTopicHasMore(false);
    setVisitTopicPage(1);
    setVisitTopicLoading(true);
  };

  const getCallsheetTopic = async (data: {
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
        page: `${data.refresh ? 1 : callsheetTopicPage}`,
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
          setCallsheetTopicList([...callsheetTopicList, ...listInput]);
        } else {
          setCallsheetTopicList([...listInput]);
        }
        setCallsheetTopicHasMore(result.hasMore);
        setCallsheetTopicPage(result.nextPage);
      }

      setCallsheetTopicLoading(false);
      setCallsheetTopicMoreLoading(false);
    } catch (error: any) {
      setCallsheetTopicLoading(false);
      setCallsheetTopicMoreLoading(false);
      setCallsheetTopicHasMore(false);
    }
  };

  const ResetCallsheetTopic = () => {
    setCallsheetTopicList([]);
    setCallsheetTopicHasMore(false);
    setCallsheetTopicPage(1);
    setCallsheetTopicLoading(true);
  };

  const OnUpdate = async () => {
    setLoading(true);
    try {
      const data = {
        visit: {
          checkInDistance: visitCheckIn.valueData,
          checkOutDistance: visitCheckOut.valueData,
          notesLength: visitNoteLength.valueData,
          tagsMandatory: visitTags,
          topicMandatory: visitTopic.map((item: any) => item._id),
        },
        callsheet: {
          notesLength: callsheetNoteLength.valueData,
          tagsMandatory: callsheetTags,
          topicMandatory: callsheetTopic.map((item: any) => item._id),
        },
        customer: {
          locationDistance: locationDistance.valueData,
        },
      };
      await GetDataServer(DataAPI.CONFIG).UPDATE({
        id: id,
        data: data,
      });
      getData();
      Swal.fire({ icon: "success", title: "Data has been saved" });
    } catch (error: any) {
      Swal.fire(
        "Error!",
        `${error.response.data.msg ?? "Error Delete"}`,
        "error"
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
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
                  onClick={() => navigate("/users")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  Settings
                </h4>
              </div>
              <div className="flex">
                {isUpdate && (
                  <IconButton
                    name="Update"
                    callback={() => {
                      AlertModal.confirmation({
                        onConfirm: OnUpdate,
                        text: "Want to change this data?",
                        confirmButtonText: "Yes, Update it!",
                      });
                    }}
                    className={`opacity-80 hover:opacity-100 duration-100  `}
                  />
                )}
              </div>
            </div>
            <div className=" px-5 flex flex-col ">
              <ToggleBodyComponent
                name="Visit"
                child={
                  <div className="flex">
                    <div className="flex-1 flex">
                      <div className="flex-1 mr-6">
                        <InputComponent
                          label="Check In Distance (Meters)"
                          placeholder="0"
                          value={visitCheckIn}
                          onChange={(e) =>
                            setVisitCheckIn({ valueData: e, valueInput: e })
                          }
                          type="number"
                          min={0}
                          //   disabled={disabled}
                          className={`h-9 mb-3`}
                        />

                        <InputComponent
                          label="Tags (Mandatory)"
                          infiniteScroll={{
                            loading: vTagMoreLoading,
                            hasMore: vTagHasmore,
                            next: () => {
                              setVTagMoreLoading(true);
                              getVTags({
                                refresh: false,
                                search: visitTagValue.valueInput,
                              });
                            },
                            onSearch(e) {
                              ResetVTags();
                              getVTags({ refresh: true, search: e });
                            },
                          }}
                          onCLick={() => {
                            ResetVTags();
                            getVTags({
                              refresh: true,
                              search: visitTagValue.valueInput,
                            });
                          }}
                          loading={vTagLoading}
                          modalStyle="mt-2"
                          value={visitTagValue}
                          onChange={(e) => {
                            setVisitTagValue({
                              ...visitTagValue,
                              valueInput: e,
                            });
                          }}
                          onSelected={(e) => {
                            const cekDup = visitTags.find(
                              (item: any) => item._id === e.value
                            );

                            if (!cekDup) {
                              let setTag = [
                                ...visitTags,
                                { _id: e.value, name: e.name },
                              ];
                              setVisitTags(setTag);
                            }

                            setVisitTagValue({ valueData: "", valueInput: "" });
                          }}
                          onReset={() => {
                            setVisitTagValue({
                              valueData: null,
                              valueInput: "",
                            });
                          }}
                          list={vTags}
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-1`}
                        />
                        {visitTags.length > 0 && (
                          <ul className="w-full h-auto rounded-sm borde mb-2r p-2 float-left">
                            {visitTags.map((item: any, index: number) => {
                              return (
                                <li
                                  onClick={() => {
                                    const setTags = visitTags.filter(
                                      (i: any) => {
                                        return i._id !== item._id;
                                      }
                                    );

                                    setVisitTags(setTags);
                                  }}
                                  key={index}
                                  className=" mb-1 cursor-pointer duration-150 hover:bg-red-700 list-none px-2 py-1 text-[0.75em] rounded-md mr-1 bg-red-600 text-white float-left flex items-center"
                                >
                                  {item.name}
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        {/* Topic */}
                        <InputComponent
                          label="Topic (Mandatory)"
                          infiniteScroll={{
                            loading: visitTopicMoreLoading,
                            hasMore: visitTopicHasMore,
                            next: () => {
                              setVisitTopicMoreLoading(true);
                              getVisitTopic({
                                refresh: false,
                                search: visitTopicValue.valueInput,
                              });
                            },
                            onSearch(e) {
                              ResetVisitTopic();
                              getVisitTopic({ refresh: true, search: e });
                            },
                          }}
                          onCLick={() => {
                            ResetVisitTopic();
                            getVisitTopic({
                              refresh: true,
                              search: visitTopicValue.valueInput,
                            });
                          }}
                          loading={visitTopicLoading}
                          modalStyle="mt-2"
                          value={visitTopicValue}
                          onChange={(e) => {
                            setVisitTopicValue({
                              ...visitTopicValue,
                              valueInput: e,
                            });
                          }}
                          onSelected={(e) => {
                            const cekDup = visitTopic.find(
                              (item: any) => item._id === e.value
                            );

                            if (!cekDup) {
                              let setTopic = [
                                ...visitTopic,
                                { _id: e.value, name: e.name },
                              ];
                              setVisitTopic(setTopic);
                            }

                            setVisitTopicValue({
                              valueData: "",
                              valueInput: "",
                            });
                          }}
                          onReset={() => {
                            setVisitTopicValue({
                              valueData: null,
                              valueInput: "",
                            });
                          }}
                          list={visitTopicList}
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-1`}
                        />
                        {visitTopic.length > 0 && (
                          <ul className="w-full h-auto rounded-sm border p-2 float-left">
                            {visitTopic.map((item: any, index: number) => {
                              return (
                                <li
                                  onClick={() => {
                                    const setTopic = visitTopic.filter(
                                      (i: any) => {
                                        return i._id !== item._id;
                                      }
                                    );

                                    setVisitTopic(setTopic);
                                  }}
                                  key={index}
                                  className=" mb-1 cursor-pointer duration-150 hover:bg-red-700 list-none px-2 py-1 text-[0.75em] rounded-md mr-1 bg-red-600 text-white float-left flex items-center"
                                >
                                  {item.name}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                      <div className="flex-1">
                        <InputComponent
                          label="Check Out Distance (Meters)"
                          placeholder="0"
                          value={visitCheckOut}
                          onChange={(e) =>
                            setVisitCheckOut({ valueData: e, valueInput: e })
                          }
                          type="number"
                          min={0}
                          className={`h-9 mb-3`}
                        />
                        <InputComponent
                          label="Notes Length"
                          value={visitNoteLength}
                          onChange={(e) =>
                            setVisitNoteLength({ valueData: e, valueInput: e })
                          }
                          placeholder="0"
                          min={0}
                          type="number"
                          className={`h-9 mb-3`}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
              <ToggleBodyComponent
                name="Callsheet"
                className="mt-5"
                child={
                  <div className="flex">
                    <div className="flex-1 flex">
                      <div className="flex-1 mr-6">
                        <InputComponent
                          label="Mandatory Tags"
                          infiniteScroll={{
                            loading: cTagMoreLoading,
                            hasMore: cTagHasmore,
                            next: () => {
                              setCTagMoreLoading(true);
                              getCTags({
                                refresh: false,
                                search: callsheetTagValue.valueInput,
                              });
                            },
                            onSearch(e) {
                              ResetCTags();
                              getCTags({
                                refresh: true,
                                search: e,
                              });
                            },
                          }}
                          onCLick={() => {
                            ResetCTags();
                            getCTags({
                              refresh: true,
                              search: callsheetTagValue.valueInput,
                            });
                          }}
                          loading={cTagLoading}
                          modalStyle="mt-2"
                          value={callsheetTagValue}
                          onChange={(e) => {
                            setCallsheetTagValue({
                              ...callsheetTagValue,
                              valueInput: e,
                            });
                          }}
                          onSelected={(e) => {
                            const cekDup = callsheetTags.find(
                              (item: any) => item._id === e.value
                            );

                            if (!cekDup) {
                              let setTag = [
                                ...callsheetTags,
                                { _id: e.value, name: e.name },
                              ];
                              setCallsheetTags(setTag);
                            }

                            setCallsheetTagValue({
                              valueData: "",
                              valueInput: "",
                            });
                          }}
                          onReset={() => {
                            setCallsheetTagValue({
                              valueData: null,
                              valueInput: "",
                            });
                          }}
                          list={cTags}
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-1`}
                        />
                        {callsheetTags.length > 0 && (
                          <ul className="w-full h-auto rounded-sm border mb-2 p-2 float-left">
                            {callsheetTags.map((item: any, index: number) => {
                              return (
                                <li
                                  onClick={() => {
                                    const setTags = callsheetTags.filter(
                                      (i: any) => {
                                        return i._id !== item._id;
                                      }
                                    );

                                    setCallsheetTags(setTags);
                                  }}
                                  key={index}
                                  className=" mb-1 cursor-pointer duration-150 hover:bg-red-700 list-none px-2 py-1 text-[0.75em] rounded-md mr-1 bg-red-600 text-white float-left flex items-center"
                                >
                                  {item.name}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        {/* Topic */}
                        <InputComponent
                          label="Topic (Mandatory)"
                          infiniteScroll={{
                            loading: callsheetTopicMoreLoading,
                            hasMore: callsheetTopicHasMore,
                            next: () => {
                              setCallsheetTopicMoreLoading(true);
                              getCallsheetTopic({
                                refresh: false,
                                search: callsheetTopicValue.valueInput,
                              });
                            },
                            onSearch(e) {
                              ResetCallsheetTopic();
                              getCallsheetTopic({
                                refresh: true,
                                search: e,
                              });
                            },
                          }}
                          onCLick={() => {
                            ResetCallsheetTopic();
                            getCallsheetTopic({
                              refresh: true,
                              search: callsheetTopicValue.valueInput,
                            });
                          }}
                          loading={callsheetTopicLoading}
                          modalStyle="mt-2"
                          value={callsheetTopicValue}
                          onChange={(e) => {
                            setCallsheetTopicValue({
                              ...callsheetTopicValue,
                              valueInput: e,
                            });
                          }}
                          onSelected={(e) => {
                            const cekDup = callsheetTopic.find(
                              (item: any) => item._id === e.value
                            );

                            if (!cekDup) {
                              let setTopic = [
                                ...callsheetTopic,
                                { _id: e.value, name: e.name },
                              ];
                              setCallsheetTopic(setTopic);
                            }

                            setCallsheetTopicValue({
                              valueData: "",
                              valueInput: "",
                            });
                          }}
                          onReset={() => {
                            setCallsheetTopicValue({
                              valueData: null,
                              valueInput: "",
                            });
                          }}
                          list={callsheetTopicList}
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-1`}
                        />
                        {callsheetTopic.length > 0 && (
                          <ul className="w-full h-auto rounded-sm border p-2 float-left">
                            {callsheetTopic.map((item: any, index: number) => {
                              return (
                                <li
                                  onClick={() => {
                                    const setTopic = callsheetTopic.filter(
                                      (i: any) => {
                                        return i._id !== item._id;
                                      }
                                    );

                                    setCallsheetTopic(setTopic);
                                  }}
                                  key={index}
                                  className=" mb-1 cursor-pointer duration-150 hover:bg-red-700 list-none px-2 py-1 text-[0.75em] rounded-md mr-1 bg-red-600 text-white float-left flex items-center"
                                >
                                  {item.name}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                      <div className="flex-1">
                        <InputComponent
                          label="Notes Length"
                          value={callsheetNoteLength}
                          onChange={(e) =>
                            ssetCallsheetNoteLength({
                              valueData: e,
                              valueInput: e,
                            })
                          }
                          placeholder="0"
                          min={0}
                          type="number"
                          className={`h-9 mb-3`}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
              <ToggleBodyComponent
                name="Customer"
                className="mt-5"
                child={
                  <div className="flex ">
                    <li className="flex-1 px-2 list-none">
                      <InputComponent
                        label="Location Distance (Meters)"
                        placeholder="0"
                        value={locationDistance}
                        onChange={(e) =>
                          setLocationDistance({ valueData: e, valueInput: e })
                        }
                        type="number"
                        min={0}
                        //   disabled={disabled}
                        className={`h-9 mb-3`}
                      />
                    </li>
                    <li className="flex-1 px-2 list-none"></li>
                  </div>
                }
              />
            </div>
          </>
        ) : (
          <LoadingComponent />
        )}
      </div>
    </>
  );
};

export default SettingPage;

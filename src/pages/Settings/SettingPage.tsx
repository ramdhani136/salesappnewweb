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

  const [tags, setTags] = useState<IListInput[]>([]);
  const [tagPage, setTagPage] = useState<Number>(1);
  const [tagLoading, setTagLoading] = useState<boolean>(true);
  const [tagMoreLoading, setTagMoreLoading] = useState<boolean>(false);
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

  const [visitTags, setVisitTags] = useState<any[]>([]);
  const [callsheetTags, setCallsheetTags] = useState<any[]>([]);
  const [tagHasmore, setTagHasmore] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);

  const [visitTagValue, setVisitTagValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [callsheetTagValue, setCallsheetTagValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

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

      setPrevData({
        visit: {
          checkInDistance: visit.checkInDistance,
          checkOutDistance: visit.checkOutDistance ?? 0,
          notesLength: visit.notesLength ?? 0,
          tagsMandatory: visit.tagsMandatory,
        },
        callsheet: {
          notesLength: callsheet.notesLength,
          tagsMandatory: callsheet.tagsMandatory,
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
    setLoading(false);
  };

  const getTags = async (search?: string): Promise<void> => {
    try {
      if (!tagLoading) {
        setTagMoreLoading(true);
      } else {
        setTagMoreLoading(false);
      }

      const result: any = await GetDataServer(DataAPI.TAGS).FIND({
        search: search ?? "",
        limit: 10,
        page: `${tagPage}`,
      });
      if (result.data.length > 0) {
        let listInput: IListInput[] = result.data.map((item: any) => {
          return {
            name: item.name,
            value: item._id,
          };
        });
        setTags([...tags, ...listInput]);
        setTagHasmore(result.hasMore);
        setTagPage(result.nextPage);
      }

      setTagLoading(false);
      setTagMoreLoading(false);
    } catch (error: any) {
      setTagLoading(false);
      setTagMoreLoading(false);
      setTagHasmore(false);
    }
  };

  const ResetTags = () => {
    setTags([]);
    setTagHasmore(false);
    setTagPage(1);
    setTagLoading(true);
  };

  useEffect(() => {
    const updateData = {
      visit: {
        checkInDistance: visitCheckIn.valueData,
        checkOutDistance: visitCheckOut.valueData,
        notesLength: visitNoteLength.valueData,
        tagsMandatory: visitTags,
      },
      callsheet: {
        notesLength: callsheetNoteLength.valueData,
        tagsMandatory: callsheetTags,
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
  ]);

  const OnUpdate = async () => {
    setLoading(true);
    try {
      const data = {
        visit: {
          checkInDistance: visitCheckIn.valueData,
          checkOutDistance: visitCheckOut.valueData,
          notesLength: visitNoteLength.valueData,
          tagsMandatory: visitTags,
        },
        callsheet: {
          notesLength: callsheetNoteLength.valueData,
          tagsMandatory: callsheetTags,
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
                          label="Mandatory Tags"
                          infiniteScroll={{
                            loading: tagMoreLoading,
                            hasMore: tagHasmore,
                            next: () => {
                              getTags();
                            },
                            onSearch(e) {
                              getTags(e);
                            },
                          }}
                          loading={tagLoading}
                          modalStyle="mt-2"
                          value={visitTagValue}
                          onChange={(e) => {
                            ResetTags();
                            setTagLoading(true);
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
                            ResetTags();
                            setVisitTagValue({
                              valueData: null,
                              valueInput: "",
                            });
                          }}
                          list={tags}
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-1`}
                        />
                        {visitTags.length > 0 && (
                          <ul className="w-full h-auto rounded-sm border p-2 float-left">
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
                            loading: tagMoreLoading,
                            hasMore: tagHasmore,
                            next: () => {
                              getTags();
                            },
                            onSearch(e) {
                              getTags(e);
                            },
                          }}
                          loading={tagLoading}
                          modalStyle="mt-2"
                          value={callsheetTagValue}
                          onChange={(e) => {
                            ResetTags();
                            setTagLoading(true);
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
                            ResetTags();
                            setCallsheetTagValue({
                              valueData: null,
                              valueInput: "",
                            });
                          }}
                          list={tags}
                          type="text"
                          //   disabled={disabled}
                          className={`h-9 mb-1`}
                        />
                        {callsheetTags.length > 0 && (
                          <ul className="w-full h-auto rounded-sm border p-2 float-left">
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

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
  ToggleBodyComponent,
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, FetchApi, Meta } from "../../utils";
import { IListIconButton } from "../../components/atoms/IconButton";
import ProfileImg from "../../assets/images/iconuser.jpg";
import Swal from "sweetalert2";
import { Alert, Snackbar } from "@mui/material";

const SettingPage: React.FC = () => {
  const navigate = useNavigate();

  const [id, setId] = useState<string>("");

  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const metaData = {
    title: `Settings - Sales App Ekatunggal`,
    description: "Halaman form User sales web system",
  };

  const [scroll, setScroll] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);

  const [tags, setTags] = useState<IListInput[]>([]);
  const [tagPage, setTagPage] = useState<Number>(1);
  const [tagLoading, setTagLoading] = useState<boolean>(true);
  const [tagMoreLoading, setTagMoreLoading] = useState<boolean>(false);
  const [visitCheckIn, setVisitCheckIn] = useState<IValue>({
    valueData: 0,
    valueInput: "0",
  });
  const [visitCheckOut, setVisitCheckOut] = useState<IValue>({
    valueData: 0,
    valueInput: "0",
  });
  const [visitNoteLength, setVisitNoteLength] = useState<IValue>({
    valueData: 0,
    valueInput: "0",
  });

  const [visitTags, setVisitTags] = useState<any[]>([]);
  const [tagHasmore, setTagHasmore] = useState<boolean>(false);

  const [visitTagValue, setVisitTagValue] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [phone, setPhone] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [erpSite, setErpSite] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [erpToken, setErpToken] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const browseRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {
    setLoading(true);
    try {
      const result: any = await GetDataServer(DataAPI.CONFIG).FIND({
        limit: 1,
      });
      setId(result.data._id);
      const visit: any = result.data.visit;
      setVisitCheckIn({
        valueData: visit.checkInDistance ?? 0,
        valueInput: visit.checkInDistance ?? 0,
      });
      setVisitCheckOut({
        valueData: visit.checkOutDistance ?? 0,
        valueInput: visit.checkOutDistance ?? 0,
      });
      setVisitNoteLength({
        valueData: visit.notesLength ?? 0,
        valueInput: visit.notesLength ?? 0,
      });

      if (visit.tagsMandatory.length > 0) {
        setVisitTags(visit.tagsMandatory);
      }
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
      };
      await GetDataServer(DataAPI.CONFIG).UPDATE({
        id: id,
        data: data,
      });
      Swal.fire({ icon: "success" , title: 'Data has been saved',});
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

                {/* {isChangeData && ( */}
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
                {/* )} */}
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
                                  className=" mb-1 cursor-pointer duration-150 hover:bg-green-700 list-none px-2 py-1 text-[0.75em] rounded-md mr-1 bg-green-600 text-white float-left flex items-center"
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
                  <div className="flex ">
                    <li className="flex-1 px-2 list-none">
                      <label className="text-sm">Uri : </label>
                      <textarea
                        className="border mt-1 p-2 text-[0.95em] bg-gray-100  w-full rounded-md"
                        name="Site Uri"
                        value={erpSite.valueData}
                        onChange={(e) =>
                          setErpSite({
                            valueData: e.target.value,
                            valueInput: e.target.value,
                          })
                        }
                      />
                      <h4 className="italic text-[0.8em] text-gray-700">
                        *Uri of the erpnext system so that it is connected to
                        the erp data ex: etm.digitalasiasolusindo.com
                      </h4>
                    </li>
                    <li className="flex-1 px-2 list-none">
                      <label className="text-sm">Token : </label>
                      <textarea
                        className="border mt-1 p-2 text-[0.95em] bg-gray-100  w-full rounded-md"
                        name="Site Uri"
                        value={erpToken.valueData}
                        onChange={(e) =>
                          setErpToken({
                            valueData: e.target.value,
                            valueInput: e.target.value,
                          })
                        }
                      />
                      <h4 className="italic text-[0.8em] text-gray-700">
                        *Get from user token in erpnext system
                      </h4>
                    </li>
                  </div>
                }
              />
              <ToggleBodyComponent
                name="Customer"
                className="mt-5"
                child={
                  <div className="flex ">
                    <li className="flex-1 px-2 list-none">
                      <label className="text-sm">Uri : </label>
                      <textarea
                        className="border mt-1 p-2 text-[0.95em] bg-gray-100  w-full rounded-md"
                        name="Site Uri"
                        value={erpSite.valueData}
                        onChange={(e) =>
                          setErpSite({
                            valueData: e.target.value,
                            valueInput: e.target.value,
                          })
                        }
                      />
                      <h4 className="italic text-[0.8em] text-gray-700">
                        *Uri of the erpnext system so that it is connected to
                        the erp data ex: etm.digitalasiasolusindo.com
                      </h4>
                    </li>
                    <li className="flex-1 px-2 list-none">
                      <label className="text-sm">Token : </label>
                      <textarea
                        className="border mt-1 p-2 text-[0.95em] bg-gray-100  w-full rounded-md"
                        name="Site Uri"
                        value={erpToken.valueData}
                        onChange={(e) =>
                          setErpToken({
                            valueData: e.target.value,
                            valueInput: e.target.value,
                          })
                        }
                      />
                      <h4 className="italic text-[0.8em] text-gray-700">
                        *Get from user token in erpnext system
                      </h4>
                    </li>
                  </div>
                }
              />
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

export default SettingPage;

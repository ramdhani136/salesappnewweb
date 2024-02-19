import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  ButtonStatusComponent,
  IconButton,
  InputComponent,
  TimeLineVertical,
} from "../../components/atoms";
import { IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, LocalStorage, Meta } from "../../utils";

import { IListIconButton } from "../../components/atoms/IconButton";
import Swal from "sweetalert2";

interface detailModel {
  question: {
    _id: String;
    name: String;
  };
  answer: String;
}

const FormAssesmentPage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${data.customer?.name ?? "Loading ..  "} - Sales App Ekatunggal`,
    description: "Halaman form Assesment Sales web system",
  };

  const navigate = useNavigate();

  const [tab, setTab] = useState<string>("Details");
  const [scroll, setScroll] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [template, setTemplate] = useState<any>({});

  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [schedule, setSchedule] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });
  const [desc, setDesc] = useState<string>("");

  const [activeDate, setActiveDate] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });
  const [deactiveDate, setDeactiveDate] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [workflow, setWorkflow] = useState<IListIconButton[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);
  const [details, setDetails] = useState<detailModel[]>([]);

  const getData = async (): Promise<void> => {
    setWorkflow([]);
    try {
      const result = await GetDataServer(DataAPI.ASSESMENTSCHEDULEITEM).FINDONE(
        `${id}`
      );

      // set workflow
      if (result.workflow.length > 0) {
        const isWorkflow = result.workflow.map((item: any): IListIconButton => {
          return {
            name: item.action,
            onClick: () => {
              AlertModal.confirmation({
                onConfirm: () => {
                  console.log(item);
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

      setDesc(result.data.schedule.desc);

      setSchedule({
        valueData: result.data.schedule._id,
        valueInput: result.data.schedule.name,
      });
      setUser({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });
      setActiveDate({
        valueData: moment(result.data.schedule.activeDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.schedule.activeDate).format(
          "YYYY-MM-DD"
        ),
      });
      setDeactiveDate({
        valueData: moment(result.data.schedule.deactiveDate).format(
          "YYYY-MM-DD"
        ),
        valueInput: moment(result.data.schedule.deactiveDate).format(
          "YYYY-MM-DD"
        ),
      });

      setData(result.data);

      if (result.data.desc) {
        setDesc(result.data.desc);
      }

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/assesment");
    }
  };

  const onSave = async (nextState?: String): Promise<any> => {
    console.log(nextState)
    // setLoading(true);

    // try {
    //   const upData: any = {};
    //   upData.idScheduleItem = id;
    //   upData.customer = { _id: data.customer._id, name: data.customer.name };
    //   upData.schedule = { _id: data.schedule._id, name: data.schedule.name };
    //   upData.activeDate = data.schedule.activeDate;
    //   upData.deactiveDate = data.schedule.deactiveDate;
    //   upData.assesmentTemplate = template;
    //   upData.details = details;
    //   await GetDataServer(DataAPI.ASSESMENTRESULT).CREATE(upData);
    //   Swal.fire("Success!", `Success`, "success");

    //   navigate(`/assesment`);
    // } catch (error: any) {
    //   console.log(error);
    //   Swal.fire(
    //     "Error!",
    //     `${
    //       error?.response?.data?.error
    //         ? error.response.data.error
    //         : error?.response?.data?.msg
    //         ? error?.response?.data?.msg
    //         : error?.message
    //         ? error?.message
    //         : error ?? "Error Insert"
    //     }`,
    //     "error"
    //   );
    // }
    // setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  console.log(details)

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
                  onClick={() => navigate("/assesment")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {data.customer.name}
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

                {template &&
                  template?.indicators?.length === details.length && (
                    <IconButton
                      name="Submit"
                      callback={() => {
                        AlertModal.confirmation({
                          onConfirm: onSave,
                          confirmButtonText: `Yes, Submit!`,
                        });
                      }}
                      className={`opacity-80 hover:opacity-100 duration-100  `}
                    />
                  )}

                {tab === "Questions" && workflow.length > 0 && (
                  <IconButton
                    name="Actions"
                    list={workflow}
                    callback={onSave}
                    className={`opacity-80 hover:opacity-100 duration-100  `}
                    classModal="-mt-[3px]"
                  />
                )}
              </div>
            </div>
            <div className=" px-5 flex flex-col ">
              <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none">
                <ul className="w-full h-auto border-b px-4 float-left text-[0.97em]">
                  <li
                    className={`float-left mx-4 cursor-pointer duration-300 py-3 opacity-90 hover:opacity-100 ${
                      tab === "Details" &&
                      "border-b border-blue-400 py-3 font-semibold "
                    }`}
                    onClick={() => setTab("Details")}
                  >
                    Details
                  </li>
                  <li
                    className={`float-left mx-3 cursor-pointer duration-300  opacity-90 hover:opacity-100 py-3 ${
                      tab === "Questions" &&
                      "border-b border-blue-400  font-semibold "
                    }`}
                    onClick={() => setTab("Questions")}
                  >
                    Questions
                  </li>
                </ul>
                <div className="w-full h-auto  float-left rounded-md p-3 py-5">
                  {tab === "Details" && (
                    <>
                      <div className=" w-1/2 px-4 float-left ">
                        <InputComponent
                          mandatoy
                          label="Schedule"
                          value={schedule}
                          className="h-[38px] mb-3"
                          type="text"
                          disabled={true}
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
                        <label className="text-sm">Desc</label>
                        <textarea
                          className="border mt-1 p-2 text-[0.95em] bg-gray-50  w-full rounded-md h-[150px]"
                          name="Site Uri"
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          disabled
                        />
                      </div>
                      <div className=" w-1/2 px-4 float-left  mb-3">
                        <InputComponent
                          label="Active Date"
                          value={activeDate}
                          className="h-[38px]  mb-3"
                          type="date"
                          disabled
                        />
                        <InputComponent
                          label="Deactive Date"
                          value={deactiveDate}
                          className="h-[38px]  mb-3"
                          type="date"
                          disabled
                        />
                      </div>
                    </>
                  )}

                  {tab === "Questions" && (
                    <GetQuestion
                      data={data}
                      details={details}
                      setDetails={setDetails}
                      template={template}
                      setTemplate={setTemplate}
                    />
                  )}
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

const GetQuestion: React.FC<{
  data: any;
  details: detailModel[];
  setDetails: React.Dispatch<React.SetStateAction<detailModel[]>>;
  template: any[];
  setTemplate: React.Dispatch<React.SetStateAction<any[]>>;
}> = ({ data, details, setDetails, setTemplate }) => {
  const [indicators, setIndicators] = useState<any[]>([]);

  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const getData = async () => {
    try {
      setLoading(true);
      const response = await GetDataServer(DataAPI.ASSESMENTTEMPLATE).FINDONE(
        data.schedule.assesmentTemplate
      );

      if (response.data.status == 0) {
        setLoading(false);
        AlertModal.Default({
          icon: "error",
          title: "Error",
          text: "Assesment template not active!!",
        });

        navigate("/assesment");
      } else {
        setTemplate(response.data);
        setIndicators(response.data.indicators);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/assesment");
    }
  };

  const getIndexById = (data: any[], targetId: string) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i]._id === targetId) {
        return i;
      }
    }
    return -1; // Jika tidak ditemukan
  };

  const addOrUpdateAnswer = (newAnswer: any) => {
    // Cari apakah ID jawaban sudah ada dalam array
    const existingAnswerIndex = details.findIndex(
      (item) => item.question._id === newAnswer.question._id
    );

    // Jika ID jawaban sudah ada dalam array, update data
    if (existingAnswerIndex !== -1) {
      const updatedAnswers = [...details];
      updatedAnswers[existingAnswerIndex] = newAnswer;
      setDetails(updatedAnswers);
    } else {
      // Jika ID jawaban tidak ada dalam array, tambahkan data baru
      setDetails([...details, newAnswer]);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      {!loading && (
        <div className="w-full float-left text-[0.95em]">
          <ul className="w-1/2 float-left px-2">
            {indicators
              .filter((element, index) => index % 2 === 0)
              .map((item: any, id) => {
                return (
                  <li key={id} className="mb-4">
                    <h4>
                      {`${getIndexById(indicators, item._id) + 1}.
                ${item.questionId.name}`}
                    </h4>
                    {item.options.map((option: any, idOption: any) => {
                      return (
                        <div
                          key={idOption}
                          className="flex items-center text-md ml-3"
                        >
                          <input
                            id={`option_${option._id}`}
                            type="radio"
                            value={option.name}
                            name={item._id}
                            onChange={(e) => {
                              addOrUpdateAnswer({
                                answer: e.target.value,
                                question: {
                                  _id: item.questionId._id,
                                  name: item.questionId.name,
                                },
                              });
                            }}
                            checked={details.some(
                              (i: any) =>
                                i.question._id === item.questionId._id &&
                                i.answer === option.name
                            )}
                          />
                          <label
                            htmlFor={`option_${option._id}`}
                            className="ml-2"
                          >
                            {`${option.name}`}
                          </label>
                        </div>
                      );
                    })}
                  </li>
                );
              })}
          </ul>
          <ul className="w-1/2  float-left px-2">
            {indicators
              .filter((element, index) => index % 2 === 1)
              .map((item: any, id) => {
                return (
                  <li key={id} className="mb-4">
                    <h4>
                      {`${getIndexById(indicators, item._id) + 1}.
                ${item.questionId.name}`}
                    </h4>
                    {item.options.map((option: any, idoption: any) => {
                      return (
                        <div
                          key={idoption}
                          className="flex items-center text-md ml-3"
                        >
                          <input
                            id={`option_${option._id}`}
                            type="radio"
                            value={option.name}
                            name={item._id}
                            onChange={(e) => {
                              addOrUpdateAnswer({
                                answer: e.target.value,
                                question: {
                                  _id: item.questionId._id,
                                  name: item.questionId.name,
                                },
                              });
                            }}
                            checked={details.some(
                              (i: any) =>
                                i.question._id === item.questionId._id &&
                                i.answer === option.name
                            )}
                          />
                          <label
                            htmlFor={`option_${option._id}`}
                            className="ml-2"
                          >
                            {" "}
                            {`${option.name}`}
                          </label>
                        </div>
                      );
                    })}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
      {loading && <LoadingComponent />}
    </>
  );
};

export default FormAssesmentPage;

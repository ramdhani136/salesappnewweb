import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  ButtonStatusComponent,
  IconButton,
  InputComponent,
  ToggleBodyComponent,
} from "../../components/atoms";
import { IListInput, IValue } from "../../components/atoms/InputComponent";
import { LoadingComponent } from "../../components/moleculs";
import moment from "moment";
import { AlertModal, FetchApi, LocalStorage, Meta } from "../../utils";
import AddIcon from "@mui/icons-material/Add";
import { IListIconButton } from "../../components/atoms/IconButton";
import FormAssesmentQuestionPage from "../AssesmentQuestion/FormAssesmentQuestionPage";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Mms } from "@mui/icons-material";

const ReportViewAssesmentPage: React.FC = () => {
  let { id } = useParams();
  const [data, setData] = useState<any>({});
  const metaData = {
    title: `${
      id ? data.customer?.name ?? "Loading ..  " : "New Assesment"
    } - Sales App Ekatunggal`,
    description: "Report Assesment - Sales web system",
  };

  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [scroll, setScroll] = useState<number>(0);
  const [user, setUser] = useState<IValue>({
    valueData: LocalStorage.getUser()._id,
    valueInput: LocalStorage.getUser().name,
  });
  const [name, setName] = useState<IValue>({
    valueData: "",
    valueInput: "",
  });

  const [status, setStatus] = useState<String>("1");
  const [isActive, setIsActive] = useState<String>("1");
  const [indicators, setIndicators] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [result, setResult] = useState<any[]>([]);
  const [score, setScore] = useState<number>(0);

  const [createdAt, setCreatedAt] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [activeDate, setActiveDate] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [deactiveDate, setDeactiveDate] = useState<IValue>({
    valueData: moment(Number(new Date())).format("YYYY-MM-DD"),
    valueInput: moment(Number(new Date())).format("YYYY-MM-DD"),
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [listMoreAction, setListMoreAction] = useState<IListIconButton[]>([]);

  const getData = async (): Promise<void> => {
    try {
      const result = await GetDataServer(DataAPI.ASSESMENTRESULT).FINDONE(
        `${id}`
      );
      setName({
        valueData: result.data.schedule.name,
        valueInput: result.data.schedule.name,
      });
      setUser({
        valueData: result.data.createdBy._id,
        valueInput: result.data.createdBy.name,
      });
      setCreatedAt({
        valueData: moment(result.data.createdAt).format("YYYY-MM-DD"),
        valueInput: moment(result.data.createdAt).format("YYYY-MM-DD"),
      });
      setActiveDate({
        valueData: moment(result.data.activeDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.activeDate).format("YYYY-MM-DD"),
      });
      setDeactiveDate({
        valueData: moment(result.data.deactiveDate).format("YYYY-MM-DD"),
        valueInput: moment(result.data.deactiveDate).format("YYYY-MM-DD"),
      });

      setIsActive(result.data.status);
      setData(result.data);

      setScore(result.data.score);

      setResult(result.data.details);

      setIndicators(result.data.assesmentTemplate?.indicators ?? []);
      setGrades(result.data.assesmentTemplate?.grades ?? []);

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Data not found!",
      });

      navigate("/report/assesment/");
    }
  };

  const CekPermission = async () => {
    try {
      const result: any = await FetchApi.post(
        `${import.meta.env.VITE_PUBLIC_URI}/users/getpermission`,
        { doc: "assesmentresult", action: "report" }
      );

      if (result.data.status) {
        if (id) {
          getData();
        } else {
          setLoading(false);
          setListMoreAction([]);
        }
      } else {
        setLoading(false);
        AlertModal.Default({
          icon: "error",
          title: "Error",
          text: "Permission denied!",
        });

        navigate("/report/assesment/");
      }
    } catch (error) {
      setLoading(false);
      AlertModal.Default({
        icon: "error",
        title: "Error",
        text: "Permission denied!",
      });
      navigate("/report/assesment/");
    }
  };

  const getPrint = () => {
    setLoading(true);
    const input: any = pdfRef.current;
    // Get the dimensions of the element
    const inputWidth = input.offsetWidth;
    const inputHeight = input.offsetHeight;

    html2canvas(input, { width: inputWidth, height: inputHeight }).then(
      (canvas: HTMLCanvasElement) => {
        const imgData: any = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "px", [inputWidth, inputHeight], true); // Use the element's dimensions
        const pdfWidth: number = pdf.internal.pageSize.getWidth();
        const pdfHeight: number = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = (pdfHeight - imgHeight * ratio) / 2;
        pdf.addImage(
          imgData,
          "PNG",
          imgX,
          imgY,
          imgWidth * ratio,
          imgHeight * ratio
        );
        pdf.save(`${data!.customer!.name}.pdf`);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    CekPermission();
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
                  onClick={() => navigate("/report/assesment")}
                  className="font-bold text-lg mr-2 cursor-pointer"
                >
                  {!id ? "New Assesment" : data.customer.name}
                </h4>
                <div className="text-md">
                  <ButtonStatusComponent
                    // className="text-[0.7em]"
                    status={isActive === "1" ? "1" : "0"}
                    name={isActive === "1" ? "Active" : "Expired"}
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
                <IconButton
                  name="Generate Pdf"
                  // list={workflow}
                  callback={getPrint}
                  className={`opacity-80 hover:opacity-100 duration-100  `}
                />
              </div>
            </div>
            {PageComponent()}
          </>
        ) : (
          <LoadingComponent />
        )}
      </div>
    </>
  );

  function PageComponent() {
    return (
      <div className=" px-5 flex flex-col " ref={pdfRef}>
        <div className="border w-full flex-1  bg-white rounded-md overflow-y-scroll scrollbar-none">
          <div className="w-full h-auto  float-left rounded-md p-3 py-5">
            <div className=" w-1/2 px-4 float-left ">
              <InputComponent
                mandatoy
                label="Name"
                value={name}
                className="h-[38px] mb-3"
                type="text"
                onChange={(e) =>
                  setName({
                    valueData: e,
                    valueInput: e,
                  })
                }
                disabled
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
              <InputComponent
                label="Date"
                value={createdAt}
                className="h-[38px]  mb-3"
                type="date"
                disabled
              />
            </div>
            <div className=" w-1/2 px-4 float-left  mb-3">
              <InputComponent
                label="Active At"
                value={activeDate}
                className="h-[38px]  mb-3"
                type="date"
                disabled
              />
              <InputComponent
                label="Deactive At"
                value={deactiveDate}
                className="h-[38px]  mb-3"
                type="date"
                disabled
              />
              <InputComponent
                label="Status"
                value={{
                  valueData: isActive,
                  valueInput: isActive === "1" ? "Active" : "Expired",
                }}
                className="h-[38px]  mb-3"
                type="text"
                onChange={(e) =>
                  setCreatedAt({
                    valueData: e,
                    valueInput: e,
                  })
                }
                disabled
              />
            </div>
          </div>
        </div>

        <ToggleBodyComponent
          name="Indicators"
          className="mt-5 mb-5"
          child={
            <IndicatorComponent
              data={indicators}
              setData={setIndicators}
              status={status}
              result={result}
            />
          }
        />
        <ToggleBodyComponent
          name="Grading"
          className="mb-5"
          child={
            <GradingComponent
              data={grades}
              setData={setGrades}
              status={status}
              score={score}
            />
          }
        />
      </div>
    );
  }
};

interface IIndicators {
  data: any[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  status: String;
  result?: any[];
  score?: number;
}

const GradingComponent: React.FC<IIndicators> = ({
  data,
  setData,
  status,
  score,
}) => {
  const getResult = (bottom: number, top: number) => {
    if (score! >= bottom && score! <= top) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <h4 className="font-semibold my-5">Total Score : {score ?? 0}</h4>
      <table className="text[0.95em] w-full">
        <thead>
          <tr>
            <th className="text-center h-12">No</th>
            <th className="w-[150px]">Bottom</th>
            <th className="w-[150px]">Top</th>
            <th className="w-[180px]">Grade</th>
            <th>Notes / Recomendation</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item: any, index: number) => {
            return (
              <tr
                key={index}
                className={`border-b ${
                  getResult(item.bottom, item.top) && "bg-yellow-50"
                }`}
              >
                <td className="text-center">{index + 1}</td>
                <td>
                  <input
                    type="number"
                    className=" w-[95%] text-center border  bg-gray-50 border-[#ececec] h-9 "
                    placeholder="0"
                    value={item.bottom}
                    disabled={status !== "Draft"}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="20"
                    className="w-[95%] text-center  border bg-gray-50 border-[#ececec] h-9"
                    value={item.top}
                    disabled
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="A"
                    className="w-[95%] px-2 border bg-gray-50 border-[#ececec] h-9"
                    value={item.grade ?? ""}
                    disabled
                  />
                </td>
                <td>
                  <textarea
                    className="w-full p-2 bg-gray-50 border  border-[#ececec] my-2"
                    name="Notes"
                    rows={2}
                    placeholder="Rekomendasi perubahan TOP ke Cash"
                    value={item.notes ?? ""}
                    disabled
                  />
                </td>
                <td></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

const IndicatorComponent: React.FC<IIndicators> = ({
  data,
  result,
  setData,
  status,
}) => {
  // branch
  const [questionList, setQuestionList] = useState<IListInput[]>([]);
  const [questionPage, setQuestionPage] = useState<Number>(1);
  const [questionLoading, setQuestionLoading] = useState<boolean>(true);
  const [questionMoreLoading, setQuestionMoreLoading] =
    useState<boolean>(false);
  const [questionHasMore, setQuestionHasMore] = useState<boolean>(false);
  // End

  const getQuestion = async (data: {
    search?: string | String;
    refresh?: boolean;
  }): Promise<void> => {
    try {
      if (data.refresh === undefined) {
        data.refresh = true;
      }
      const result: any = await GetDataServer(DataAPI.ASSESMENTQUESTION).FIND({
        search: data.search ?? "",
        limit: 10,
        page: `${data.refresh ? 1 : questionPage}`,
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
          setQuestionList([...questionList, ...listInput]);
        } else {
          setQuestionList([...listInput]);
        }
        setQuestionHasMore(result.hasMore);
        setQuestionPage(result.nextPage);
      }

      setQuestionLoading(false);
      setQuestionMoreLoading(false);
    } catch (error: any) {
      setQuestionList([]);
      setQuestionLoading(false);
      setQuestionMoreLoading(false);
      setQuestionHasMore(false);
    }
  };

  const ResetQuestion = () => {
    setQuestionList([]);
    setQuestionHasMore(false);
    setQuestionPage(1);
    setQuestionLoading(true);
  };

  const getChecked = (questionId: String, answer: String) => {
    const getResult = result?.find((item) => {
      return item.question._id === questionId && item.answer === answer;
    });

    return getResult;
  };

  const getScore = (questionId: String) => {
    const setScore: any = result?.filter(
      (item: any) => item.question._id === questionId
    );

    if (setScore?.length > 0) {
      return setScore[0].score;
    }

    return 0;
  };

  return (
    <>
      <table className="w-full text-left" border={1}>
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">Question</th>
            <th className="text-center">Weight</th>
            <th className="text-center h-12 ">Point</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: any, index: number) => {
            return (
              <React.Fragment key={index}>
                <tr key={index}>
                  <td className="text-center h-7">
                    <h4 className="mt-3">{index + 1}</h4>
                  </td>
                  <td className="w-[80%]">
                    <InputComponent
                      modal={{
                        Children: FormAssesmentQuestionPage,
                        className: "w-[63%] h-[98%]",
                        props: {
                          modal: true,
                          name: item.questionId?.name ?? "",
                          Callback: (e: any) => {
                            item.questionId._id = e._id;
                            item.questionId.name = e.name;
                            const newData = [...data];
                            setData(newData);
                          },
                        },
                        title: "Form Question",
                      }}
                      mandatoy
                      infiniteScroll={{
                        loading: questionMoreLoading,
                        hasMore: questionHasMore,
                        next: () => {
                          setQuestionMoreLoading(true);
                          getQuestion({
                            refresh: false,
                            search: item.questionId?.name ?? "",
                          });
                        },
                        onSearch(e) {
                          ResetQuestion();
                          getQuestion({ refresh: true, search: e });
                        },
                      }}
                      onCLick={() => {
                        ResetQuestion();
                        getQuestion({
                          refresh: true,
                          search: item.questionId?.name ?? "",
                        });
                      }}
                      loading={questionLoading}
                      modalStyle="mt-2"
                      value={{
                        valueData: item.questionId?._id ?? "",
                        valueInput: item.questionId?.name ?? "",
                      }}
                      onChange={(e) => {
                        item.questionId.name = e;
                        const newData = [...data];
                        setData(newData);
                      }}
                      onSelected={(e) => {
                        item.questionId._id = e.value;
                        item.questionId.name = e.name;
                        const newData = [...data];
                        setData(newData);
                      }}
                      onReset={() => {
                        item.questionId._id = "";
                        item.questionId.name = "";
                        const newData = [...data];
                        setData(newData);
                      }}
                      list={questionList}
                      type="text"
                      className={`h-9 mt-4 text-[0.95em]`}
                      disabled={status !== "Draft"}
                    />
                  </td>
                  <td className="">
                    <input
                      className="w-[100px] p-1 text-[0.95em] text-center bg-gray-50 border border-[#ececec]  rounded-md ml-1 mt-4 h-10"
                      type="number"
                      value={item.weight ?? 0}
                      disabled
                    />
                  </td>
                  <td className="text-center"></td>
                </tr>
                {item.options?.map((option: any, idOption: number) => {
                  return (
                    <React.Fragment key={idOption}>
                      <tr>
                        <td className="text-center h-5   "></td>
                        <td className="flex">
                          <input
                            className="ml-2"
                            type="checkbox"
                            disabled
                            checked={getChecked(
                              item.questionId._id,
                              option.name
                            )}
                          />
                          <input
                            className="p-1  ml-1 flex-1 text-[0.95em] disabled:bg-white"
                            type="text"
                            value={option.name ?? ""}
                            disabled
                          />
                        </td>
                        <td className="text-center w-[100px]">
                          <input
                            className="p-1 text-[0.95em] text-center disabled:bg-white w-[100px] "
                            type="number"
                            value={option.weight ?? 0}
                            disabled
                          />
                        </td>
                        <td className="text-center ">
                          {getChecked(item.questionId._id, option.name) &&
                            `${option.weight}%`}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
                <tr className="bg-yellow-50">
                  <td className="text-center "></td>
                  <td
                    className={`flex items-center ${
                      item.options
                        ? item.options?.length === 0 && "mt-2"
                        : "mt-2"
                    } `}
                  >
                    <h4 className="font-semibold py-1">Score : </h4>
                  </td>
                  <td className="text-center font-semibold">
                    {/* <input
                      className="p-1 text-[0.95em] text-center disabled:bg-green-100"
                      type="number"
                      value={getScore(item.questionId._id)}
                      disabled
                    /> */}
                  </td>
                  <td className="text-center font-semibold">
                    {getScore(item.questionId._id)}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {status === "Draft" && (
        <button
          onClick={() => {
            const newData = [...data, { questionId: { _id: "", name: "" } }];
            setData(newData);
          }}
          className="text-[0.95em] mt-6 border rounded-md py-1 px-2 flex items-center bg-green-600 text-white text-sm border-green-700 opacity-70 hover:opacity-100 duration-300"
        >
          <h4>Add</h4>
          <AddIcon style={{ fontSize: 14 }} className="mt-1 ml-1" />
        </button>
      )}
    </>
  );
};

export default ReportViewAssesmentPage;

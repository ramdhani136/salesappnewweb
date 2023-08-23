import React, { useEffect, useState } from "react";
import { FetchApi } from "../../utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { LoadingComponent } from "../moleculs";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import zoomPlugin from "chartjs-plugin-zoom";
import { InputComponent, Select } from "../atoms";
import { IValue } from "../atoms/InputComponent";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  zoomPlugin
);

const ReportSalesAnalytic: React.FC<any> = () => {
  const [minChartIndex, setMinChartIndex] = useState<number>(0);
  const [maxChartIndex, setMaxChartIndex] = useState<number>(6);
  const [data, setData] = useState<any>(null);
  const [dataChart, setDataChart] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  const listType: any[] = [
    { title: "Customer Group", value: "Customer Group" },
    { title: "Customer", value: "Customer" },
    { title: "Item Group", value: "Item Group" },
    { title: "Item", value: "Item" },
    { title: "Territory", value: "Territory" },
    { title: "Order Type", value: "Order Type" },
    { title: "Project", value: "Project" },
  ];
  const listBaseOne: any[] = [
    { title: "Sales Order", value: "Sales Order" },
    { title: "Delivery Note", value: "Delivery Note" },
    { title: "Sales Invoice", value: "Sales Invoice" },
  ];

  const listValueQty: any[] = [
    { title: "Value", value: "Value" },
    { title: "Quantity", value: "Quantity" },
  ];
  const listRange: any[] = [
    { title: "Weekly", value: "Weekly" },
    { title: "Monthly", value: "Monthly" },
    { title: "Quarterly", value: "Quarterly" },
    { title: "Yearly", value: "Yearly" },
  ];

  const now = moment();
  const startOfYear = now.clone().startOf("year");
  const endOfYear = now.clone().endOf("year");

  const [fromDate, setFromDate] = useState<IValue>({
    valueData: startOfYear.format("YYYY-MM-DD"),
    valueInput: startOfYear.format("YYYY-MM-DD"),
  });

  const [toDate, setToDate] = useState<IValue>({
    valueData: endOfYear.format("YYYY-MM-DD"),
    valueInput: endOfYear.format("YYYY-MM-DD"),
  });

  const [type, setType] = useState<String>("Customer Group");
  const [baseOn, setBaseOn] = useState<String>("Sales Invoice");
  const [valueQty, setValueQty] = useState<String>("Value");
  const [range, setRange] = useState<String>("Monthly");
  const [labels, setLabel] = useState<string[]>([]);
  const [column, setColumn] = useState<string[]>([]);
  function getRandomColor() {
    const r = Math.floor(Math.random() * 256); // Nilai merah antara 0 dan 255
    const g = Math.floor(Math.random() * 256); // Nilai hijau antara 0 dan 255
    const b = Math.floor(Math.random() * 256); // Nilai biru antara 0 dan 255
    return `rgb(${r}, ${g}, ${b})`;
  }

  const getData = async () => {
    try {
      setLoading(true);
      const uri = `${
        import.meta.env.VITE_PUBLIC_URI
      }/report/erp/Sales%20Analytics?filters={"tree_type":${JSON.stringify(
        type
      )},"doc_type":${JSON.stringify(baseOn)},"value_quantity":${JSON.stringify(
        valueQty
      )},"from_date":${JSON.stringify(
        fromDate.valueData
      )},"to_date":${JSON.stringify(
        toDate.valueData
      )},"company":"PT%20EKATUNGGAL%20TUNAS%20MANDIRI%20-%20BOGOR","range":${JSON.stringify(
        range
      )}}`;
      const result: any = await FetchApi.get(uri);
      const isData: any[] = result?.data?.data?.result;
      setColumn(result?.data?.data?.columns ?? []);
      setData(result?.data?.data ?? null);
      const isFilter = isData.filter(
        (item: any) => item.entity == "Area 1" || item.entity == "Area 2"
      );

      const getReport = isFilter.map((item: any) => {
        const params = Object.keys(item).filter(
          (i: any) => i !== "entity" && i !== "indent" && i !== "total"
        );

        let isGenData: number[] = [];

        for (const value of params) {
          isGenData = [...isGenData, item[value]];
        }

        return {
          label: item.entity,
          data: isGenData,
          borderColor: getRandomColor(),
          backgroundColor: getRandomColor(),
        };
      });

      setLabel(result?.data?.data?.chart?.data?.labels ?? []);
      setDataChart({
        labels: result?.data?.data?.chart?.data?.labels ?? [],
        datasets: getReport,
      });
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [type, baseOn, valueQty, range, fromDate, toDate]);

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
      // title: {
      //   display: true,
      //   text: "Omset",
      // },
    },

    scales: {
      x: {
        min: minChartIndex,
        max: maxChartIndex,
      },
      y: {
        grid: { borderDash: [10] },
      },
    },
  };

  console.log(data);

  return (
    <div className="rounded-sm w-full max-w-full h-auto border border-gray-200  bg-white m-3 pt-4 flex flex-col">
      {loading && <LoadingComponent />}

      {dataChart?.datasets && !loading && (
        <div className="w-full ">
          <ul className=" w-[calc(100%-80px)] float-left mx-8 my-1 border-b border-gray-100 mb-2">
            <li className="list-none float-left mr-2 w-[190px] -mb-2">
              <Select
                data={listType}
                value={type}
                setValue={setType}
                ClassName="w-full h-8 text-sm bg-[##f4f5f7] font-semibold"
              />
            </li>
            <li className="list-none float-left mr-2   w-[190px]  -mb-2 ">
              <Select
                data={listBaseOne}
                value={baseOn}
                setValue={setBaseOn}
                ClassName="w-full h-8 text-sm font-semibold bg-[##f4f5f7]"
              />
            </li>
            <li className="list-none float-left mr-2 w-[190px]   -mb-2 ">
              <Select
                data={listValueQty}
                value={valueQty}
                setValue={setValueQty}
                ClassName="w-full h-8 text-sm font-semibold bg-[##f4f5f7]"
              />
            </li>
            <li className="list-none float-left mr-2 w-[190px]   -mb-2">
              <Select
                data={listRange}
                value={range}
                setValue={setRange}
                ClassName="w-full h-8 text-sm font-semibold bg-[##f4f5f7]"
              />
            </li>
            <li className="list-none float-left mr-2 w-[190px] mb-2 mt-1">
              <InputComponent
                value={fromDate}
                onChange={(e) => setFromDate({ valueData: e, valueInput: e })}
                type="date"
                className="mb-2 h-8 font-semibold text-sm"
                inputStyle="font-semibold"
              />
            </li>
            <li className="list-none float-left mr-2 w-[190px] -mb-2 mt-1">
              <InputComponent
                value={toDate}
                onChange={(e) => setToDate({ valueData: e, valueInput: e })}
                type="date"
                className="mb-2 h-8 font-semibold text-sm"
                inputStyle="font-semibold"
              />
            </li>
          </ul>
          {/* <ArrowBackIosIcon
            onClick={() => {
              if (minChartIndex !== 0) {
                setMaxChartIndex(maxChartIndex - 1);
                setMinChartIndex(minChartIndex - 1);
              }
            }}
            className="absolute top-1/2 left-1 text-gray-400 ml-1 cursor-pointer hover:text-gray-600"
          /> */}

          <Line
            options={options}
            data={dataChart}
            className="m-5 ml-8 mt-0"
            height={50}
          />
          {/* <ArrowForwardIosIcon
            onClick={() => {
              if (maxChartIndex < labels.length) {
                setMaxChartIndex(maxChartIndex + 1);
                setMinChartIndex(minChartIndex + 1);
              }
            }}
            className="absolute top-1/2 right-1  text-gray-400  cursor-pointer hover:text-gray-600"
          /> */}
        </div>
      )}
      <div className="w-full border-red-200 border  overflow-auto h-[400px] ">
        <table className="w-auto overflow-auto">
          <thead>
            <tr className="text-sm font-medium">
              <th>
                <input
                  className="w-[14px] accent-slate-600 mt-1"
                  type="checkbox"
                  // onChange={(e) => handleAllChecked(e)}
                  // checked={selectAll}
                  // disabled={disabled ? true : false}
                />
              </th>
              {column.map((item: any, index: any) => (
                <th key={index}>{item.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data?.result.map((d: any, index: any) => (
              <tr key={index}>
                <td>
                  <input
                    className="w-[14px] accent-slate-600 mt-1"
                    type="checkbox"
                    // onChange={(e) => handleAllChecked(e)}
                    // checked={selectAll}
                    // disabled={disabled ? true : false}
                  />
                </td>
                {column.map((item: any, index: any) => {
                  return <td key={index} >{d[`${item.fieldname}`]}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!dataChart?.datasets && !loading && (
        <div className="w-full h-[200px]">No data</div>
      )}
    </div>
  );
};

export default ReportSalesAnalytic;

import React, { useEffect, useState, useRef } from "react";
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
  const [maxChartIndex, setMaxChartIndex] = useState<number>(12);
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
  const [selectedAll, setSelectedAll] = useState<boolean>(false);
  const [dataResult, setDataResult] = useState<any[]>([]);

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
      const isData: any[] = result?.data?.data?.result.map((item: any) => {
        return {
          active:
            item.entity === "Area 1" ||
            item.entity === "Area 2" ||
            item.entity === "All Customer Groups"
              ? true
              : false,
          ...item,
        };
      });

      setDataResult(isData);
      setColumn(result?.data?.data?.columns ?? []);
      setData(result?.data?.data ?? null);

      setLabel(result?.data?.data?.chart?.data?.labels ?? []);
      setDataChart({
        labels: result?.data?.data?.chart?.data?.labels ?? [],
        datasets: getReport(isData),
      });
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const getResultActive = (data: any[]) => {
    const isFilter = data.filter((item: any) => item.active);
    return isFilter;
  };

  useEffect(() => {
    getData();
  }, [type, baseOn, valueQty, range, fromDate, toDate]);

  const options: any = {
    // animations: {
    //   y: {
    //     easing: "easeInOutElastic",
    //     from: (ctx: any) => {
    //       if (ctx.type === "data") {
    //         if (ctx.mode === "default" && !ctx.dropped) {
    //           ctx.dropped = true;
    //           return 0;
    //         }
    //       }
    //     },
    //   },
    // },
    
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
      title: {
        display: true,
        text: "Report Penjualan",
      },
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

  const getReport = (data: any[]) => {
    const result = getResultActive(data).map((item: any) => {
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
        active: item.active,
      };
    });

    return result;
  };

  const FormatNumber = (number: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const handleAllChecked = (event: any) => {
    const result = dataResult.map((item: any) => {
      return { ...item, active: event.target.checked };
    });

    setDataResult(result);
    setDataChart({ ...dataChart, datasets: getReport(result) });
    setSelectedAll(event.target.checked);
  };

  const handleChange = (entity: string) => {
    const index = dataResult.findIndex((item) => item.entity === entity);

    const newData = [...dataResult];
    newData[index].active = !newData[index].active;
    setDataChart({ ...dataChart, datasets: getReport(newData) });

    if (getReport(newData).length === dataResult.length) {
      setSelectedAll(true);
    } else {
      setSelectedAll(false);
    }
  };

  if (data) {
    return (
      <div className=" rounded-sm w-[calc(100%-30px)] ml-[15px] h-auto border overflow-hidden border-gray-200  bg-white pt-4   my-2 float-left ">
        {loading && <LoadingComponent />}

        {!loading && (
          <div className="w-full float-left">
            <ul className=" w-[98%]  mx-[1%] my-1 border-b border-gray-100 mb-2">
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

            <Line
              options={options}
              data={dataChart}
              className="m-5 ml-8 mt-0"
              height={50}
            />
          </div>
        )}
        <div className="border w-full overflow-auto h-[260px]">
          <table
            className={`text-[0.95em]   table-auto border text-gray-800 border-separate border-spacing-0`}
          >
            <thead>
              <tr className="text-sm ">
                <th className="border px-3 sticky top-0 bg-white">
                  <input
                    className="w-[14px] accent-slate-600 mt-1"
                    type="checkbox"
                    onChange={(e) => handleAllChecked(e)}
                    checked={selectedAll}
                  />
                </th>
                {column.map((item: any, index: any) => (
                  <th
                    className="text-left px-3 border sticky top-0 bg-white"
                    key={index}
                  >
                    {item.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {dataResult.map((d: any, index: any) => (
                <tr key={index} className="bg-gray-50">
                  <td className="p-3">
                    <input
                      className="w-[14px] accent-slate-600 mt-1"
                      type="checkbox"
                      checked={d.active}
                      onChange={() => handleChange(d.entity)}
                    />
                  </td>
                  {column.map((item: any, index: any) => {
                    return (
                      <td
                        key={index}
                        style={{ width: `200px` }}
                        className="px-3 border"
                      >
                        {typeof d[`${item.fieldname}`] === "number"
                          ? FormatNumber(d[`${item.fieldname}`])
                          : d[`${item.fieldname}`]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  } else {
    return <>{loading && <LoadingComponent />}</>;
  }
};

export default ReportSalesAnalytic;

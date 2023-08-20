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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const ReportSalesAnalytic: React.FC<any> = () => {
  const [minChartIndex, setMinChartIndex] = useState<number>(0);
  const [maxChartIndex, setMaxChartIndex] = useState<number>(12);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  const getData = async () => {
    try {
      setLoading(true);
      const uri = `${
        import.meta.env.VITE_PUBLIC_URI
      }/report/erp/Sales%20Analytics?filters={"tree_type":"Customer%20Group","doc_type":"Sales%20Invoice","value_quantity":"Value","from_date":"2023-01-01","to_date":"2023-12-31","company":"PT%20EKATUNGGAL%20TUNAS%20MANDIRI%20-%20BOGOR","range":"Monthly"}`;
      const result: any = await FetchApi.get(uri);
      const isData: any[] = result?.data?.data?.result;
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
          borderColor: item.entity == "Area 1" ? "rgb(230, 113, 112)" : "gray",
          backgroundColor:
            item.entity == "Area 1" ? "rgb(230, 113, 112)" : "gray",
        };
      });

      setData({
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
  }, []);

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Omset",
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

  return (
    <div className="w-full p-2">
      {loading && <LoadingComponent />}

      {data?.datasets && !loading && <Line options={options} data={data} className="m-5 ml-8 mt-0" />}
      {!data?.datasets && !loading && (
        <div className="w-full h-[200px]">No data</div>
      )}
    </div>
  );
};

export default ReportSalesAnalytic;

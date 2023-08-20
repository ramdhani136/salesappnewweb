import { ReportSalesAnalytic } from "../components/organisme";
import { Meta } from "../utils";

const HomePage: React.FC = () => {
  const metaData = {
    title: "Home -  Stock Opname App Ekatunggal",
    description: "Halaman utama stock opname web system",
  };
  return (
    <>
      {Meta(metaData)}
      <div className="w-full h-full overflow-y-auto">
        <div className=" rounded-sm w-2/3 h-auto border border-gray-200  bg-white m-3 ">
          <h4 className="p-2 font-bold ml-3 text-lg">Sales Analytics</h4>
          <ReportSalesAnalytic />
        </div>
      </div>
    </>
  );
};

export default HomePage;

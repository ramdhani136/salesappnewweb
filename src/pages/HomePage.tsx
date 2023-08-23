import { ReportSalesAnalytic } from "../components/organisme";
import { Meta } from "../utils";

const HomePage: React.FC = () => {
  const metaData = {
    title: "Home -  Stock Opname App Ekatunggal",
    description: "Halaman utama stock opname web system",
  };
  return (
    <div className="w-full h-full overflow-y-auto flex flex-col   ">
      {Meta(metaData)}

      <div className=" w-full  h-auto">
        <ReportSalesAnalytic />
      </div>
    </div>
  );
};

export default HomePage;

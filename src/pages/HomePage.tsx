import { ReportSalesAnalytic } from "../components/organisme";
import { Meta } from "../utils";

const HomePage: React.FC = () => {
  const metaData = {
    title: "Home -  Sales App Ekatunggal",
    description: "Halaman utama sales app web system",
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

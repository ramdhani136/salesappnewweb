import React from "react";
import RiseLoader from "react-spinners/RiseLoader";
import LoadingBar from "react-top-loading-bar";

interface ILoading {
  showProgress?: IProgressInfo;
  animate?: Animate;
}

interface IProgressInfo {
  currentIndex: number;
  totalIndex: number;
  onProgress: String;
  currentPercent: number;
  active: boolean;
}

interface Animate {
  icon: any;
  size?: number;
  color?: String;
}

const LoadingComponent: React.FC<ILoading> = ({ showProgress, animate }) => {
  const Animated = animate?.icon;
  return (
    <>
      {showProgress && (
        <LoadingBar
          color="red"
          progress={showProgress.currentPercent}
          // onLoaderFinished={() => alert}
        />
      )}
      <div className="flex items-center justify-center flex-col   w-full h-[calc(100vh-150px)] ">
        <div className="w-full   flex justify-center items-center relative flex-col ">
          {Animated ? (
            <Animated
              color={animate.color ?? "#36d7b6"}
              loading={true}
              size={animate.size ?? 10}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          ) : (
            <RiseLoader
              color="#36d7b6"
              loading={true}
              // cssOverride={override}
              size={10}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          )}

          {showProgress?.active && (
            <>
              <h5 className="mt-4 text-[0.89em] font-normal  text-gray-500">
                progress {showProgress.currentIndex} Of{" "}
                {showProgress.totalIndex} (
                {showProgress.currentPercent.toFixed(2)}%)
              </h5>
              <h5 className="mt-1 text-[0.9em] font-medium  text-gray-500">
                {showProgress.onProgress}
              </h5>
            </>
          )}
          {/* <ReactLoading type="spin" color="#e5e7ef" />
        {progressInfo && (
          <h4 className="absolute text-[0.64em] italic text-gray-300">
            {currentPercent?.toFixed(2)}%
          </h4>
        )} */}
        </div>
      </div>
    </>
  );
};

export default LoadingComponent;

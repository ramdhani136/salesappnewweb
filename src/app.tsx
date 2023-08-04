import { Provider } from "react-redux";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { LayoutComponent } from "./components/organisme";
import {
  LoginPage,
  HomePage,
  SchedulePage,
  NotFoundPage,
  FormSchedulePage,
  ScheduleItemPage,
  UsersPage,
  RoleProfilePage,
  PackingIDPage,
  WorkflowPage,
} from "./pages";
import { store } from "./redux/Store";

const App: React.FC = () => {
  return (
    <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LayoutComponent Child={HomePage} />} />
        <Route
          path="/schedule"
          element={<LayoutComponent Child={SchedulePage} />}
        />
        <Route
          path="/users"
          element={<LayoutComponent Child={UsersPage} />}
        />
        <Route
          path="/roles"
          element={<LayoutComponent Child={RoleProfilePage} />}
        />
        <Route
          path="/workflow"
          element={<LayoutComponent Child={WorkflowPage} />}
        />
        <Route
          path="/packingid"
          element={<LayoutComponent Child={PackingIDPage} />}
        />
        <Route
          path="/schedule/:id"
          element={<LayoutComponent Child={FormSchedulePage} />}
        />
        <Route
          path={`/schedule/:scheduleId/:scheduleItem`}
          element={<LayoutComponent Child={ScheduleItemPage} />}
        />
        <Route
          path="/schedule/new"
          element={<LayoutComponent Child={FormSchedulePage} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    </Provider>
  );
};

export default App;

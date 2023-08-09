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
  CallsheetPage,
  FormCallsheetPage,
  VisitPage,
  FormVisitPage,
  FormUserPage,
  SettingPage,
  BranchPage,
  FormBranchPage,
  CustomerGroupPage,
  FormCustomerGroupPage,
  CustomerPage,
  FormCustomerPage,
  ContactPage,
  FormContactPage,
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
            path="/setting"
            element={<LayoutComponent Child={SettingPage} />}
          />
          <Route
            path="/callsheet"
            element={<LayoutComponent Child={CallsheetPage} />}
          />
          <Route
            path="/callsheet/new"
            element={<LayoutComponent Child={FormCallsheetPage} />}
          />
          <Route
            path="/callsheet/:id"
            element={<LayoutComponent Child={FormCallsheetPage} />}
          />
          <Route
            path="/visit"
            element={<LayoutComponent Child={VisitPage} />}
          />
          <Route
            path="/visit/:id"
            element={<LayoutComponent Child={FormVisitPage} />}
          />

          <Route
            path="/schedule"
            element={<LayoutComponent Child={SchedulePage} />}
          />
          <Route
            path="/schedule/:id"
            element={<LayoutComponent Child={FormSchedulePage} />}
          />
          <Route
            path="/schedule/new"
            element={<LayoutComponent Child={FormSchedulePage} />}
          />
          <Route
            path="/users"
            element={<LayoutComponent Child={UsersPage} />}
          />
          <Route
            path="/user/new"
            element={<LayoutComponent Child={FormUserPage} />}
          />
          <Route
            path="/user/:id"
            element={<LayoutComponent Child={FormUserPage} />}
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
            path="/branch"
            element={<LayoutComponent Child={BranchPage} />}
          />
          <Route
            path="/branch/:id"
            element={<LayoutComponent Child={FormBranchPage} />}
          />
          <Route
            path="/branch/new"
            element={<LayoutComponent Child={FormBranchPage} />}
          />
          <Route
            path="/customergroup"
            element={<LayoutComponent Child={CustomerGroupPage} />}
          />
          <Route
            path="/customergroup/:id"
            element={<LayoutComponent Child={FormCustomerGroupPage} />}
          />
          <Route
            path="/customergroup/new"
            element={<LayoutComponent Child={FormCustomerGroupPage} />}
          />
          <Route
            path="/customer"
            element={<LayoutComponent Child={CustomerPage} />}
          />
          <Route
            path="/customer/:id"
            element={<LayoutComponent Child={FormCustomerPage} />}
          />
          <Route
            path="/customer/new"
            element={<LayoutComponent Child={FormCustomerPage} />}
          />
          <Route
            path="/contact"
            element={<LayoutComponent Child={ContactPage} />}
          />
          <Route
            path="/contact/:id"
            element={<LayoutComponent Child={FormContactPage} />}
          />
          <Route
            path="/contact/new"
            element={<LayoutComponent Child={FormContactPage} />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;

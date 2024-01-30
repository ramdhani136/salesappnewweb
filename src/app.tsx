import { Provider } from "react-redux";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { LayoutComponent } from "./components/organisme";
import {
  LoginPage,
  HomePage,
  SchedulePage,
  NotFoundPage,
  FormSchedulePage,
  // ScheduleItemPage,
  UsersPage,
  RoleProfilePage,
  PackingIDPage,
  WorkflowPage,
  CallsheetPage,
  FormCallsheetPage,
  // VisitPage,
  // FormVisitPage,
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
  TopicPage,
  FormTopicPage,
  TagPage,
  FormTagPage,
  NamingSeriesPage,
  FormNamingSeriesPage,
  ReportPage,
  ReportNotesPage,
  ReportSchedulePage,
  VisitPage,
  FormVisitPage,
  MemoPage,
  FormMemoPage,
  WorkflowStatePage,
  FromWorkflowState,
  PermissionPage,
  FormPermissionPage,
  WorkflowActionPage,
  FormWorkflowAction,
  WhatsappQrViewPage,
  WhatsappAccountPage,
  WhatsappFlowChart,
  AssesmentSchedulePage,
  FormAssesmentSchedulePage,
  AssesmentPage,
  FormAssesmentPage,
  ReportAssesmentPage,
  FormAssesmentTemplatePage,
  AssesmentTemplatePage,
  AssesmentQuestionPage,
  FormAssesmentQuestionPage,
} from "./pages";
import { store } from "./redux/Store";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={<LayoutComponent Child={HomePage} sideBarWidth />}
          />
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
            path="/visit/new"
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
            path="/workflowstate"
            element={<LayoutComponent Child={WorkflowStatePage} />}
          />
          <Route
            path="/workflowstate/:id"
            element={<LayoutComponent Child={FromWorkflowState} />}
          />
          <Route
            path="/workflowstate/new"
            element={<LayoutComponent Child={FromWorkflowState} />}
          />
          <Route
            path="/workflowaction"
            element={<LayoutComponent Child={WorkflowActionPage} />}
          />
          <Route
            path="/workflowaction/:id"
            element={<LayoutComponent Child={FormWorkflowAction} />}
          />
          <Route
            path="/workflowaction/new"
            element={<LayoutComponent Child={FormWorkflowAction} />}
          />
          <Route path="/memo" element={<LayoutComponent Child={MemoPage} />} />
          <Route
            path="/memo/:id"
            element={<LayoutComponent Child={FormMemoPage} />}
          />
          <Route
            path="/memo/new"
            element={<LayoutComponent Child={FormMemoPage} />}
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
          <Route
            path="/topic"
            element={<LayoutComponent Child={TopicPage} />}
          />
          <Route
            path="/topic/:id"
            element={<LayoutComponent Child={FormTopicPage} />}
          />
          <Route
            path="/topic/new"
            element={<LayoutComponent Child={FormTopicPage} />}
          />
          <Route path="/tag" element={<LayoutComponent Child={TagPage} />} />
          <Route
            path="/tag/:id"
            element={<LayoutComponent Child={FormTagPage} />}
          />
          <Route
            path="/tag/new"
            element={<LayoutComponent Child={FormTagPage} />}
          />
          <Route
            path="/namingseries"
            element={<LayoutComponent Child={NamingSeriesPage} />}
          />
          <Route
            path="/namingseries/:id"
            element={<LayoutComponent Child={FormNamingSeriesPage} />}
          />
          <Route
            path="/namingseries/new"
            element={<LayoutComponent Child={FormNamingSeriesPage} />}
          />
          <Route
            path="/report"
            element={<LayoutComponent Child={ReportPage} />}
          />
          <Route
            path="/report/notes"
            element={<LayoutComponent Child={ReportNotesPage} />}
          />
          <Route
            path="/report/schedule"
            element={<LayoutComponent Child={ReportSchedulePage} />}
          />
          <Route
            path="/permission"
            element={<LayoutComponent Child={PermissionPage} />}
          />
          <Route
            path="/permission/:id"
            element={<LayoutComponent Child={FormPermissionPage} />}
          />
          <Route
            path="/permission/new"
            element={<LayoutComponent Child={FormPermissionPage} />}
          />
          {/* <Route
            path="/whatsapp/account"
            element={<LayoutComponent Child={WhatsappAccountPage} />}
          />
           <Route
            path="/coba"
            element={<LayoutComponent Child={WhatsappQrViewPage} />}
          /> */}
          {/* <Route
            path="/whatsapp/flowchart"
            element={<LayoutComponent Child={WhatsappFlowChart} />}
          /> */}
          <Route
            path="/assesment/schedule"
            element={<LayoutComponent Child={AssesmentSchedulePage} />}
          />
          <Route
            path="/assesment/schedule/new"
            element={<LayoutComponent Child={FormAssesmentSchedulePage} />}
          />
          <Route
            path="/assesment/schedule/:id"
            element={<LayoutComponent Child={FormAssesmentSchedulePage} />}
          />
          <Route
            path="/assesment"
            element={<LayoutComponent Child={AssesmentPage} />}
          />
          <Route
            path="/assesment/:id"
            element={<LayoutComponent Child={FormAssesmentPage} />}
          />
          <Route
            path="/report/assesment"
            element={<LayoutComponent Child={ReportAssesmentPage} />}
          />
          <Route
            path="/assesment/template"
            element={<LayoutComponent Child={AssesmentTemplatePage} />}
          />
          <Route
            path="/assesment/template/:id"
            element={<LayoutComponent Child={FormAssesmentTemplatePage} />}
          />
          <Route
            path="/assesment/template/new"
            element={<LayoutComponent Child={FormAssesmentTemplatePage} />}
          />
          <Route
            path="/assesment/question"
            element={<LayoutComponent Child={AssesmentQuestionPage} />}
          />
          <Route
            path="/assesment/question/:id"
            element={<LayoutComponent Child={FormAssesmentQuestionPage} />}
          />
          <Route
            path="/assesment/question/new"
            element={<LayoutComponent Child={FormAssesmentQuestionPage} />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;

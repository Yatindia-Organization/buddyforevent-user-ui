import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Router and Routes
import { Row } from "antd";
import GuestForm from "./GuestForm";
import AddUserForm from "./AddUserForm";

function App() {
  return (
    <Router>
      <Routes>
        {/* Define your routes */}
        <Route
          path="/guest/:id" // The dynamic path where `id` is the mobile number parameter
          element={
            <Row
              align={"middle"}
              justify="center"
              style={{
                minHeight: "100vh",
                width: "100vw",
                backgroundColor: "#f9fafb",
              }}
            >
              <GuestForm />
            </Row>
          }
        />

        <Route
          path="/" // The dynamic path where `id` is the mobile number parameter
          element={
            <Row
              align={"middle"}
              justify="center"
              style={{
                minHeight: "100vh",
                width: "100vw",
                backgroundColor: "#f9fafb",
              }}
            >
              <AddUserForm />
            </Row>
          }
        />
        {/* You can add more routes here if needed */}
      </Routes>
    </Router>
  );
}

export default App;
